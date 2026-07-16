import type { OnboardingPart } from "../types";

export const part4: OnboardingPart = {
  number: 4,
  slug: "coaching-communication-and-rapport",
  title: "Coaching Communication and Rapport",
  intro:
    "The communication skills that build trust, keep clients, and turn interest into commitment. This is the part that decides whether your training knowledge ever gets used. Work through it, then practise the roleplays at the end with a colleague.",
  sections: [
    {
      heading: "Why communication drives business",
      body: [
        "Clients rarely leave because your programming was wrong. They leave because they stopped feeling seen. Your exercise science got you the certificate. Your communication is what builds the business.",
        "It runs in a chain: rapport earns trust, trust keeps clients showing up, clients who show up get results and stay, clients who stay refer their friends. Every link in that chain is communication, not coaching technique.",
        "A client who feels heard forgives a tough session, a rescheduled time, a slow week of progress. A client who feels processed starts shopping around the first time something annoys them. Same program, different outcome — the only variable is how you made them feel.",
      ],
      activities: [
        {
          key: "coach-who-understood-you",
          prompt:
            "Think of a coach, teacher or boss who made you feel genuinely understood. What did they actually do that you could copy?",
          multiline: true,
        },
      ],
    },
    {
      heading: "First impressions and walking the floor",
      body: [
        "You are the advertisement. Before anyone reads your bio or hears your pitch, they've watched how you carry yourself on the floor.",
        "**First impressions:** be the example, learn names and use them, smile and make eye contact, be useful before you're paid.",
        "**Walking the floor** is the highest-leverage prospecting you'll do, and it costs nothing — the members are already in the building. Watch for someone who looks unsure or idle between sets. Lead with help, not a pitch: “Want a hand with that setup?” opens more doors than “Have you thought about personal training?” Offer a complimentary session when it's natural, not as a sales line. Read the room — some people want to be left alone.",
      ],
      activities: [
        {
          key: "floor-visibility-actions",
          prompt:
            "Name three specific things you can do on the gym floor this week to be more visible and useful. Actual actions, not 'be friendly.'",
          multiline: true,
        },
      ],
    },
    {
      heading: "Active listening",
      body: [
        "Listening isn't waiting for your turn to talk. Active listening means the client walks away feeling understood.",
        "- **Paraphrase.** Say back what you heard in your own words.",
        "- **Ask clarifying questions.** Dig for the real issue — the first answer is rarely the whole story.",
        "- **Summarise.** Pull the threads together, give the conversation shape.",
        "- **Use empathetic statements.** Name the feeling. Validation isn't agreement, it's acknowledgement.",
        "- **Mind your non-verbals.** Eye contact, open posture, a nod. Phone away.",
      ],
      activities: [
        {
          key: "listening-technique-pick",
          prompt: "Pick one technique you don't do naturally and use it deliberately next session. Which one, and what will you say?",
          multiline: true,
        },
      ],
    },
    {
      heading: "Motivational interviewing",
      body: [
        "Motivational Interviewing (MI) draws motivation out of the client rather than pushing it onto them. The trap new coaches fall into is the righting reflex: a client names a problem and you immediately hand them the fix. MI says do the opposite — help them talk themselves into it. People believe their own reasons far more than yours.",
        "**The four principles:** express empathy (meet them where they are), develop discrepancy (hold up the gap between what they want and what they're doing, gently), roll with resistance (don't argue), support self-efficacy (remind them they've done hard things before).",
        "**OARS, the toolkit:** Open-ended questions, Affirmations, Reflections, Summaries. What you're listening for underneath all of it is *change talk* — any sentence where the client argues for change themselves. When you hear it, slow down and draw more of it out. That's the gold.",
      ],
      activities: [
        {
          key: "mi-response",
          prompt:
            "A client says “I just can't seem to stay consistent.” Write an open-ended question and a reflection you could respond with. No advice.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Body language essentials",
      body: [
        "Most of what you communicate isn't the words.",
        "**Reading the client:** crossed arms and short answers signal guarded or unsure; avoiding eye contact during technique explanation may mean confused but embarrassed; fidgeting and clock-watching signal low energy; leaning in and nodding signals engagement.",
        "**Managing your own:** open posture, uncrossed arms, hands visible. Match then lift their energy. Stand alongside, not looming over. Keep your face neutral and warm during corrections. Respect personal space and ask before hands-on cueing — always: “Mind if I adjust your hip here?”",
      ],
      activities: [
        {
          key: "body-language-film-review",
          prompt:
            "Film 30 seconds of yourself coaching a set. What does your body language say? Note one thing to keep and one to change.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Giving feedback and corrections without crushing the client",
      body: [
        "- Praise the effort, fix the movement — separate the person from the rep.",
        "- One cue at a time. Pile on three corrections and they nail none.",
        "- Point forward, not back: “This time, try...” beats “You keep doing...”",
        "- Go easy on the praise-criticism-praise sandwich — be genuine instead.",
        "- Ask before you explain: “Want me to tweak that, or are you feeling it?”",
        "- Read the day — a flat, stressed or brand-new client needs a lighter touch than a confident regular.",
      ],
      activities: [
        {
          key: "squat-depth-correction",
          prompt:
            "Write how you'd correct a client whose squat depth is too shallow, in one sentence, leading with what they did well.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Difficult conversations",
      body: [
        "Avoiding hard conversations is the most expensive habit in this business. Address it early, plainly and kindly, and most are far less painful than the dread suggests.",
        "The shape of any hard conversation is the same: be direct, be warm, lead with the facts, own your part where there is one, and come with a path forward.",
        "**Raising your rates** — give plenty of warning, tell them properly rather than burying it in an app, don't over-apologise.",
        "**Missed and late-cancelled sessions** — enforce the policy the first time, kindly, or you've taught them it doesn't apply.",
        "**A client returning after a break** — no lecture, welcome them back, ease the program back in.",
        "**Ending the relationship cleanly** — be honest but kind about the why, give notice, help them transition, don't ghost.",
      ],
      activities: [
        {
          key: "hard-conversation-opener",
          prompt: "Pick the hard conversation you most want to avoid right now. Write the first two sentences you'd open with.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Communication channels",
      body: [
        "- **Text** — quick logistics, reminders, low-stakes.",
        "- **Call** — anything sensitive or layered. Tone carries on a call and dies in text.",
        "- **Email** — anything needing a record or detail: programs, policies, rate-rise notices, invoices.",
        "- **In person** — the real relationship work.",
        "Set hours and say them out loud: “I answer messages between 7am and 7pm and I'll always get back to you within a day.” Don't reply instantly at all hours even when you can — every late-night reply sets the expectation for the next one.",
      ],
      activities: [
        {
          key: "availability-boundary",
          prompt: "Write your availability boundary in one sentence, the one you'd send a new client.",
        },
      ],
    },
    {
      heading: "Reflection: pushing vs empathy",
      body: [
        "Every coach has to find the line between pushing a client toward their goals and meeting them with empathy when life gets in the way. When the barrier is mindset (self-doubt, perfectionism, fear), it's usually time to push, gently. When the barrier is situational (a sick kid, a brutal work stretch, an injury), it's usually time to ease off.",
      ],
      activities: [
        {
          key: "push-vs-empathy-balance",
          prompt: "Where do you naturally sit on pushing vs. empathy, and which way do you need to stretch?",
          multiline: true,
        },
      ],
    },
    {
      heading: "Roleplay activities",
      body: [
        "Communication skills don't improve by reading about them — they improve by doing them badly in a safe room until they're not bad anymore. Grab a colleague or your PT Manager, swap roles between coach and client, run each for 3-5 minutes, then debrief.",
        "**Scenarios to run:** the fading client (missed three sessions, hinting they might stop); the plateau (eight weeks in, frustrated); the rate rise (stay warm, stay firm); the correction (a repeated movement fault); the first impression (a floor introduction to a stranger).",
      ],
      activities: [
        {
          key: "roleplay-exposed-moment",
          prompt:
            "After running at least two of these, note the one moment a roleplay exposed something you'd have got wrong with a real client.",
          multiline: true,
        },
      ],
      managerNote:
        "This is the single highest-value session to run in person rather than let a trainer skip. If you only sit in on one roleplay block across the 12 weeks, make it this one — it's where you'll actually see their coaching voice, not just read about it.",
    },
  ],
};
