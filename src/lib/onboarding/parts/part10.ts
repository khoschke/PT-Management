import type { OnboardingPart } from "../types";

export const part10: OnboardingPart = {
  number: 10,
  slug: "growing-as-a-coach",
  title: "Growing as a Coach",
  intro:
    "You've built the business. This part is about staying good at the job: the learning that never stops, the trainers worth watching, and the way we coach on the floor at Fitaz Gym.",
  sections: [
    {
      heading: "The learning never stops",
      body: [
        "Your qualification gets you in the door. What you do after that shapes your career. A certificate makes you a qualified trainer. The reps you put in afterwards, with real people and real setbacks, make you a good one.",
        "Every client brings something different: goals, injuries, history, the lot. Staying useful to them means staying curious. The science moves, the coaching gets sharper, the tools change. Keep up — not for a certificate on the wall, but because your clients feel the difference.",
        "**What you have to stay on top of** — some things aren't optional:",
        "- CPR: renew every 12 months.",
        "- First Aid: renew every 3 years.",
        "- Continuing education: required to hold your AUSactive registration and any other industry memberships.",
        "Your PT contract spells out the full certification and insurance requirements for working at Fitaz Gym. Keep your renewal dates somewhere you'll actually see them, because letting one lapse can put you off the floor.",
      ],
    },
    {
      heading: "The six focus areas for early-career PTs",
      body: [
        "Past the non-negotiables, the real edge comes from going beyond the minimum. These are six areas worth investing in over your first few years. Most are covered in detail elsewhere in this workbook, so treat this as a map of where to keep growing, not a re-teach.",
        "1. **Business basics** — attracting clients, charging properly, keeping your books straight. Parts 3, 6, 7 and 9 cover most of it.",
        "2. **Behaviour change and psychology** — understanding motivation, habits and resistance lets you meet clients where they are. This is the work that makes change stick rather than last a fortnight.",
        "3. **Coaching and communication** — your people skills matter more than your programming. Part 4 goes deep on this one.",
        "4. **Exercise selection and coaching** — the bigger your movement toolbox (progressions, regressions, swaps) the calmer you'll be when a plan needs changing mid-session. Cert IV territory; keep sharpening it on the floor and through shadowing.",
        "5. **Nutrition fundamentals** — teach the basics well (energy balance, food habits) and stay inside your scope. Resist the urge to hand out macro splits and supplement stacks early.",
        "6. **Program design** — learn to layer it: session to week, week to block, block to goal. That's how clients stay safe, see results, and feel looked after.",
      ],
    },
    {
      heading: "Filtering trends from gimmicks",
      body: [
        "Not every shiny new method is worth chasing. Fitness trends arrive loud and leave quietly. The skill is telling the useful from the flashy.",
        "The filter is one question: will this actually help my clients? If yes, look closer. If it's just new, let it go. A few more worth asking:",
        "- Is there real evidence behind it, or just a good before-and-after photo?",
        "- Does it fit inside my scope and my clients' goals?",
        "- Would I still rate it in a year, or is it riding a wave?",
        "Curiosity is good. Chasing every trend so you look current is not. Your clients trust you to be the filter, not the early adopter.",
      ],
    },
    {
      heading: "Build your development plan",
      body: [
        "Learning sticks better with a plan than with good intentions. Pick one area to work on now and line up how you'll actually do it.",
      ],
      activities: [
        { key: "dev-skill-now", prompt: "What's one skill or area you want to get better at right now?", multiline: true },
        { key: "dev-focus-area", prompt: "Which of the six focus areas does it sit under?" },
        {
          key: "dev-resource",
          prompt: "What course, mentor, book or resource could help you get there?",
          multiline: true,
        },
        { key: "dev-first-step", prompt: "What's your first step, and by when?", multiline: true },
      ],
      managerNote:
        "This is a good use of one of the four 1:1 hours near the end of onboarding — help them make the development plan concrete and time-bound rather than a vague 'get better at nutrition'. A named course, mentor or date is what turns intention into follow-through.",
    },
    {
      heading: "Shadowing senior trainers",
      body: [
        "Watching good trainers work is one of the fastest ways to learn. You'll pick up things no course teaches: how they read a room, time a session, and handle the curveballs. Beyond programming and technique, shadowing shows you client communication, session structure and timing, motivation styles, reading energy, handling progress and setbacks, the admin side, and professional boundaries.",
        "**Goal: 4 hours of shadowing per week across your 12 weeks.** Don't just stand there — ask questions, take notes, and watch how trainers adapt on the fly to keep clients safe and engaged.",
        "Mentoring beyond shadowing isn't a formal program here, and it doesn't need to be. Your PT Manager is always around for a debrief, a second opinion, or a hand when you're stuck. Use them.",
      ],
    },
    {
      heading: "The Fitaz Gym session delivery culture",
      body: [
        "Cert IV teaches you to coach a session. It doesn't teach you how a session feels at Fitaz Gym. That part you pick up on the floor, and it's worth naming so you can lean into it from day one.",
        "**Bring the energy** — you set the temperature of the session. Clients borrow your energy, especially on the days they arrive flat. Not shouting or forced hype: being present, switched on, and genuinely glad they showed up. Phone away, eyes up, fully in it.",
        "**Pace it so it flows** — a good session has rhythm: enough intensity to feel like work, enough room to coach. Know when to push the tempo and when to let someone catch their breath.",
        "**Make transitions seamless** — the gaps between exercises are where sessions live or die. Have the next station ready before you finish the last. Don't leave a client standing around wondering what's next.",
        "**Carry yourself like you belong** — the floor is a shared space and you're part of it. Say hello to members you're not training. Re-rack, wipe down, greet people by name. The way you move around the gym tells every member what kind of coach you are before they've said a word to you.",
        "**Coach the person, not just the program** — read the room. A client having a rough day might need lighter banter and a quick win, not a PB attempt. The session on paper is a starting point, not a script.",
        "This is the feel that keeps members coming back to the floor, not just to their program. Watch how the senior trainers do it, then make it your own.",
      ],
      activities: [
        {
          key: "floor-least-natural",
          prompt:
            "Which part of carrying yourself on the floor feels least natural to you right now? Name it, then watch how a senior trainer handles it.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Review and ongoing development",
      body: [
        "Twelve weeks ago you walked in with a qualification and a lot of questions. You've covered serious ground since: who you are as a coach, how to set up and run the business, how to find clients and keep them, how to sell without feeling like a salesperson, and how to look after yourself while you do it.",
        "None of it is finished, and that's the point. A workbook has a last page. Coaching doesn't. The trainers who go the distance are the ones who keep treating the job as something to get better at, long after the onboarding is done.",
        "So take stock. Look at how far you've come, be honest about where the gaps still are, and pick your next thing to work on. Then go again.",
      ],
      activities: [
        {
          key: "biggest-learning",
          prompt: "What's the biggest thing you've learned about yourself as a coach over these 12 weeks?",
          multiline: true,
        },
        { key: "shaky-business-part", prompt: "What part of the business still feels shaky, and what's your plan for it?", multiline: true },
        { key: "coach-in-a-year", prompt: "What kind of coach do you want to be a year from now?", multiline: true },
      ],
      managerNote:
        "These seven-plus focus areas and the wrap-up questions tie back to the expectations set in Part 1. This is the natural moment to do a genuine take-stock 1:1 — celebrate the ground covered, name the real gaps honestly, and agree the next development goal before onboarding formally ends.",
    },
  ],
};
