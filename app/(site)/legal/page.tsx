import type { Metadata } from "next";
import LegalPage, { A, Clause, Doc, List, P } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy & Terms — OCC Hacks 2026",
  description:
    "What OCC Hacks collects when you sign in and register, and the terms for taking part in the event.",
};

export default function LegalRoute() {
  return (
    <LegalPage plain="Privacy &" accent="Terms" updated="August 26, 2026">
      <Doc id="privacy" plain="Privacy" accent="Policy">
        <P>
          OCC Hacks 2026 is a student hackathon organized by the Iota Xi (ΙΞ) Society at
          Orange Coast College in Costa Mesa, California. This page explains what we collect
          through <A href="https://occhacks.com">occhacks.com</A>, why, and what you can ask
          us to do with it. We collect what we need to run the event and nothing beyond it —
          we do not sell your information or use it for advertising.
        </P>

        <Clause heading="1. Signing in">
          <P>
            Accounts are created by signing in with Google or GitHub. We receive your name,
            email address, and profile picture from whichever you use. We never see or store
            your password.
          </P>
        </Clause>

        <Clause heading="2. What you tell us on the forms">
          <P>If you register as a hacker, we ask for:</P>
          <List>
            <li>Your name, email address, and phone number</li>
            <li>Your date of birth, which we use only to confirm you are 18 or older</li>
            <li>Your school, major, OCC student ID, and the OCC classes you are enrolled in</li>
            <li>Whether you are an Iota Xi member</li>
            <li>Your shirt size</li>
            <li>Any accessibility or dietary needs you choose to share</li>
            <li>How you rank the three project tracks</li>
            <li>Your agreement to the eligibility statement and code of conduct</li>
          </List>
          <P>
            If you sign up to volunteer or mentor, we ask for your name, email, phone, date of
            birth, availability, areas of expertise, shirt size, and any accessibility or
            dietary needs. Volunteers are also asked for an OCC student ID. Mentors are asked
            why they want to mentor and may optionally upload a résumé as a PDF.
          </P>
          <P>
            The forms save as you go, so a partly finished sign-up is stored before you
            submit it. A copy of your in-progress answers is also kept in your own browser so
            a closed tab does not lose your work — that copy stays on your device and is
            cleared when you submit.
          </P>
        </Clause>

        <Clause heading="3. Notify list">
          <P>
            If you ask to be notified when registration opens, we store only the email address
            you give us, and use it only for that announcement.
          </P>
        </Clause>

        <Clause heading="4. Records organizers create">
          <P>
            While reviewing sign-ups, organizers record an application status, review
            decisions, tags, and internal notes about each applicant. These are our own
            records rather than something you submit, and you can ask to see what we hold
            about you.
          </P>
        </Clause>

        <Clause heading="5. Analytics">
          <P>
            We use PostHog to understand how the site is used — page views, interactions such
            as which buttons are clicked and how far through registration people get, and
            browser error reports. This is tied to your account once you sign in, so we can
            tell a stuck registration from an abandoned one.
          </P>
        </Clause>

        <Clause heading="6. Why we use it">
          <P>
            To run the event: confirming you are eligible, sizing shirts, ordering food,
            arranging accessibility, matching mentors to teams, reviewing applications, and
            emailing you about your sign-up and the event itself. We also use analytics to
            find and fix problems with the site.
          </P>
        </Clause>

        <Clause heading="7. How long we keep it">
          <P>
            Registration and sign-up records are kept through the event and for up to one year
            afterwards, so we can answer questions and plan the next one. Résumés are deleted
            within 90 days of the event. Ask us sooner and we will remove yours.
          </P>
        </Clause>

        <Clause heading="8. Your choices">
          <P>
            You can ask us for a copy of what we hold about you, ask us to correct it, or ask
            us to delete it and your account — email{" "}
            <A href="mailto:ix@occ.cccd.edu">ix@occ.cccd.edu</A> and we will act within
            30 days. Deleting your registration before the event means we cannot admit you,
            but you are free to sign up again.
          </P>
          <P>
            Every email we send about the event has an unsubscribe link. Emails about your own
            sign-up — a confirmation, or a decision on your application — are sent regardless,
            because you asked us for them.
          </P>
        </Clause>

        <Clause heading="9. Security">
          <P>
            Your registration is readable only by you and by event organizers. The database
            enforces this per row rather than trusting the site to check, so another signed-in
            user cannot read your answers even if a page were to ask for them. No system is
            perfect, and we will tell affected participants promptly if we learn of a breach.
          </P>
        </Clause>

        <Clause heading="10. Age">
          <P>
            OCC Hacks is open to college students aged 18 and over. The site is not intended
            for anyone under 18, and we do not knowingly collect information from them. If you
            believe a minor has signed up, email us and we will remove the record.
          </P>
        </Clause>
      </Doc>

      <Doc id="terms" plain="Terms of" accent="Service">
        <P>
          These terms cover <A href="https://occhacks.com">occhacks.com</A> and taking part in
          OCC Hacks 2026, organized by the Iota Xi (ΙΞ) Society at Orange Coast College. By
          registering you agree to them. If you do not, please do not sign up.
        </P>

        <Clause heading="1. Who can take part">
          <P>
            Hackers must be 18 or older and currently enrolled college students. Volunteer and
            mentor sign-ups are open to anyone 18 or older. We may ask for proof of enrollment
            or age at check-in, and we cannot admit you without it.
          </P>
        </Clause>

        <Clause heading="2. Registering">
          <P>
            Answer honestly and completely — we plan food, shirts, accessibility, and team
            formation from what you tell us. One registration per person. Registering does not
            guarantee a place: the venue holds a limited number of hackers, and we review
            sign-ups and will tell you by email where you stand.
          </P>
          <P>
            You are responsible for what happens under your account. Tell us if you think
            someone else has access to it.
          </P>
        </Clause>

        <Clause heading="3. Code of conduct">
          <P>
            Everyone at OCC Hacks — participants, volunteers, mentors, judges, and organizers
            — is expected to be respectful. We do not tolerate harassment, discrimination,
            intimidation, or any behavior that makes the event unwelcoming. Orange Coast
            College&apos;s own student conduct rules apply on campus alongside these terms.
          </P>
          <P>
            Organizers may remove anyone from the event, without a refund of anything and
            without notice, for breaking these rules. Report a problem to any organizer in
            person or at <A href="mailto:ix@occ.cccd.edu">ix@occ.cccd.edu</A>.
          </P>
        </Clause>

        <Clause heading="4. Your project">
          <P>
            What you build is yours. We claim no ownership of your code, designs, or ideas. In
            exchange, by submitting a project you allow us to show it — a demo, screenshots,
            your team name, and a description — when presenting and promoting the event.
          </P>
          <P>Projects must:</P>
          <List>
            <li>Be built during the event, though you may use open-source libraries and public APIs</li>
            <li>Be work you have the right to submit</li>
            <li>Be submitted before the deadline announced at the event</li>
          </List>
          <P>
            Judging is at the discretion of our judges, and their decisions are final. We may
            disqualify a project that breaks these rules or the code of conduct.
          </P>
        </Clause>

        <Clause heading="5. Prizes">
          <P>
            Prizes announced for the event are awarded as described at the time. Winners may
            need to give us information to receive a prize, and are responsible for any taxes
            on it. If a prize becomes unavailable we may substitute one of similar value.
          </P>
        </Clause>

        <Clause heading="6. The event itself">
          <P>
            Entry is free. We may change the schedule, venue, tracks, capacity, or prizes, and
            in the worst case cancel or postpone the event. We will tell registered
            participants by email as soon as we can. You are responsible for your own travel
            and your own belongings — bring your laptop and charger, and keep an eye on them.
          </P>
        </Clause>

        <Clause heading="7. The site">
          <P>
            Do not attempt to break into, disrupt, scrape, or overload the site, or to access
            anyone else&apos;s registration. We may suspend an account for any of these.
          </P>
          <P>
            The site is provided as it is. We work to keep it accurate and available but do
            not promise it will be uninterrupted or error-free.
          </P>
        </Clause>

        <Clause heading="8. Liability">
          <P>
            You take part at your own risk. To the fullest extent the law allows, the
            organizers, the Iota Xi Society, and Orange Coast College are not liable for
            injury, loss, or damage arising from your participation or your use of this site,
            except where that liability cannot be excluded.
          </P>
        </Clause>

        <Clause heading="9. Privacy">
          <P>
            Our <A href="#privacy">Privacy Policy</A> explains what we collect and how we
            handle it, and forms part of these terms.
          </P>
        </Clause>

        <Clause heading="10. Changes and contact">
          <P>
            These terms are governed by the laws of the State of California. If we change
            them, the date at the top of this page changes, and we will email registered
            participants about anything significant. Questions go to{" "}
            <A href="mailto:ix@occ.cccd.edu">ix@occ.cccd.edu</A>.
          </P>
        </Clause>
      </Doc>
    </LegalPage>
  );
}
