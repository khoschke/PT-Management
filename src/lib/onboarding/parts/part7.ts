import type { OnboardingPart } from "../types";

export const part7: OnboardingPart = {
  number: 7,
  slug: "making-sales",
  title: "Making Sales",
  intro:
    "You can be the best coach in the building and still go broke if nobody signs up. This part is about the conversation that turns interest into clients, minus the slimy bit. It sits in the Convert phase of the client journey mapped in Part 6.",
  sections: [
    {
      heading: "Sales mindset: helping not hustling",
      body: [
        "Sales isn't a personality you switch on. It's a conversation where someone gets clear on how you can help them. If you're a good coach, you already have most of the skills: you care about people, understand behaviour change, keep people accountable, and have grit.",
        "Swap the story. Instead of 'I hate selling,' try 'I help people see what's possible and make a decision they've been putting off.'",
      ],
      activities: [
        { key: "selling-discomfort", prompt: "What feels uncomfortable about selling for you right now? Name it honestly.", multiline: true },
        { key: "selling-reframe", prompt: "Now reframe it. How could you see that same moment as helping?", multiline: true },
      ],
    },
    {
      heading: "Cold vs warm lead scripts",
      body: [
        "A **warm lead** already knows you exist — trained with you, met on the floor, or referred. A **cold lead** joined the gym and got handed to you, off a weekly list from Front of House. Most Fitaz leads are cold — a cold lead isn't a 'no,' it's a 'not yet introduced.'",
        "The difference is the opening: warm references the shared moment, cold says who you are and why you're worth two minutes. Both roads lead to the same place: book the complimentary session.",
      ],
    },
    {
      heading: "Phone approach: first contact",
      body: [
        "A phone call still converts better than a text for a cold lead — it's harder to ignore a voice. Keep it short, sound like a person, one goal: book the complimentary session.",
        "**Warm call:** “Hey [Name], it's [Your Name] from Fitaz Gym. We had a chat on the floor last week about your training. Is now alright? ... I said I'd sort out a session for us. Are you better earlier or later in the week?”",
        "**Cold call:** “Hi, is this [Name]? Hey [Name], it's [Your Name], one of the personal trainers at Fitaz Gym. You signed up recently and your details came through to me... What I'd love to do is get you in for a complimentary session, just so you can see the place, meet me, and talk through what you're chasing. No pressure, no commitment.”",
        "Once they say yes, lock the detail: day, time, what to bring, where to meet, and the cancellation policy. When they say no, leave the door open gracefully and note them for the 2-2-2 follow-up.",
      ],
      activities: [
        { key: "cold-call-opener", prompt: "Write your cold-call opener in your own words. Say it out loud until it stops sounding like a script.", multiline: true },
      ],
    },
    {
      heading: "Text approach: first contact",
      body: [
        "Some people won't answer an unknown number but will reply to a text. Keep it short, name the gym, end with an easy either/or ('earlier or later in the week') rather than a plain yes/no.",
      ],
      activities: [
        { key: "cold-text-draft", prompt: "Draft your cold-lead first text. Cut it until it's four sentences or fewer.", multiline: true },
      ],
    },
    {
      heading: "The gym-provided lead process",
      body: [
        "Most of your early leads come from the gym, not your own marketing. Each week the PT Manager runs a report on new members and drops details into the lead spreadsheet, then assigns each lead to a trainer.",
        "You contact your assigned leads within **48 hours**, and keep the Status column current (Contacted, Interested, Not Interested, Comp. Booked, Converted) — it's how the Manager sees what's working and where leads get stuck.",
        "Leads are allocated on workload, not seniority. If a new member asks for a specific trainer, that comes first; after that it's about matching the right PT to the member, then the Manager's call.",
      ],
      activities: [
        { key: "own-lead-tracking-system", prompt: "Where will you keep your own simple list of who you've contacted and where each one's at?", multiline: true },
      ],
      links: [
        {
          label: "Live lead board (this app's admin dashboard)",
          url: "/admin",
        },
      ],
      managerNote:
        "This is the exact process the Fitaz Gym lead-allocation app (the /admin dashboard) runs day to day — leads land there from both the complimentary session form and your GymMaster sweep, with the 48-hour countdown shown live on each card.",
    },
    {
      heading: "The 2-2-2 rule for leads who don't convert",
      body: [
        "Most leads don't sign up the first time — that's normal. The 2-2-2 rule keeps you on their radar without becoming the trainer who can't take a hint.",
        "**2 days** after first contact: a light nudge. **2 weeks** later: check back with something useful (a tip, an invite), not just 'you still there?'. **2 months** later: one more genuine reconnect — a 'not now' from January is often a 'yes' by March.",
      ],
      activities: [
        { key: "222-tracking-location", prompt: "Where will you track your 2-2-2 follow-ups so none slip through?", multiline: true },
      ],
    },
    {
      heading: "Creating certainty: emotional and logical",
      body: [
        "People commit when they feel certain about you, the plan, and their own ability to stick with it. **Emotional certainty** ('this is right for me') comes from listening and connecting their goals to what they want out of life. **Logical certainty** ('this will actually work') comes from explaining how the coaching runs and showing results.",
        "Lead with emotional, back it with logical. Hit only the logic and they nod politely then 'think about it.' Hit only the feeling and they get excited then talk themselves out of it on the drive home.",
      ],
      activities: [
        { key: "certainty-example", prompt: "Think of a goal a client of yours might have. What's one emotional and one logical certainty you'd want to build for them?", multiline: true },
      ],
    },
    {
      heading: "The sales chat: 5-step framework",
      body: [
        "The sales chat usually happens straight after the complimentary session. Five steps: **Engage** (a real chat about how the session felt), **Frame** (tell them what's next, get permission), **Summarise** (reflect back their goals, motivations and barriers — proves you listened), **Plan** (map the next 8-12 weeks, realistic and personal), **Recommend** (now you talk price and options, having earned it).",
      ],
      activities: [
        { key: "engage-frame-lines", prompt: "Write a one-line Engage opener and a one-line Frame line you'd actually say.", multiline: true },
      ],
    },
    {
      heading: "Explaining pricing with confidence",
      body: [
        "Price is where new PTs flinch — don't. If you believe in the value, say the price plainly and let the silence sit.",
        "“I run it in two parts. Training is $80 for a 45-minute session. On top of that there's a flat $20 a week for your program and coaching app, which covers your personalised program, weekly check-ins, and progress tracking. That weekly fee means you're supported every week, even the ones we don't train.”",
        "Be direct, lead with value not cost, say the number and pause, and never discount the rate — if you want to add value, add value (an extra check-in), don't cut the price.",
      ],
      activities: [
        { key: "pricing-line", prompt: "Write your pricing line. Say it out loud until you can deliver the number without flinching or padding it.", multiline: true },
      ],
    },
    {
      heading: "Handling hesitations",
      body: [
        "The most common hesitation isn't price, it's frequency: 'Do I really need two sessions a week?' Movement is a skill and skills need reps; two touchpoints a week keep momentum; most goals need enough frequency to drive change. Twice a week is your recommended default, not a rule — consistency beats volume every time.",
      ],
      activities: [
        { key: "frequency-hesitation-explanation", prompt: "How would you explain the value of training twice a week to a hesitant client, in your own words?", multiline: true },
      ],
    },
    {
      heading: "Body language in the sales chat",
      body: [
        "Stay open, mirror them subtly, hold gentle eye contact, smile, and slow down. None of this is manipulation — it's removing the static so your message gets through.",
      ],
      activities: [
        { key: "sales-body-language-habit", prompt: "Which body language habit do you most need to work on in a money conversation?", multiline: true },
      ],
    },
    {
      heading: "Closing the conversation and post-chat reflection",
      body: [
        "Whether they sign or not, every sales chat is reps. When they say yes, make the next step dead easy: confirm the day/time, sort payment, tell them exactly what happens next. When they don't sign, thank them, leave the door open, and drop them onto your 2-2-2 follow-up.",
        "Run a quick reflection after every chat, win or lose: what went well, where did I lose them (if I did), which certainty was missing (emotional or logical), what would I do differently next time.",
      ],
      activities: [
        { key: "post-chat-reflection", prompt: "Run your Post-Chat Reflection after your next sales chat and note the headline takeaway here.", multiline: true },
      ],
    },
  ],
};
