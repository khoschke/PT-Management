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
      workedExample:
        "Taylor doesn't let Mel leave the consult without her first three weeks booked in. She texts after session one to see how Mel pulled up, sets a small win for week two (one full set of unassisted push-ups), and flags it the moment Mel hits it. By the time the early buzz fades, the rhythm is already there.",
      managerNote:
        "This is the section that pays for the whole part. New PTs obsess over getting clients and then lose them in the first three months without realising why. Push for specifics: not ‘communicate more’ but ‘text every Thursday’, not ‘set goals’ but ‘agree one win they'll feel by week three’.",
    },
    {
      heading: "Delivering a high-quality experience",
      body: [
        "Retention starts with the thing you actually control: the session itself. Three levers do most of the work: **Personalisation** (built for them, adjusted as they evolve), **Variety** (swap something every 4-6 weeks), **Presence** (full attention, no phone, remember what they told you last week).",
      ],
      activities: [
        { key: "session-quality-lifts", prompt: "List three ways you'll lift the quality of your sessions.", multiline: true },
      ],
      workedExample:
        "Taylor reviews each client's numbers before they arrive, so the session starts on the right load instead of guessing. She spends the last five minutes asking what felt good and what didn't, and she rotates a fresh exercise in every month so nobody's bored. Small things, done every time.",
      managerNote:
        "The data they need to personalise is the data they already collect every session: sets, reps, loads, RPE, attendance, notes. Tie this back to Part 5 — personalisation isn't extra work, it's using what's already in front of them.",
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
      managerNote:
        "Watch for PTs who treat check-ins as admin to batch on a Sunday night. The value is in the specificity. If they can't reference something real about the client, they haven't been paying attention in sessions — which is the deeper problem to fix.",
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
      workedExample:
        "Taylor runs a four-week challenge timed to the start of daylight saving, when her shift-worker clients are most motivated. Teams of three, points for sessions and a weekly step target, a Saturday-morning coffee catch-up to close it out. Two clients who'd never spoken now train together on purpose.",
      managerNote:
        "The cash-or-voucher prize is the most common move, and the one to talk PTs out of for retention events. Value-add only is the rule. Cash has its place for one-off acquisition spikes, but it works against you when the whole point is to build a habit that outlasts the prize.",
    },
    {
      heading: "Reward loyalty",
      body: [
        "Keep every reward value-add, never a discount — you want loyalty to feel like getting more, not paying less. Milestone ideas: 3 months (branded water bottle/towel), 6 months (bonus session or small-group class), 12 months (personalised program-review session, apparel, or a recovery workshop). Recognition costs nothing: a client spotlight (with permission) or a handwritten note.",
      ],
      activities: [
        { key: "loyalty-rewards-design", prompt: "Design your own loyalty rewards. List the milestones and the value-add reward at each.", multiline: true },
      ],
      workedExample:
        "Taylor marks six months with a free recovery session: foam rolling, mobility, and a wind-down routine her shift workers can use on rough sleep weeks. It costs her an hour, deepens the relationship, and gives the client something they actually wanted but wouldn't have booked.",
      managerNote:
        "If a PT proposes a percentage off or a free month, redirect immediately. The rule across the whole workbook is value-add only. The reasoning is worth saying out loud: a discount cuts your margin and your perceived worth at the same time, on the clients least likely to leave anyway.",
    },
    {
      heading: "Provide added value",
      body: [
        "Added value is what you give beyond the paid hour: home/travel workouts, general nutrition guidance built on sound principles, simple recovery/mobility/sleep/stress resources. Stay inside your scope of practice (Part 3) — general education is fine, prescribing meal plans or diagnosing is not.",
      ],
      activities: [
        { key: "added-value-resources", prompt: "List three added-value resources you could offer, all within your scope.", multiline: true },
      ],
      workedExample:
        "For her FIFO clients, Taylor builds a bodyweight travel circuit they can run in a donga or a hotel room. For Mel's night shifts, she shares simple pre-shift fuelling tips and a ten-minute wind-down routine for sleeping in daylight. All general, all within scope, all genuinely useful.",
      managerNote:
        "Nutrition is the usual scope trap. ‘Eat more protein and vegetables, here's a simple plate guide’ is fine. A calorie-counted meal plan for a client with a medical condition is not. If a PT is unsure, the answer is always refer — and that referral is a value-add in itself.",
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
      workedExample:
        "Mel's quarterly check-in with Taylor: her stamina on shift is noticeably better and she says so, she gives honest feedback that the early sessions ran a touch long, and she mentions her roster's about to get heavier. Taylor spots the wobble, messages her that week, and they quietly shift her training schedule to fit the new roster before it ever becomes a reason to stop. No hard sell, just a problem solved early.",
      managerNote:
        "The value here is catching drift early, so push PTs to actually read the answers and act on them, not file them away. A ‘the frequency's felt like a lot lately’ on a form is a client quietly telling you they're wobbling — the PT who follows up that week tends to keep them. Reviews are the highest-leverage, lowest-cost marketing a PT has, and most never ask: coach them to ask once when the client's buzzing, then set a yearly reminder for long-termers. Flag anyone tempted to offer a freebie for a review — that breaches Google's policy and it's off-brand.",
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
      managerNote:
        "Get PTs to be honest about which one is their blind spot. The high performers usually lose people to ‘life gets busy’ because they under-use flexible options. The less confident ones lose people to ‘no visible results’ because they don't show the progress that's actually there in the numbers.",
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
      managerNote:
        "Referral thank-yous are where PTs reach for a discount on reflex. Keep it value-add: a bonus session or a workshop keeps the reward on brand and inside the relationship. Same rule as loyalty — value-add, not dollars off.",
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
      workedExample:
        "Taylor has a client whose goals shifted hard toward competitive powerlifting, beyond her programming. Rather than fumble through it, she tells him straight, connects him with a strength coach she trusts, and finishes the current block properly. He still sends her referrals, because she handled it like a pro.",
      managerNote:
        "This is the section new PTs avoid hardest. They'll keep a draining or non-paying client for months because ending it feels like failing. Normalise it: a clean, kind ending is a mark of a professional, and the referral and reputation you protect are worth more than the sessions you're clinging to.",
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
      workedExample:
        "Twice a year Taylor blocks an hour and texts everyone who's drifted off in the last twelve months. No template-y mail-merge, just a genuine one-liner referencing something she remembers about each one. Last round, three came back, one of them now her most consistent client.",
      managerNote:
        "Most PTs feel awkward reaching out to someone who stopped, as if they're admitting they lost them. Reframe it: you're not selling, you're reconnecting. A warm, low-pressure message to ten lapsed clients will almost always bring at least one or two back. It's the highest-return hour in the part.",
    },
  ],
};
