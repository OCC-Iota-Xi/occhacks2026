"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, QrCode, Search, Undo2, X } from "lucide-react";
import Scanner from "@/components/admin/checkin/Scanner";
import { useToast } from "@/components/admin/Toast";
import { AttendanceBadge, Empty, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  checkIn,
  setCheckedIn,
  type CheckInPerson,
  type CheckInResult,
} from "@/lib/admin/actions";
import { displayName, formatDateTime, initials } from "@/lib/admin/format";
import { ATTENDANCE_LABEL, STATUS_LABEL, type Applicant } from "@/lib/admin/types";
import { matchesBackupCode, parseCheckInCode } from "@/lib/checkin";
import { cn } from "@/lib/utils";

/** Someone the page was opened on, by a phone camera following a code's link. */
export interface Arrival {
  id: string;
  /** Null when the code isn't an applicant's. */
  person: CheckInPerson | null;
  checkedInAt: string | null;
}

interface Queued {
  id: string;
  name: string;
}

/** The one thing the desk is being told right now, shown above the list. */
type Card =
  | { kind: "working"; id: string; name: string | null }
  /** Arrived by link: nothing has happened yet, it takes a tap. */
  | { kind: "ready"; person: CheckInPerson }
  | { kind: "result"; id: string; result: CheckInResult }
  /** No answer from the server; kept on this device and retried. */
  | { kind: "queued"; id: string; name: string }
  /** No answer from the server, and nothing here to say they're expected. */
  | { kind: "unverified"; id: string }
  | { kind: "unreadable" };

const QUEUE_KEY = "occhacks:checkin-queue";
/** Long enough for slow wifi, short enough that the line doesn't stall on it. */
const CALL_TIMEOUT = 10_000;
const RETRY_EVERY = 5_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function isExpected(person: { status: string; attendance: string }) {
  return person.status === "accepted" && person.attendance === "confirmed";
}

function arrivalCard(arrival: Arrival | undefined): Card | null {
  if (!arrival) return null;
  const { id, person, checkedInAt } = arrival;
  if (!person) return { kind: "result", id, result: { outcome: "not_found" } };
  if (checkedInAt) return { kind: "result", id, result: { outcome: "already", person, at: checkedInAt } };
  return { kind: "ready", person };
}

/**
 * The desk on the morning of the event.
 *
 * Three ways to find someone, each a fallback for the one before: scan the QR
 * on their status page with this page's camera; scan it with the phone's own
 * camera, which opens this page on them (`arrival`); or search the list by
 * name, email, student ID or the backup code under their QR.
 *
 * The whole expected list is already on the page, so finding someone never
 * needs the network. Recording the check-in does, and when the venue wifi
 * doesn't answer the check-in is kept on this device and retried until it
 * lands — the server treats a repeat as "already checked in", so retrying is
 * always safe.
 */
