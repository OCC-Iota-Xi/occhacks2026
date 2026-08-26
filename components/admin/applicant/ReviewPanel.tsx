"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { Score } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { deleteReview, saveReview } from "@/lib/admin/actions";
import { formatDate } from "@/lib/admin/format";
import { REVIEW_CRITERIA, type AdminUser, type Review } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * Scoring, and everyone else's scores.
 *
 * One review per organizer per applicant, so the form is an edit of your own
 * row rather than an append — coming back to change your mind should not leave
 * two contradictory reviews behind. The average shown is across organizers, and
 * the individual scores stay visible next to it: an average of 3 built from a 5
 * and a 1 is a conversation, not a number.
 */
export default function ReviewPanel({
  applicantId,
  reviews,
  ownReview,
  viewerId,
  admins,
}: {
  applicantId: string;
  reviews: Review[];
  ownReview: Review | null;
  viewerId: string;
  admins: AdminUser[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      REVIEW_CRITERIA.map(({ key }) => [key, ownReview ? (ownReview[key] as number) : 0])
    )
  );
  const [comment, setComment] = useState(ownReview?.comment ?? "");

  const others = reviews.filter((review) => review.reviewer_id !== viewerId);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.overall), 0) / reviews.length
    : null;

  const complete = REVIEW_CRITERIA.every(({ key }) => scores[key] >= 1);
  const preview = complete
    ? REVIEW_CRITERIA.reduce((sum, { key }) => sum + scores[key], 0) / REVIEW_CRITERIA.length
    : null;

  const submit = () =>
    startTransition(async () => {
      const result = await saveReview({ applicantId, scores, comment });
      if (result.ok) {
        toast(ownReview ? "Review updated" : "Review saved");
        router.refresh();
      } else {
        toast(result.message ?? "Could not save that review.", "error");
      }
    });

  const reviewerName = (id: string) => {
    const admin = admins.find((a) => a.user_id === id);
    return admin?.display_name ?? admin?.email ?? "Organizer";
  };

  return (
    <div className="space-y-4 px-4 py-3">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-2xl tabular-nums">
            {average == null ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <Score value={Number(average.toFixed(2))} />
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </div>
        </div>
        {others.length > 0 && (
          <ul className="flex-1 space-y-1 text-xs">
            {others.map((review) => (
              <li key={review.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {reviewerName(review.reviewer_id)}
                </span>
                <Score value={Number(review.overall)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {others.some((review) => review.comment) && (
        <ul className="space-y-2 border-t border-border pt-3">
          {others
            .filter((review) => review.comment)
            .map((review) => (
              <li key={`comment-${review.id}`} className="text-xs">
                <span className="text-muted-foreground">
                  {reviewerName(review.reviewer_id)} · {formatDate(review.created_at)}
                </span>
                <p className="mt-0.5 whitespace-pre-wrap text-foreground">{review.comment}</p>
              </li>
            ))}
        </ul>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        {REVIEW_CRITERIA.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScores({ ...scores, [key]: value })}
                  aria-label={`${label}: ${value}`}
                  className={cn(
                    "size-6 rounded-md border text-xs tabular-nums transition-colors",
                    scores[key] === value
                      ? "border-[var(--ring)] bg-[var(--ring)]/15 text-[var(--ring)]"
                      : "border-border text-muted-foreground hover:border-[var(--ring)]/40"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          placeholder="Optional note for the other organizers"
          className="w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-xs outline-none focus:border-[var(--ring)]/50"
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {preview == null ? "Score all five to save" : `Overall ${preview.toFixed(2)}/5`}
          </span>
          <div className="flex gap-1.5">
            {ownReview && (
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteReview(ownReview.id);
                    if (result.ok) {
                      toast("Review removed");
                      setScores(Object.fromEntries(REVIEW_CRITERIA.map(({ key }) => [key, 0])));
                      setComment("");
                      router.refresh();
                    } else {
                      toast(result.message ?? "Could not remove that review.", "error");
                    }
                  })
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
            <Button size="sm" disabled={!complete || pending} onClick={submit}>
              {ownReview ? "Update review" : "Save review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
