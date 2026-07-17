import type { OnboardingPart } from "../types";

export const part9: OnboardingPart = {
  number: 9,
  slug: "running-the-business",
  title: "Running the Business",
  intro:
    "Coaching is the craft. This part is the engine room: your time, your money, and the numbers that tell you whether the business is actually working.",
  sections: [
    {
      heading: "Setting SMART goals for your business",
      body: [
        "A business without goals drifts. Specific, Measurable, Achievable, Relevant, Time-bound.",
        "A vague goal: 'I want to grow my business.' The same goal, SMART: 'Grow to 25 active clients on recurring coaching within six months, by booking two consults a week and asking every happy client for one referral.'",
      ],
      activities: [
        {
          key: "smart-goal-conversions",
          prompt: "Turn each of these into a SMART business goal: 'I want more clients.' / 'I want a better social media presence.' / 'I want better work-life balance.'",
          multiline: true,
        },
        { key: "short-and-long-term-goal", prompt: "Write one short-term goal (next 12 months) and one long-term goal (2-5 years) for your business.", multiline: true },
      ],
      workedExample:
        "Taylor's six-month goal: “Build to 22 active clients on recurring coaching by the end of the half, holding two evening blocks a week for my shift workers, and keeping monthly churn under one client.” Specific, measurable, and pointed at the income she actually wants.",
      managerNote:
        "Push for measurable and tied to recurring revenue or active clients, not vanity metrics like follower count. A goal you can't put a number against is a wish. Make sure their deadlines are real.",
    },
    {
      heading: "The four types of work",
      body: [
        "**In the business** (delivering for current clients): training sessions, writing programs, session follow-ups, admin.",
        "**On the business** (growing it): marketing, lead generation, networking, your own education.",
        "**Time for you**: your own training, rest, family and friends, anything that recharges you.",
        "**Garbage tasks**: inefficient travel, busywork, anything you could delegate.",
        "New PTs spend nearly all their time in the business and almost none on it — the on-the-business work is what stops you being fully booked one month and scrambling the next.",
      ],
      activities: [
        { key: "power-hours", prompt: "Work out your power hours. Are you a morning or evening person? Time-block or set-outcome worker? When are you sharpest?", multiline: true },
      ],
      managerNote:
        "The bucket new PTs neglect is ‘on the business’. They get busy training and the marketing stops, then in two months the pipeline is dry. Get them to protect a weekly block for it from day one.",
    },
    {
      heading: "Scheduling and time management",
      body: [
        "Lock recurring clients into consistent weekly slots first, fill gaps with newer clients, then protect time for programming, admin, your own training, and a life outside the gym.",
        "A sample perfect week chunks sessions into early-morning and early-evening blocks, keeps the middle of the day for programming/admin/personal training, and keeps weekends light.",
      ],
      activities: [
        {
          key: "perfect-week-plan",
          prompt: "Map out your own perfect week: client sessions, your own training, admin and programming, and personal time — Monday through Sunday.",
          multiline: true,
        },
      ],
      managerNote:
        "The mistake is letting the diary fill reactively, booking clients into whatever slot they ask for until the week is a patchwork. Coach them to set the blocks first, then offer clients the slots that exist.",
    },
    {
      heading: "Protecting your energy",
      body: [
        "Early starts, late finishes, other people's energy all day, and a business to run in the cracks. Set boundaries from day one and protect your recovery like you'd protect a client's.",
        "**Signs of burnout to watch for:** dreading sessions you used to look forward to, a shorter fuse with clients, tiredness a good sleep doesn't fix, letting your own training/food/recovery slide, admin piling up faster than you clear it, resenting clients for contacting you.",
        "**A word on imposter syndrome:** most new PTs feel like a fraud at some point. That feeling is normal, and it isn't evidence you're bad at your job. Competence comes from reps, not from waiting to feel ready. Lean on shadowing and your PT Manager.",
      ],
      activities: [
        { key: "energy-nonnegotiables", prompt: "What are your non-negotiables for protecting your energy? Think boundaries around hours, recovery, and time off.", multiline: true },
      ],
      managerNote:
        "Watch your PTs for the burnout signs above, especially in weeks 6 to 10 when the novelty wears off. Normalise imposter syndrome early so they don't read it as a sign they've chosen the wrong job. Remind them you're available any time, not just at shadowing.",
    },
    {
      heading: "Outsourcing: when and what",
      body: [
        "Ask: what could I drop entirely, what could I outsource, what do I genuinely need help with? Usual first candidates: admin (a VA for scheduling/invoicing), social media (someone to edit and schedule), bookkeeping (a bookkeeper or BAS agent).",
        "The test: work out what an hour of your coaching time is worth. If a task sits well below that and drains you, paying someone to do it usually pays for itself.",
      ],
      activities: [
        { key: "outsource-candidate", prompt: "What's one task you could hand off in the next three months, and who could do it?", multiline: true },
      ],
      workedExample:
        "Taylor outsources bookkeeping first. An hour of her coaching is worth far more than the bookkeeper's hourly fee, and tax time stops being a fortnight of dread. Social scheduling is next on her list once cash flow is steady.",
      managerNote:
        "PTs hold onto admin and bookkeeping far too long because handing it over feels like an expense, not an investment. Frame it against their effective hourly rate: an hour they claw back is an hour they can coach or rest.",
    },
    {
      heading: "Tracking your business health",
      body: [
        "Three sets of numbers, checked on different rhythms.",
        "**Sales metrics (weekly):** leads contacted, booked consults, consults reaching a sales chat, sign-ons. Orientation while building your book: contact 5-10 leads/week, turn about half into booked consults, sign roughly 4-6 of every 10 you sit down with.",
        "**Business metrics (weekly):** paid sessions delivered, active paying clients, recurring revenue, sessions per client (two a week is the default for meaningful progress). A PT ramping up builds toward 15-20 active clients in six months; established sits around 25-35 active clients and 20-30 sessions/week.",
        "**Experience metrics (monthly):** churn, average length of stay, referrals. Healthy is roughly: monthly churn under 5%, average stay 9-12+ months, a referral or two a month. A churn spike with falling referrals is an experience problem, not a marketing one.",
        "The Fitaz Business Health Tracker builds all three straight into a weekly log, monthly log, and a live dashboard against targets — use it rather than a spreadsheet from scratch.",
      ],
      activities: [
        { key: "business-health-tracking-plan", prompt: "Which numbers will you track each week and each month, and where will you keep them?", multiline: true },
      ],
      links: [
        {
          label: "Business Health Tracker (weekly/monthly logs + dashboard)",
          url: "https://docs.google.com/spreadsheets/d/1GmGjfPHrNKMN5W2rHipGdZ4H0pIzrZjBW8jVdpgrv08/edit",
        },
      ],
      managerNote:
        "Most new PTs obsess over the top of the funnel (chase more leads) when their real leak is the sales chat — use the weekly numbers to show them where they're actually losing people. The sessions-per-client number is the early-warning metric: a client quietly dropping from twice a week to once a fortnight rarely announces they're leaving, the frequency just fades. On churn, make sure they capture the why behind every cancellation, not just the number — a pattern of ‘too expensive’ is a value-framing problem, ‘got bored’ is a programming or community problem. Read churn alongside referrals before they conclude it's a marketing issue.",
    },
    {
      heading: "Reassessing your business model",
      body: [
        "At some point your workload stops working for you: fully booked and turning people away, exhausted, or income still isn't there. Four levers: **raise your rates** (set it, notify by email with notice — you don't renegotiate client by client), **cut expenses**, **reduce your load**, **bring on help**.",
      ],
      activities: [
        { key: "reassess-signal-and-lever", prompt: "What will be your signal that it's time to reassess, and which lever would you pull first?", multiline: true },
      ],
      workedExample:
        "Taylor hits fully booked with a waitlist forming. Rather than cram in more hours, she lifts her rate, emails existing clients four weeks out with a warm, clear note, and starts new clients at the higher price. She loses one client, nets more income, and gets her evenings back.",
      managerNote:
        "The most common issue by a mile is undercharging, not overwork. PTs are terrified a rate rise will empty their book. Reassure them: in a subscription model continuation is the default, so a well-communicated rise loses very few clients and the ones who stay are worth more. Coach them through the email rather than letting them avoid it.",
    },
    {
      heading: "Your Fitaz Gym commercial terms, at a glance",
      body: [
        "The actual, current numbers from your PT contract — plug your own figures into Part 3's setup snapshot, this is the reference copy.",
        "- **Weekly rent:** $275.00 incl. GST, capped regardless of session volume, paid weekly in advance by direct debit.",
        "- **Bond:** 2 weeks' rent, non-refundable, paid on execution.",
        "- **Business Pack:** $550 incl. GST — uniform, professional photos, 1000 flyers, profile + website listing, 4× 1-on-1 with Georgio (marketing/Xero setup), 4× 1-on-1 with your PT Manager during onboarding.",
        "- **Onboarding rent ramp:** weeks 1-3 rent-free, weeks 4-6 at 25%, weeks 7-9 at 50%, weeks 10-12 at 75%, full rent from week 13.",
        "- **Loyalty rent reduction:** $275/wk in years 0-2, $250/wk in years 2-5, $225/wk at 5+ years.",
        "- **Minimum term:** 12 months from commencement. **Notice to terminate** after that: 90 days written notice.",
        "- **Restraint:** 6-month non-compete within 5km of 101 Main St, Kangaroo Point; 12-month non-solicitation of clients, suppliers and staff.",
        "This is a plain-English summary for quick reference — your signed contract is always the source of truth if the two ever seem to differ.",
      ],
      links: [
        {
          label: "Your PT contract (master template)",
          url: "https://drive.google.com/file/d/1OzqRh_POJ734aRpcYSflh0eo286GCKcP/view",
        },
        {
          label: "PT On-boarding Checklist",
          url: "https://drive.google.com/file/d/1mUElvNI8Oh1EwGkrqRJzx89BqVFBABK2/view",
        },
      ],
      managerNote:
        "This summary is drawn from the March 2026 master contract template. If a specific trainer signed an earlier or amended version, their signed schedule overrides this reference card — check their actual Schedule A before relying on figures here in a live conversation with them.",
    },
  ],
};