export default function CheckInBoard({
  expected,
  arrival,
}: {
  expected: Applicant[];
  arrival?: Arrival;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [term, setTerm] = useState("");
  const [scanning, setScanning] = useState(false);
  const [card, setCard] = useState<Card | null>(() => arrivalCard(arrival));
  const [pending, startTransition] = useTransition();

  // The queue is read by a timer as well as by render, so it lives in a ref
  // with state mirroring it for display.
  const [queue, setQueue] = useState<Queued[]>([]);
  const [queueProblem, setQueueProblem] = useState<string | null>(null);
  const queueRef = useRef<Queued[]>([]);
  const flushing = useRef(false);
  const busy = useRef<string | null>(null);

  const saveQueue = useCallback((next: Queued[]) => {
    queueRef.current = next;
    setQueue(next);
    try {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
    } catch {
      // Still held in memory; it only won't survive a reload.
    }
  }, []);

  // Anything left unsent by a reload or a closed tab is picked back up.
  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]") as Queued[];
      if (Array.isArray(stored) && stored.length) {
        queueRef.current = stored;
        // Reading a browser store on mount is exactly what an effect is for;
        // the rule can't tell this apart from a render-triggering cascade.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQueue(stored);
      }
    } catch {
      // Nothing readable was saved.
    }
  }, []);

  const flush = useCallback(async () => {
    if (flushing.current || !queueRef.current.length) return;
    flushing.current = true;
    let synced = false;
    try {
      for (const item of [...queueRef.current]) {
        let result: CheckInResult;
        try {
          // Forced: whoever queued it had already decided to let them in.
          result = await withTimeout(checkIn(item.id, { force: true }), CALL_TIMEOUT);
        } catch {
          break; // Still no connection; the timer comes back to it.
        }
        if (result.outcome === "error") {
          setQueueProblem(result.message);
          break;
        }
        setQueueProblem(null);
        saveQueue(queueRef.current.filter((queued) => queued.id !== item.id));
        synced = true;
      }
    } finally {
      flushing.current = false;
      if (synced) router.refresh();
    }
  }, [router, saveQueue]);

  const waiting = queue.length > 0;
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(flush, RETRY_EVERY);
    window.addEventListener("online", flush);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", flush);
    };
  }, [waiting, flush]);

  const submit = useCallback(
    async (id: string, force = false) => {
      if (busy.current === id) return;
      busy.current = id;

      const local = expected.find((applicant) => applicant.id === id);
      const name = local ? displayName(local) : null;
      setCard({ kind: "working", id, name });

      try {
        const result = await withTimeout(checkIn(id, { force }), CALL_TIMEOUT);
        setCard({ kind: "result", id, result });
        if (result.outcome === "checked_in") {
          // Not on iOS, where the card turning green has to do.
          if (typeof navigator.vibrate === "function") navigator.vibrate(80);
          saveQueue(queueRef.current.filter((queued) => queued.id !== id));
        }
        if (result.outcome === "checked_in" || result.outcome === "already") router.refresh();
      } catch {
        // No answer. If the list on this page says they're expected (or the
        // organizer has already overridden), let them in and settle up later.
        if (force || (local && isExpected(local))) {
          const queued = { id, name: name ?? "Attendee" };
          saveQueue([...queueRef.current.filter((item) => item.id !== id), queued]);
          setCard({ kind: "queued", ...queued });
        } else {
          setCard({ kind: "unverified", id });
        }
      } finally {
        busy.current = null;
      }
    },
    [expected, router, saveQueue]
  );

  const onRead = useCallback(
    (text: string) => {
      const id = parseCheckInCode(text);
      if (id) submit(id);
      else setCard({ kind: "unreadable" });
    },
    [submit]
  );

  const undo = (id: string, name: string) =>
    startTransition(async () => {
      try {
        const result = await setCheckedIn([id], false);
        if (result.ok) {
          toast(`Check-in undone for ${name}`);
          setCard((current) => (current && "id" in current && current.id === id ? null : current));
          router.refresh();
        } else {
          toast(result.message ?? "Could not undo the check-in.", "error");
        }
      } catch {
        toast("No connection. The check-in was not undone.", "error");
      }
    });

  const needle = term.trim().toLowerCase();
  const rows = useMemo(() => {
    if (!needle) return expected;
    return expected.filter(
      (applicant) =>
        matchesBackupCode(applicant.id, needle) ||
        [applicant.full_name, applicant.email, applicant.school, applicant.occ_id]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle))
    );
  }, [expected, needle]);

  const queuedIds = useMemo(() => new Set(queue.map((item) => item.id)), [queue]);
  const checkedIn = expected.filter((applicant) => applicant.checked_in).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-[14rem] flex-1 items-center gap-2 rounded-lg border border-border px-3 focus-within:border-[var(--ring)]/50">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Name, email, school, student ID, or backup code"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button
          variant={scanning ? "outline" : "default"}
          onClick={() => setScanning((open) => !open)}
        >
          {scanning ? <X className="size-4" /> : <QrCode className="size-4" />}
          {scanning ? "Close scanner" : "Scan QR"}
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {checkedIn} of {expected.length} checked in
        </span>
      </div>

      {waiting && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          <span>
            {queue.length === 1 ? "1 check-in is" : `${queue.length} check-ins are`} saved on
            this device and will send when the connection is back. Keep this page open.
            {queueProblem && <span className="block text-amber-100">{queueProblem}</span>}
          </span>
          <Button size="xs" variant="outline" onClick={flush}>
            Send now
          </Button>
        </div>
      )}

      {scanning && <Scanner onRead={onRead} />}

      {card && (
        <ResultCard
          card={card}
          pending={pending}
          onDismiss={() => setCard(null)}
          onCheckIn={submit}
          onUndo={undo}
        />
      )}

      {rows.length ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/40">
          {rows.map((applicant) => (
            <li
              key={applicant.id}
              className={cn(
                "flex flex-wrap items-center gap-3 px-3 py-2.5",
                applicant.checked_in && "bg-emerald-400/[0.04]"
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
                {initials(applicant.full_name)}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/applicants/${applicant.id}`}
                  className="text-sm hover:text-[var(--ring)]"
                >
                  {displayName(applicant)}
                </Link>
                <div className="truncate text-xs text-muted-foreground">
                  {[applicant.school, applicant.email].filter(Boolean).join(" · ")}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={applicant.status} />
                <AttendanceBadge attendance={applicant.attendance} />
                {applicant.shirt && (
                  <span className="rounded-md border border-border px-1.5 py-0.5 text-xs uppercase">
                    {applicant.shirt}
                  </span>
                )}
                {applicant.needs && (
                  <span
                    title={applicant.needs}
                    className="rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-xs text-amber-200"
                  >
                    Needs
                  </span>
                )}
              </div>

              {applicant.checked_in ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-300">
                    {formatDateTime(applicant.checked_in_at)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => undo(applicant.id, displayName(applicant))}
                  >
                    <Undo2 className="size-3.5" />
                    Undo
                  </Button>
                </div>
              ) : queuedIds.has(applicant.id) ? (
                <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-xs text-amber-200">
                  Waiting to send
                </span>
              ) : (
                <Button size="sm" onClick={() => submit(applicant.id)}>
                  <Check className="size-3.5" />
                  Check in
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          title={needle ? "Nobody matches that" : "Nobody is expected yet"}
          hint={
            needle
              ? "Try their email, or check the applicant list for someone who wasn't accepted."
              : "This fills in as accepted applicants confirm their attendance."
          }
        />
      )}
    </div>
  );
}

const TONE = {
  good: "border-emerald-400/30 bg-emerald-400/10",
  warn: "border-amber-400/30 bg-amber-400/10",
  bad: "border-rose-400/30 bg-rose-400/10",
  plain: "border-border bg-card/40",
} as const;

/**
 * Sized to be read at arm's length while holding a phone up to someone else's:
 * the colour answers "can they go in", the name confirms who, and the rest is
 * there for whoever looks twice.
 */
function ResultCard({
  card,
  pending,
  onDismiss,
  onCheckIn,
  onUndo,
}: {
  card: Card;
  pending: boolean;
  onDismiss: () => void;
  onCheckIn: (id: string, force?: boolean) => void;
  onUndo: (id: string, name: string) => void;
}) {
  let tone: keyof typeof TONE = "plain";
  let title: string;
  let detail: string;
  let person: CheckInPerson | null = null;
  let action: React.ReactNode = null;

  const anyway = (id: string) => (
    <Button size="sm" variant="outline" onClick={() => onCheckIn(id, true)}>
      Check in anyway
    </Button>
  );
  const undo = (target: CheckInPerson) => (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => onUndo(target.id, target.name)}
    >
      <Undo2 className="size-3.5" />
      Undo
    </Button>
  );
  const standing = (target: CheckInPerson) =>
    `Application ${STATUS_LABEL[target.status].toLowerCase()}, attendance ${ATTENDANCE_LABEL[
      target.attendance
    ].toLowerCase()}.`;

  if (card.kind === "working") {
    title = card.name ?? "Checking in";
    detail = "Checking in…";
  } else if (card.kind === "ready") {
    person = card.person;
    title = person.name;
    if (isExpected(person)) {
      detail = "Confirmed and not checked in yet.";
      action = (
        <Button size="sm" onClick={() => onCheckIn(card.person.id)}>
          <Check className="size-3.5" />
          Check in
        </Button>
      );
    } else {
      tone = "bad";
      detail = `Not confirmed. ${standing(person)}`;
      action = anyway(person.id);
    }
  } else if (card.kind === "queued") {
    tone = "warn";
    title = card.name;
    detail = "Let them in. No connection, so this is saved here and will send by itself.";
  } else if (card.kind === "unverified") {
    tone = "bad";
    title = "Can't check this code";
    detail =
      "No connection, and they aren't on the confirmed list loaded on this page. Try again, or check them in anyway if you know they're cleared.";
    action = (
      <>
        <Button size="sm" variant="outline" onClick={() => onCheckIn(card.id)}>
          Try again
        </Button>
        {anyway(card.id)}
      </>
    );
  } else if (card.kind === "unreadable") {
    tone = "bad";
    title = "Not a check-in code";
    detail = "That QR isn't from an OCC Hacks status page.";
  } else {
    const { result } = card;
    if (result.outcome === "checked_in") {
      tone = "good";
      person = result.person;
      title = person.name;
      detail = `Checked in ${formatDateTime(result.at)}`;
      action = undo(person);
    } else if (result.outcome === "already") {
      tone = "warn";
      person = result.person;
      title = person.name;
      detail = `Already checked in ${formatDateTime(result.at)}`;
      action = undo(person);
    } else if (result.outcome === "not_confirmed") {
      tone = "bad";
      person = result.person;
      title = person.name;
      detail = `Not confirmed. ${standing(person)}`;
      action = anyway(person.id);
    } else if (result.outcome === "not_found") {
      tone = "bad";
      title = "No applicant has this code";
      detail = "Search for them by name instead.";
    } else {
      tone = "bad";
      title = "That didn't go through";
      detail = result.message;
      action = (
        <Button size="sm" variant="outline" onClick={() => onCheckIn(card.id)}>
          Try again
        </Button>
      );
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3", TONE[tone])}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-foreground/80">{detail}</p>
        {person && (person.shirt || person.needs) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {[person.shirt && `Shirt ${person.shirt.toUpperCase()}`, person.needs && `Needs: ${person.needs}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {person && (
          <Link
            href={`/admin/applicants/${person.id}`}
            className="mt-1 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-[var(--ring)] hover:underline"
          >
            Open profile
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {action}
        <Button size="icon-sm" variant="ghost" aria-label="Dismiss" onClick={onDismiss}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
