import type { OnboardingPart } from "../types";

export const part8: OnboardingPart = {
  number: 8,
  slug: "keeping-clients",
  title: "Keeping Clients",
  intro: "Anyone can sign a client. Keeping them is where the business actually gets built.",
  sections: [
    {
      heading: "The rule of 90 days",
      body: [
        "The first 90 days with a new client are the highest-risk stretch of the whole relationship. If a client leaves inside 90 days, it's almost always because the gap between what they expected and what they experienced got too wide. If they stay past 90 days, they tend to stay a lot longer.",
        "Four things move the needle: realistic goals set in the consult, early wins they can actually feel, consistent communication between sessions, and showing up like you're genuinely invested. This window covers steps 8-10 of the client journey: Onboarding, Regular Training, and Check-Ins.",
      ],
      activities: [
        { key: "first-90-days-actions", prompt: "What will you do in a new client's first 90 days to lock in the relationship? List three concrete actions.", multiline: true },
      ],
    },
    {
      heading: "Delivering a high-quality experience",
      body: [
        "Retention starts with the thing you actually control: the session itself. Three levers do most of the work: **Personalisation** (built for them, adjusted as they evolve), **Variety** (swap something every 4-6 weeks), **Presence** (full attention, no phone, remember what they told you last week).",
      ],
      activities: [
        { key: "session-quality-lifts", prompt: "List three ways you'll lift the quality of your sessions.", multiline: true },
      ],
    },
    {
      heading: "Communicate regularly",
      body: [
        "A quick weekly check-in keeps motivation up and catches problems before they harden into reasons to quit. A good check-in celebrates a win, gives one useful tip, and opens the door for them to tell you what's actually going on.",
        "“Hi Mel, solid week. Your deadlift set-up looked sharp on Thursday. How are the legs pulling up? Anything you want to hit harder next week?”",
        "A check-in isn't being on call around the clock — set the boundary early (Part 4 covers channels and boundaries in full).",
      ],
      activities: [
        { key: "weekly-checkin-draft", prompt: "Draft a weekly check-in message you'd actually send.", multiline: true },
      ],
    },
    {
      heading: "Build community",
      body: [
        "People stay where they belong. Community is baked into Fitaz Gym — it's a core value, not a poster on the wall. A group challenge is the easy win: points for attending and weekly mini-challenges, small teams, a kickoff and a celebration.",
        "Keep the prize value-add, never cash: a bonus session, a workshop, a recognition moment. A cash prize shifts the goal from 'show up, connect, build a habit' to 'win the voucher' — save cash for one-off acquisition pushes like a referral drive.",
      ],
      activities: [
        { key: "community-activity-plan", prompt: "Plan one community-building activity. Outline the steps to run it and how you'll promote it.", multiline: true },
      ],
    },
    {
      heading: "Reward loyalty",
      body: [
        "Keep every reward value-add, never a discount — you want loyalty to feel like getting more, not paying less. Milestone ideas: 3 months (branded water bottle/towel), 6 months (bonus session or small-group class), 12 months (personalised program-review session, apparel, or a recovery workshop). Recognition costs nothing: a client spotlight (with permission) or a handwritten note.",
      ],
      activities: [
        { key: "loyalty-rewards-design", prompt: "Design your own loyalty rewards. List the milestones and the value-add reward at each.", multiline: true },
      ],
    },
    {
      heading: "Provide added value",
      body: [
        "Added value is what you give beyond the paid hour: home/travel workouts, general nutrition guidance built on sound principles, simple recovery/mobility/sleep/stress resources. Stay inside your scope of practice (Part 3) — general education is fine, prescribing meal plans or diagnosing is not.",
      ],
      activities: [
        { key: "added-value-resources", prompt: "List three added-value resources you could offer, all within your scope.", multiline: true },
      ],
    },
    {
      heading: "The quarterly client check-in",
      body: [
        "Once a quarter, sent online for the client to fill in on their own time — it's a deliberate moment to step back, not tied to a program 'ending' since training rolls on as a subscription. Two jobs: client goal reflection, and honest feedback for you (including whether they'd recommend you, feeding referrals and testimonials).",
        "A client starting to waver will often say so on a form long before they say it to your face — a simple question about wanting to change anything gives you the chance to adjust before they reach for the cancel button.",
        "When a client ticks yes to the testimonial question, that's your cue to also ask for a Google review — send a direct link while they're still feeling good. Ask a given client once, not every quarter; for long-term loyal clients, invite an annual refresh instead.",
      ],
      activities: [
        { key: "quarterly-checkin-plan", prompt: "When will you run your quarterly check-in, and what will you do with what it tells you?", multiline: true },
      ],
      links: [
        {
          label: "Example Client Check-In Form spec (build your own from this)",
          url: "https://docs.google.com/document/d/1xc0ehnUPr_k9mZO6MvritWFmzeM4-OcNZDPVrsO-nqE/edit",
        },
        {
          label: "Printable Client Check-In Form",
          url: "https://drive.google.com/file/d/1fjHlwccRBCSWs2DZoC4ZReoZU5WGIwXc/view",
        },
      ],
    },
    {
      heading: "Common reasons clients leave, and what to do",
      body: [
        "- **No visible results** — frustrated, comparing to early progress → reset expectations, show the data you already collect, set a fresh short-term win.",
        "- **Feeling undervalued** — going quiet, one-word replies → weekly check-ins, remember the details, celebrate small wins.",
        "- **Life gets busy** — cancelling and rescheduling → flexible times, shorter sessions, lean on the weekly app in weeks they can't train.",
        "- **Cost or value mismatch** — 'might take a break for a bit' → reconnect to their why and progress, revisit frequency before they walk.",
        "- **Boredom** — going through the motions → variety, a new challenge, a fresh goal to chase.",
        "Almost all of these show up first in the weekly check-in or as a change in attendance.",
      ],
      activities: [
        { key: "retention-risk-plan", prompt: "Pick the reason most likely to cost you a client. What's your plan to get ahead of it?", multiline: true },
      ],
    },
    {
      heading: "Referrals as a retention tool",
      body: [
        "A referral isn't only new business — it's a retention signal. A client who refers has publicly committed to you, which deepens their own loyalty. Ask right after a win, and keep the thank-you value-add, never a discount.",
        "“Hi Mel, I've loved watching your progress. If you know someone who'd get something out of training, I'd be glad to look after them. As a thank you, I'll add a bonus mobility session to your next block.”",
      ],
      activities: [
        { key: "referral-ask-draft", prompt: "Draft a referral ask you'd send a happy client. Keep the thank-you value-add.", multiline: true },
      ],
    },
    {
      heading: "Ending a client relationship cleanly",
      body: [
        "Not every relationship should last forever. Be direct and kind, don't ghost, acknowledge the journey, give a reason about fit not blame, point them somewhere useful, and honour the admin (final payment, cancellation terms, anything owed back).",
        "“Mel, you've built a really solid base and I'm proud of the work you've done. I think you're at the point where a strength class or training solo with the odd check-in would serve you better than what I offer right now.”",
      ],
      activities: [
        { key: "clean-ending-steps", prompt: "How will you end a relationship cleanly? Note the steps you'd follow.", multiline: true },
      ],
    },
    {
      heading: "Win-back: re-engaging lapsed clients",
      body: [
        "A lapsed client is warmer than a cold lead — they already know and trust you. Be clear who you're chasing (drifted off, not the ones you ended for cause). Lead with care, not a pitch. A couple of times a year, go back through your lapsed list and reconnect, treating re-entry as value-add (a complimentary catch-up), never a price cut.",
        "“Hi Mel, you popped into my head this week, it's been a while. No agenda, just wondering how your training's been going. If you ever feel like getting back into it, the door's always open and the first catch-up's on me.”",
      ],
      activities: [
        { key: "winback-message-draft", prompt: "Draft a win-back message for a client who drifted off months ago.", multiline: true },
      ],
    },
  ],
};
