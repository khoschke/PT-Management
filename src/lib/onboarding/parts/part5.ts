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
      managerNote:
        "This is the section worth roleplaying live rather than trusting the written answer alone — watch for trainers who soften the message so much the prospect doesn't realise it's a hard stop until cleared.",
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
    },
  ],
};
