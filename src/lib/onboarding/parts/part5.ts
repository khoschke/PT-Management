import type { OnboardingPart } from "../types";

export const part5: OnboardingPart = {
  number: 5,
  slug: "the-client-consultation",
  title: "The Client Consultation",
  intro:
    "The consult is the conversation that turns a prospect into a client and sets up everything that follows. This part is about the conversation, not the clipboard.",
  sections: [
    {
      heading: "Why the consult matters",
      body: [
        "The prospect has already decided you might be worth their time. Now they're deciding whether you're worth their money and trust. Get this conversation right and the sale, the program, and the retention all get easier. Get it wrong and you spend the next twelve weeks playing catch-up.",
        "A good consult does three jobs at once: builds rapport so the client feels safe being honest, gathers what you need to train them safely, and surfaces the real reason they walked in — almost never the reason they say first.",
      ],
      activities: [
        {
          key: "trusted-first-conversation",
          prompt:
            "Think back to a time someone sold you something well, or coached you well. What did they do in the first conversation that made you trust them?",
          multiline: true,
        },
      ],
      managerNote:
        "New PTs treat the consult like a form to fill in. Push them away from that. The waiver collects the data — the consult is where they listen for what isn't written down. If a PT leaves a consult with a completed form and no read on the person, they missed the point.",
    },
    {
      heading: "The PT Waiver Form: pre-consult screening",
      body: [
        "Before the prospect sits down with you, they complete your PT Waiver Form online — it captures their details, goals, training history, and a basic health screen. Send the link when you book the consult so it lands in your inbox before they walk in.",
        "Fitaz Gym gives you an example form to build your own version from, on your own Google account. You own the form, you control where responses land, and the responsibility for storing that information securely sits with you.",
        "The form is not a substitute for the conversation — it's the starting point. You'll still ask about everything on it, because the written answer and the spoken answer are often different, and the gap between them is where the useful stuff lives.",
      ],
      activities: [
        {
          key: "waiver-send-timing",
          prompt:
            "When in your booking process will you send the waiver link, and what will you say so the prospect actually fills it in before the consult?",
          multiline: true,
        },
      ],
      links: [
        {
          label: "Example PT Waiver Form spec (build your own from this)",
          url: "https://docs.google.com/document/d/1ENMPByUig94aNca36DtEGJUsSN2XYp8GZ8Cz5Io2Oe4/edit",
        },
        {
          label: "Printable PT Waiver Form",
          url: "https://drive.google.com/file/d/18lrnr04jdzABbgt5LEq9aOHfl7jN2tdW/view",
        },
      ],
      workedExample:
        "I send the link the moment we lock in a consult time, by both text and email so it's hard to miss. The message: “Looking forward to meeting you Thursday. Before we catch up, can you fill in this quick form? Takes about five minutes and means I can walk in with a plan that actually fits you: [link].” Then a short reminder the morning of the consult if it hasn't come back yet.",
      managerNote:
        "The gym provides the waiver as a template only — an example Google Form plus a printable PDF for walk-ins. Each PT builds their own version on their own Google account and stores their own client data, keeping the privacy and storage responsibility with the PT, not the gym. Make sure new PTs actually build their own rather than sharing one form.",
    },
    {
      heading: "The consult structure: Open, Discover, Screen, Align, Close",
      body: [
        "A consult that wanders is a consult that doesn't convert. Run it on a simple five-stage spine.",
        "**Open** — two or three minutes. Greet them, settle them, set the frame for how the next 30-45 minutes will run.",
        "**Discover** — the bulk of the consult. Goals, history, lifestyle, motivation, barriers. You're building a picture of their life, not just their training.",
        "**Screen** — walk through the health screen from the waiver, confirm what they wrote, decide whether anything needs medical clearance. A safety gate, not a formality.",
        "**Align** — connect what you heard to what you offer. Reflect their goal back in their words, then show how training with you gets them there. This is where it becomes a SMART goal.",
        "**Close** — ask for the commitment. Agree the next step, lock in the schedule, handle any hesitation.",
      ],
      activities: [
        {
          key: "consult-opener",
          prompt: "Draft your own one-line opener that sets the frame for a consult. Make it sound like you, not a script.",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor (ex-paramedic, now training shift workers) runs a consult with a FIFO worker, Dan. Open: “I work with a lot of shift workers, so let's figure out what training around your roster actually looks like.” Discover: Dan's real goal isn't the six-pack he wrote down, it's energy to get through a night shift without three energy drinks. Screen: high blood pressure on the waiver, so Taylor flags it. Align: “Two sessions a week built around your roster, focused on energy and strength, not smashing you into the ground.” Close: books the first session before Dan leaves.",
      managerNote:
        "PTs collapse Discover and Align because they're keen to pitch. Slow them down — the order matters: you cannot align to a goal you haven't properly discovered. The certainty to close comes from how well they listened earlier, not from how hard they push at the end.",
    },
    {
      heading: "The questions that matter",
      body: [
        "Good questions open people up. Lead with open questions, then narrow when you need a specific.",
        "- **Goals** — what's the main thing you want from training? Why that, why now?",
        "- **Fitness history** — when did you last train consistently, and what was it?",
        "- **Lifestyle** — walk me through a normal day, sleep, work, food.",
        "- **Motivation** — on a scale of one to ten, how important is this right now?",
        "- **Barriers** — what's stopped you from getting there before? The most important question in the consult.",
        "- **Medical** — anything I should know about your health before we train?",
      ],
      activities: [
        {
          key: "go-to-opening-questions",
          prompt: "Write your three go-to opening questions for a first consult — the ones you'll ask every time.",
          multiline: true,
        },
      ],
      workedExample:
        "Client says she wants to “tone up”. Taylor doesn't run with it — she asks what stopped her before. The real answer: she starts strong every January, then a busy fortnight at work blows up the routine and she quits out of guilt. Now Taylor knows the goal isn't toning, it's building a routine that survives a bad week. Everything she designs points at that.",
      managerNote:
        "The scale-of-ten question and the barriers question do the heavy lifting — they're lifted straight from motivational interviewing (Part 4). A ‘6’ isn't a problem, it's an invitation: ‘what would make it an 8?’ Teach PTs to follow the number with a question, not a sales pitch.",
    },
    {
      heading: "Spotting red flags and referral triggers",
      body: [
        "Part of your job is knowing when not to train someone until a doctor has signed off. This protects the client, and it protects you and Fitaz Gym.",
        "**PAR-Q** (Physical Activity Readiness Questionnaire) — a short standard health screen. The Fitaz waiver's health questions do this job. If a prospect ticks one, treat it as a flag to investigate, not an automatic no.",
        "**Get medical clearance before training when a client reports:** chest pain or heart trouble, dizziness or fainting, uncontrolled high blood pressure, recent surgery/injury or an acute condition, pregnancy (especially first or with complications), an unstable chronic condition (diabetes, asthma, epilepsy, arthritis), or anything that makes you hesitate — your gut counts as a trigger.",
        "When a trigger comes up: you don't diagnose and you don't push on regardless. Pause the physical side and refer out — you can still build rapport, set goals, and plan in the meantime.",
      ],
      activities: [
        {
          key: "gp-clearance-script",
          prompt:
            "Write, in your own words, how you'll tell a prospect they need GP clearance before you can train them, without scaring them off.",
          multiline: true,
        },
      ],
      workedExample:
        "A prospect tells Taylor he gets “a bit of a tight chest” on the stairs but reckons it's nothing. Taylor doesn't argue and doesn't train him. She says: “That's exactly the kind of thing I want your GP to give the tick on first. Let's get that sorted, and in the meantime I'll map out where we're heading.” He gets checked, it turns out to be manageable, and he comes back a fortnight later a more committed client because she took it seriously.",
      managerNote:
        "This is the section most likely to be skimmed and most important not to. Drill the script — a PT who freezes when a client mentions chest pain is a liability. The line we want: ‘I'd rather lose a fortnight getting clearance than train someone into an ambulance.’ Scope of practice and referral pathways are covered fully in Part 3.",
    },
    {
      heading: "Setting SMART goals with clients",
      body: [
        "Clients almost never arrive with a SMART goal — they arrive with a feeling ('I want to get fit'). Your job in the Align stage is to shape that feeling into something concrete, together, in their words.",
        "Example: 'I want to get fit' becomes 'Walk up the four flights to my office without losing my breath, within ten weeks, by training twice a week and walking on three of the others.'",
        "Set a long-term goal for the horizon and short-term goals for the weeks in between, so there's always a near win to aim at.",
      ],
      activities: [
        {
          key: "smart-goal-conversion",
          prompt: "Take a vague goal you've heard (or expect to hear) from a client, and turn it into a SMART goal.",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor's client says “I want to lose weight.” Taylor reshapes it with her, not for her: “Lose 5 kg in 12 weeks by training twice a week and walking the dog three mornings.” Then a short-term marker: “First 2 kg in the first month, and we'll know it's working when you're sleeping better.” The non-scale win matters as much as the number.",
      managerNote:
        "The single full SMART definition lives in Part 9 — here it's applied, not redefined. If a PT wants the deep version, point them to Part 9 rather than repeating it.",
    },
    {
      heading: "Closing the consult",
      body: [
        "The close isn't a hard sell — it's the natural next step after a conversation where the client felt heard. Three things to land: **the next step**, **the schedule** (a day and time in the diary now, not 'I'll text you'), and **the commitment** (frequency, cost, payment, confirmed out loud).",
        "If they hesitate, go back to what they told you rather than discounting. Pricing and objection handling get the full treatment in Part 7.",
      ],
      activities: [
        {
          key: "booking-close-words",
          prompt: "Write the exact words you'll use to ask for the booking at the end of a consult.",
          multiline: true,
        },
      ],
      managerNote:
        "New PTs either skip the close entirely (too nervous) or lurch into a pushy pitch. The fix is the same: anchor the close to what the client already said they wanted. The certainty comes from the listening, not the pressure. Default frequency to pitch is 2x/week, per Part 7.",
    },
    {
      heading: "Client records and note-taking",
      body: [
        "What you capture in the consult becomes the foundation of the program, the check-ins, and the relationship. Capture: contact details and the waiver itself, both stated and real goals, health screen results and clearance status, training history, the barriers they named, and the agreed schedule/commitment.",
        "Storing client information is your responsibility, not the gym's — pick one system (your coaching app or a secure spreadsheet you control) and keep everything in it.",
        "You're collecting sensitive information under the Australian Privacy Principles: only collect what you need, tell clients what you'll do with it, keep it secure, don't share it without permission, and let a client see or delete their data if they ask.",
      ],
      activities: [
        {
          key: "records-storage-plan",
          prompt: "Where will you store client records, and what's your one rule for keeping their health information secure?",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor keeps every client in her coaching app: waiver, goals, the barriers each one named, and session notes. When a client who ‘fell off’ three months ago comes back, she opens their file, sees the exact reason it stalled last time, and picks up like no time passed. The client feels remembered. That's retention built on good records.",
      managerNote:
        "Most new PTs have never thought about privacy obligations. They don't need the full Privacy Act, they need the five habits above. The single biggest real-world risk is storing client health data somewhere insecure or shared. Tie this back to the Waiver section: each PT owns their own form and is responsible for storing responses securely.",
    },
    {
      heading: "Trial and intro session framing",
      body: [
        "Most clients won't commit to ongoing coaching off a consult alone. The trial or complimentary intro session is the bridge between 'interested' and 'signed up' — it's where they feel what training with you is actually like.",
        "Frame it honestly: 'This first session is about seeing if we're a good fit and giving you a feel for how I coach. No pressure.' Then deliver a session so good the decision makes itself.",
        "Don't overload the trial trying to impress — a client who leaves energised converts better than one who leaves smashed and sore.",
      ],
      activities: [
        {
          key: "trial-session-feeling",
          prompt: "What's the one thing you want a client to feel walking out of their trial session, and how will you deliver it?",
          multiline: true,
        },
      ],
      managerNote:
        "Trial-to-paid conversion is one of the few numbers a new PT can move fast. The two common mistakes: treating the trial as a throwaway, or using it to show off with a brutal session. Coach both out — the trial should feel like a great normal session and end with a clear ask. Lead allocation and the cold/warm lead process feed into this; covered in Part 7.",
    },
    {
      heading: "When and why to reassess",
      body: [
        "The best progress data is already in your hands: sets, reps, loads, RPE, attendance and notes from every session. Reassessment is built into good programming, not bolted on top of it.",
        "Most pause-and-reflect moments are check-ins (a conversation), not physical tests. A formal reassessment earns its place when: the goal is a specific performance test, the client wants an objective milestone, or they're returning to activity after a layoff alongside a physio.",
        "A plateau, a goal pivot, or a significant life event are usually a check-in first, not a re-test.",
      ],
      activities: [
        {
          key: "reassess-scenario",
          prompt:
            "Pick a client situation (plateau, return from injury, or goal change). What would you check in on, and what session data would you look at first?",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor's client hits a plateau on her weight goal. Instead of booking a reassessment, Taylor books a check-in. Turns out the client's started a new roster and is sleeping four hours before early shifts. No test would've found that. They adjust the plan around recovery, and progress restarts. The session logs already told the strength story; the conversation told the rest.",
      managerNote:
        "Reassessment means the data you already collect every session plus regular check-in conversations. Formal physical retests are the exception — used when the goal is a benchmark the session logs don't capture, not a default ritual. If a PT proposes a monthly test day, ask them what question the test answers that their session logs don't. If they can't name one, it's a check-in they need, not a test.",
    },
    {
      heading: "Roleplay: a full intake consultation",
      body: [
        "Grab a colleague and run a full consult, start to finish, using the five-stage structure. Use the waiver, ask the questions that matter, screen for a health flag (invent one), shape a SMART goal together, and close for the booking. Then debrief and swap.",
        "Suggested prospect briefs: a shift worker chasing energy, a new mum returning to training after twelve months off, someone in their fifties with a dodgy knee and high blood pressure — pick ones outside your comfort zone.",
      ],
      activities: [
        {
          key: "consult-roleplay-reflection",
          prompt: "After the roleplay: what felt natural, what felt clunky, and which stage do you most need to practise?",
          multiline: true,
        },
        {
          key: "consult-roleplay-partner-feedback",
          prompt: "Your partner's feedback: what did they feel as the 'client', and where did they trust you most or least?",
          multiline: true,
        },
      ],
      managerNote:
        "Run this live in a one-hour session if you can. Watching a PT run a consult tells you in ten minutes what a written answer never will. Look for: did they listen or wait to talk, did they screen properly, did they actually ask for the booking.",
    },
  ],
};
