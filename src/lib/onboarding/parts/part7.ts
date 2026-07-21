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
      workedExample:
        "Taylor, ex-paramedic, used to dread the money conversation. Her reframe: “I spent years turning up when people were at their worst. Asking someone to commit two sessions a week to feel stronger isn't pushy, it's the same job, earlier.” That's the line she tells herself before every sales chat now.",
      managerNote:
        "The reframe is the whole job in this section. New PTs freeze in the sales chat because they've cast themselves as the villain. Get them to name the discomfort out loud, then hand them the reframe. Most of the fear is fear of rejection dressed up as “I don't want to be pushy.”",
    },
    {
      heading: "Cold vs warm lead scripts",
      body: [
        "A **warm lead** already knows you exist — trained with you, met on the floor, or referred. A **cold lead** joined the gym and got handed to you, off a weekly list from Front of House. Most Fitaz leads are cold — a cold lead isn't a 'no,' it's a 'not yet introduced.'",
        "The difference is the opening: warm references the shared moment, cold says who you are and why you're worth two minutes. Both roads lead to the same place: book the complimentary session.",
      ],
      managerNote:
        "Most new PTs only think to prepare a warm script (“we met on the floor last Tuesday”), then freeze the first time they get a cold list — which is week one for most of them. Make sure they can run both. The cold opener is the one they'll use most.",
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
      workedExample:
        "Taylor's cold call to Mel, an ICU nurse who'd just joined: “Hey Mel, it's Taylor from Fitaz Gym, one of the trainers here. Saw you signed up this week so I thought I'd say g'day properly. Is now alright? ... I used to be a paramedic, so I get the rotating roster thing better than most. What's making you want to get into it right now?” Mel talked for two minutes about night shifts and a sore back. Taylor booked her a complimentary session on the spot. The shared shift-work background did the heavy lifting.",
      managerNote:
        "The cold call scares them most. The fix is the complimentary session offer — it turns the call from “buy my thing” into “come have a free go,” which is a much easier yes. Coach them to stop talking after they offer it and let the lead answer.",
    },
    {
      heading: "Text approach: first contact",
      body: [
        "Some people won't answer an unknown number but will reply to a text. Keep it short, name the gym, end with an easy either/or ('earlier or later in the week') rather than a plain yes/no.",
      ],
      activities: [
        { key: "cold-text-draft", prompt: "Draft your cold-lead first text. Cut it until it's four sentences or fewer.", multiline: true },
      ],
      managerNote:
        "Watch for the essay text. New PTs try to cram the whole pitch into the first message and it reads like spam. The job of the text is one thing: get a reply. Three or four sentences, max. Save the detail for when they answer.",
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
      workedExample:
        "Taylor gets six new-member leads Monday morning. By Tuesday she's messaged all six and called the three with mobiles. Two book a complimentary session, one says not right now (onto the 2-2-2 list), three haven't replied yet. She updates the status on each before lunch so the Manager isn't chasing her. That's a normal week.",
      managerNote:
        "This is the section new PTs reread most, because it's the bit that actually puts people in front of them. Walk them through the live spreadsheet (or the /admin lead board) in week one rather than leaving them to decode it off the page. The 48-hour turnaround is the number that matters most — leads go cold fast.",
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
      workedExample:
        "Mel didn't book after Taylor's first call — she was mid-block of nights and couldn't think past sleep. Taylor noted it and followed up two days later, then dropped her a shift-worker sleep tip a fortnight on. When Mel's roster eased six weeks later, she remembered the trainer who got it and booked in. Same lead, three light touches, one client.",
      managerNote:
        "PTs treat a “no” as final and bin the lead. The 2-2-2 rule reframes it as “not yet” and gives them a concrete cadence, so following up doesn't rely on memory or mood. The biggest unlock: most never follow up even once. Just doing the two-day touch puts them ahead of the field.",
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
      managerNote:
        "This is the most useful diagnostic in the whole sales section. When a PT says “they seemed keen but didn't sign,” ask which certainty was missing. Nine times out of ten they built one and forgot the other — usually the emotional side gets skipped, because logic feels safer to talk about.",
    },
    {
      heading: "The sales chat: 5-step framework",
      body: [
        "The sales chat usually happens straight after the complimentary session. Five steps: **Engage** (a real chat about how the session felt), **Frame** (tell them what's next, get permission), **Summarise** (reflect back their goals, motivations and barriers — proves you listened), **Plan** (map the next 8-12 weeks, realistic and personal), **Recommend** (now you talk price and options, having earned it).",
      ],
      activities: [
        { key: "engage-frame-lines", prompt: "Write a one-line Engage opener and a one-line Frame line you'd actually say.", multiline: true },
      ],
      managerNote:
        "Get new PTs to run this as a roleplay until the steps are muscle memory. The two they skip under pressure are Frame (asking permission) and Summarise (reflecting back) — those are the two that make it feel like a conversation instead of a pitch.",
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
      managerNote:
        "We teach a clean split: $80 per 45-minute session for training, plus a flat $20 a week for the program and coaching app, and no discounting, in line with the gym's no-discount rule. The weekly fee is what keeps a PT getting paid for programming and check-ins in weeks a session doesn't happen. If a PT's instinct is to drop the price to close, that's a confidence problem, not a pricing problem. Fix the value conversation, not the number.",
    },
    {
      heading: "Handling hesitations",
      body: [
        "The most common hesitation isn't price, it's frequency: 'Do I really need two sessions a week?' Movement is a skill and skills need reps; two touchpoints a week keep momentum; most goals need enough frequency to drive change. Twice a week is your recommended default, not a rule — consistency beats volume every time.",
      ],
      activities: [
        { key: "frequency-hesitation-explanation", prompt: "How would you explain the value of training twice a week to a hesitant client, in your own words?", multiline: true },
      ],
      workedExample:
        "Mel balked at twice a week — her roster's all over the place. Taylor didn't drop it to one and fold. She said: “Here's what I'd do with your shifts. We lock one session you can always make, then float the second around your roster week to week. You get the benefit of two without pretending your schedule is something it isn't.” Mel signed up for two. The flex was the yes, not a discount.",
      managerNote:
        "Frame 2x a week as the recommended minimum, not take-it-or-leave-it. The phrase that lands is “consistency over volume.” It lets the PT hold the recommendation while giving the client a real choice, which paradoxically makes them more likely to take it. A client pushed into three sessions they can't sustain churns in a month.",
    },
    {
      heading: "Body language in the sales chat",
      body: [
        "Stay open, mirror them subtly, hold gentle eye contact, smile, and slow down. None of this is manipulation — it's removing the static so your message gets through.",
      ],
      activities: [
        { key: "sales-body-language-habit", prompt: "Which body language habit do you most need to work on in a money conversation?", multiline: true },
      ],
      managerNote:
        "Body language is where the sales chat is won or lost before a word about price. New PTs leak nerves: they look away on the number, they speed up, they cross their arms. Film a roleplay on a phone and play it back — they'll see it instantly, and seeing it is most of the fix.",
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
      managerNote:
        "Get PTs into the post-chat reflection habit from day one, especially after the no's — the reflection is where the skill compounds. Without it, they make the same mistake fifty times; with it, fifty conversations is a serious sales education. The single most useful question is “which certainty was missing,” because it points straight at the fix.",
    },
  ],
};
