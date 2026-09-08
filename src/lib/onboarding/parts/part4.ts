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
      managerNote:
        "This section sets up the whole part. The PTs who struggle aren't the ones with weak programming — they're the ones who treat communication as soft skills you can skip. Frame everything that follows as business-critical, not nice-to-have.",
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
      workedExample:
        "Taylor coaches a lot of shift workers, so she's often on the floor at 5:30am before the early crowd clock on. She's learned the regulars' names and what they're training for. When a new face turns up looking lost near the rig, she doesn't pitch — she racks a bar for them, shows them the setup, and says “I'm Taylor, I coach here, give me a yell if you want a hand with anything.” Three of her current clients started exactly that way.",
      managerNote:
        "New PTs hide — they cluster at the desk or bury themselves in their phone between sessions. Floor time is where their book gets built. Set the expectation early: when you're in the building and not with a client, you're on the floor.",
    },
    {
      heading: "Active listening",
      body: [
        "Listening isn't waiting for your turn to talk. Active listening means the client walks away feeling understood.",
        "- **Paraphrase.** Say back what you heard in your own words. “So meal prep feels impossible with your current shifts.” It proves you were listening and lets them correct you if you got it wrong.",
        "- **Ask clarifying questions.** Dig for the real issue. “Can you tell me more about what makes mornings hard?” The first answer is rarely the whole story.",
        "- **Summarise.** Pull the threads together. “So the two big things are time and energy. Let's work with those.” It gives the conversation shape and shows you're tracking.",
        "- **Use empathetic statements.** Name the feeling. “It makes sense you'd be frustrated when the scales aren't moving.” Validation isn't agreement, it's acknowledgement.",
        "- **Mind your non-verbals.** Eye contact, an open posture, a nod. Put the phone away. Your body says whether you're really there.",
      ],
      activities: [
        {
          key: "listening-technique-pick",
          prompt: "Pick one technique you don't do naturally and use it deliberately next session. Which one, and what will you say?",
          multiline: true,
        },
      ],
      managerNote:
        "New PTs over-talk — they fill silence with instruction because silence feels like failure. The fix is one line: ask one more question before you give one more answer. If a PT is doing 80% of the talking in a check-in, they're not listening, they're broadcasting.",
    },
    {
      heading: "Motivational interviewing",
      body: [
        "Motivational Interviewing (MI) draws motivation out of the client rather than pushing it onto them. The trap new coaches fall into is the righting reflex: a client names a problem and you immediately hand them the fix. MI says do the opposite — help them talk themselves into it. People believe their own reasons far more than yours.",
        "It's not just an intake tool. The client who's plateaued at week 8, the one whose attendance is slipping, the one second-guessing whether to renew, that's all MI territory.",
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
      workedExample:
        "Taylor's client Dan, a fly-in-fly-out worker, is eight weeks in and his attendance has dropped to once a fortnight. The instinct is to lecture him about consistency. Instead Taylor opens: “How's training been sitting with you lately?” (open question). Dan admits he feels like a fraud booking sessions he keeps missing. Taylor reflects: “So it's less about the training and more that missing sessions makes you feel like you're failing at it.” Dan agrees, then says “I actually feel heaps better on the weeks I get in twice.” That's change talk. Taylor draws it out: “What's different about those weeks?” Dan ends the chat proposing his own fix — two locked sessions on his weeks home. Taylor didn't sell it. She pulled it out of him.",
      managerNote:
        "MI is the hardest skill in this part to actually do, because the instinct to fix is so strong. Watch for PTs who turn every reflection into a mini-lecture. The test: in a five-minute check-in, did the client talk more than the PT? If not, they're advising, not interviewing.",
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
      managerNote:
        "Labour the consent point on hands-on cueing. New PTs adjust people without asking because their cert trained the cue, not the consent. One bad moment here can end a client relationship or worse. The rule is simple and non-negotiable: ask first, every time.",
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
      workedExample:
        "Same fault, two clients. Taylor's beginner, a nervous night-shift nurse on her third session, rounds her back on a deadlift. Taylor: “Really nice tempo on that one. Let's try the next rep with your chest up like you're showing off the logo on your shirt, that'll keep your back happy.” One cue, framed as a win.\n\nTaylor's regular, a confident tradie who's trained for a year, makes the same error. Taylor: “Back's rounding, reset and brace.” Four words, because he wants efficiency, not reassurance. Reading which client is in front of her is the actual skill.",
      managerNote:
        "The most common new-PT failure here is over-coaching: narrating every fault on every rep until the client feels like they can't do anything right. Coach them to pick one cue and then be quiet. Silence while a client works is a feature, not a gap to fill.",
    },
    {
      heading: "Difficult conversations",
      body: [
        "Avoiding hard conversations is the most expensive habit in this business. Address it early, plainly and kindly, and most are far less painful than the dread suggests.",
        "The shape of any hard conversation is the same: be direct, be warm, lead with the facts, own your part where there is one, and come with a path forward.",
        "**Raising your rates.** Existing clients will accept a rise if it's framed with notice and respect. Give plenty of warning (a month or more), tell them in person or in a proper message rather than burying it in a booking app, and don't over-apologise. You're running a business, not asking a favour. There's a ready-to-use price-increase email in Part 3.",
        "**Missed and late-cancelled sessions.** Your cancellation policy only works if you enforce it the first time, kindly. Let it slide once and you've taught the client it doesn't apply.",
        "> “Hey, just a heads up that today falls inside the 24-hour window, so it's charged as a session. All good this time, just flagging so you're not caught out next time.”",
        "Firm on the policy, warm on the delivery.",
        "**A client returning after a break.** People who've fallen off often feel guilt or shame, and that's exactly what keeps them away longer. Make the return easy. No lecture, no “where have you been.” Ease the program back in rather than picking up where they crashed.",
        "> “Good to have you back. Let's start lighter this week and build.”",
        "**Ending the relationship cleanly.** Sometimes you're not the right coach for someone, or the fit has soured. Be honest but kind about the why, give notice, help them transition (a referral to a better-suited coach, a wind-down plan), and resist the urge to ghost. People remember how you ended things.",
      ],
      activities: [
        {
          key: "hard-conversation-opener",
          prompt: "Pick the hard conversation you most want to avoid right now. Write the first two sentences you'd open with.",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor has a long-term client, Mick, who's late-cancelled three times this month and never been charged, because Taylor likes him and felt awkward. The fourth time, she gets ahead of it: “Mick, I've let the last few slide, but I need to start applying my cancellation policy properly, including today's. Nothing personal, it's just how the business has to run. Easiest fix is we lock your sessions into your roster so they're protected.” Mick's a bit embarrassed, but he respects it, and he stops cancelling. The boundary fixed the behaviour the leniency was feeding.",
      managerNote:
        "New PTs let clients walk all over the cancellation policy because they're scared of losing them. The irony is clients respect a coach with clear boundaries more, not less. Role-play the rate-rise and the no-show conversations in a 1:1 — they're the two that cause the most avoidance and the most lost income.",
    },
    {
      heading: "Communication channels",
      body: [
        "- **Text** — quick logistics, reminders, low-stakes.",
        "- **Call** — anything sensitive or layered. Tone carries on a call and dies in text.",
        "- **Email** — anything needing a record or detail: programs, policies, rate-rise notices, invoices.",
        "- **In person** — the real relationship work.",
        "**Boundaries around availability:**",
        "- Set hours and say them out loud. “I answer messages between 7am and 7pm and I'll always get back to you within a day.” Clients don't expect you on call 24/7 unless you've trained them to.",
        "- Don't reply instantly at all hours even when you can. Every late-night reply sets the expectation for the next one.",
        "- Keep it on one channel where you can. Clients texting, DMing on Instagram and emailing the same question is how things get missed.",
        "- Use auto-replies and scheduling tools so the boundary holds itself, rather than relying on your willpower at 9pm.",
        "- Separate work and personal where you can. A dedicated work number or app keeps your own life out of the client inbox.",
        "The goal isn't to be less available in a way clients feel. It's to be reliably available inside boundaries you can actually sustain. A coach who burns out and goes quiet is worse for clients than one with clear hours.",
      ],
      activities: [
        {
          key: "availability-boundary",
          prompt: "Write your availability boundary in one sentence, the one you'd send a new client.",
        },
      ],
      managerNote:
        "The PTs who burn out fastest are the ones answering messages at all hours in their first few months, thinking it's good service. It isn't — it's unsustainable, and it trains clients to expect it. Push new PTs to set hours from day one, before they've built habits they'll have to walk back.",
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
      workedExample:
        "Empathy means acknowledging the challenge without judgement so the client feels supported. Pushing means keeping them aligned with the goal they set and reframing the setback rather than ignoring it. The balance lives in tailoring the response: when the barrier is mostly in their head, challenge it; when it's a genuine life event, scale the program back temporarily and show you respect their limits. Done well, the client feels both held and moved forward — which is what keeps them in the game through the rough patches.",
      managerNote:
        "This is the reflection that separates coaches who think about their craft from those who run on autopilot. Use it as a 1:1 discussion prompt. Most new PTs lean hard one way: too soft (a friend, not a coach) or too pushy (a drill sergeant). Help them name their default so they can catch it.",
    },
    {
      heading: "Roleplay activities",
      body: [
        "Communication skills don't improve by reading about them — they improve by doing them badly in a safe room until they're not bad anymore. Grab a colleague, a fellow PT or your PT Manager and run these. Swap roles so you play both coach and client, because feeling it from the client's chair teaches you more than any checklist.",
        "**How to run a roleplay:**",
        "- One person is the coach, one is the client. The client picks a realistic scenario and commits to it. No making it easy.",
        "- Run it for three to five minutes. Don't stop to explain, play it out.",
        "- Debrief after: what landed, what felt forced, what the client actually felt versus what the coach intended.",
        "- Swap and repeat.",
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
        "Don't let PTs skip this because it feels awkward — awkward is the point. Better to fumble the rate-rise conversation with a colleague than with a paying client. If a PT says they've got no one to practise with, that's a flag in itself: this job is built on relationships, and a PT who can't find a single person to run a five-minute roleplay with will struggle to build a book. Pair them up during onboarding.",
    },
  ],
};
