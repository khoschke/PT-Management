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
        "Lose the “Good morning, may I speak with [Full Name]” telemarketer voice. Nobody under fifty talks like that, and it screams sales call. Talk the way you'd talk if you were inviting them to a session, because that's exactly what you're doing.",
        "**Warm call**",
        "> “Hey [Name], it's [Your Name] from Fitaz Gym. We had a chat on the floor last week about your training. Is now alright? ... Good. I said I'd sort out a session for us, so that's why I'm calling. Are you better earlier or later in the week? ... Tuesday or Thursday? ... Sweet, Thursday 6:30am. Wear something you can sweat in, bring a water bottle, and I'll meet you at reception. Quick heads up, I've got a 24-hour cancellation policy, so just message me if anything changes. Looking forward to it.”",
        "**Cold call**",
        "> “Hi, is this [Name]? ... Hey [Name], it's [Your Name], one of the personal trainers at Fitaz Gym. You signed up recently and your details came through to me, so I thought I'd reach out personally. Is now an okay time for a quick one? ... Have you trained with a coach before, or is this more of a fresh start? ... [listen] ... What I'd love to do is get you in for a complimentary session, just so you can see the place, meet me, and we can talk through what you're chasing. No pressure, no commitment. Are you better earlier or later in the week?”",
        "Once they say yes, lock the detail. Day, time, what to bring, where to meet, and the cancellation policy. Vague bookings become no-shows.",
        "**When they say no thanks.** Plenty will, and that's fine. Don't take it personally and don't argue the point. A graceful no leaves the door open for later, a pushy comeback slams it shut.",
        "> “No worries at all, [Name]. If things change down the track, or you just want to come check the place out, I'm here. All the best with it.”",
        "Then note them for a follow-up (the 2-2-2 rule, coming up next). A clean no today is often a yes in a couple of months, but only if you left them feeling respected.",
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
        "Some people won't answer an unknown number but will reply to a text within the hour. Text is your backup and, for a lot of leads, their preferred channel. Keep it short, name the gym, and make replying easy.",
        "**Warm text**",
        "> “Hey [Name], it's [Your Name] from Fitaz Gym. Great chatting on the floor the other day. Keen to lock in that session we talked about. Are you better earlier or later in the week?”",
        "**Cold text**",
        "> “Hi [Name], it's [Your Name], a personal trainer at Fitaz Gym. You signed up recently so your details came through to me. I'd love to get you in for a complimentary session to show you around and talk through your goals, no strings. Are you better earlier or later in the week?”",
        "**Referral text**",
        "> “Hey [Name], it's [Your Name] from Fitaz Gym. [Friend] trains with me and mentioned you might be keen. Happy to get you in for a complimentary session and see if we're a good fit. What's your week looking like?”",
        "Notice every one ends with an easy either/or, not “let me know if you're interested.” “Earlier or later in the week” is a softer ask than “yes or no,” and it gets a reply.",
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
        "Most of your early leads won't come from your own marketing. They'll come from the gym. Here's how that works at Fitaz Gym right now.",
        "- Each week the PT Manager runs a report on new members who've joined since the last one and drops the details into the lead spreadsheet (the “PT Lead Form”).",
        "- The PT Manager assigns each lead to a trainer and emails the team once the new leads are up.",
        "- You contact your assigned leads within **48 hours**. Call, text, or email, whatever suits your system. The goal is to book a complimentary consult.",
        "- You update the Status column as things move: Contacted, Interested, Not Interested, Comp. Booked, Converted.",
        "- Keep the status current. It's how the Manager sees what's working and where leads are getting stuck.",
        "- Hit a problem, or a lead you can't take? Email the PT Manager to pass it to the next trainer.",
        "Leads are allocated on workload, not seniority. Newer trainers get a fair run, either by volume or by the warmer leads, unless another trainer is clearly the better fit. If a new member asks for a specific trainer, that comes first. After that it's about matching the right PT to the member, then the Manager's call.",
        "The sheet tracks Date Added, Name, Email, Mobile, Lead Source, Comments, PT Allocated, and Status. Lead sources you'll see include New Member, Fitness Passport, and various promotions run throughout the year. Here's a sample of the allocation tab:",
        "| Date Added | Name | Lead Source | PT Allocated | Status |\n| --- | --- | --- | --- | --- |\n| 1-7-26 | Jack Russell | Fitness Passport | Karl | Contacted |\n| 1-7-26 | James Smith | New Member | Shahd | Interested |\n| 1-7-26 | Eileen Jones | FFW | GSP | Not Interested |\n| 1-7-26 | Katie King | 12WC | Julie | Comp. Booked |\n| 1-7-26 | Dane Margret | $21 for 21 Days | Dylan | Converted |\n| 1-7-26 | Bella Vista | New Member | Michael | |",
        "Keep your own simple list of who you've contacted and where each one's at, so nobody slips through the cracks while you're juggling a full board of clients.",
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
        "Most leads don't sign up the first time, and that's normal. Some go quiet on you, some say “not right now.” Neither is a dead end, it's usually just timing. The 2-2-2 rule keeps you on their radar without becoming the trainer who can't take a hint. It works the same whether they ghosted you or gave you a polite no, the touches just flex a little to match.",
        "- **2 days after first contact:** a light nudge. If they went quiet: “Hey [Name], no rush at all, just checking you got my message. Happy to hold a spot this week if you're keen.” If they said not right now: a quick “No worries, I'll check back down the track,” so the no feels respected, not pestered.",
        "- **2 weeks later:** check back in with something useful, not just “you still there?” A tip you genuinely think helps, an invite to a community session, or a quick “saw this and thought of you.”",
        "- **2 months later:** one more genuine reconnect. Life changes. The “not now” from January is often a “yes” by March.",
        "Here's what those second and third touches might actually sound like.",
        "**2-week tip**",
        "> “Hey [Name], saw this and thought of you, a quick read on training around night shifts. No agenda, just reckoned it might help. Hope you're travelling well.”",
        "**2-week invite**",
        "> “Hey [Name], we've got a free community session Saturday morning, relaxed vibe and a good crew. Want me to save you a spot?”",
        "**2-month reconnect**",
        "> “Hey [Name], it's [Your Name] from Fitaz Gym, been a while. No pressure at all, just wondering how you've been going with your training. If you ever want that complimentary session, the offer still stands.”",
        "This maps to step 6 of the client journey, Follow-Up. It's the step most PTs skip, and it's where a big chunk of your conversions actually live. Note each one with the date of your next touch so none slip through.",
        "Each touch should feel like a person who remembers them, not an automated sequence. If it ever feels like you're nagging, you've made it about you. Make it about them and it stays welcome.",
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
        "People commit when they feel certain. Certain about you, about the plan, and about their own ability to stick with it. That certainty comes in two flavours, and a good sales chat builds both.",
        "- **Emotional certainty** is the feeling: “this is right for me.” You build it by listening, showing you get them, and connecting their goals to what they actually want out of life.",
        "- **Logical certainty** is the facts: “this will actually work.” You build it by explaining how the coaching runs, showing results, and laying out a clear plan.",
        "Lead with emotional, back it with logical. People decide on feeling and justify with reason. Hit only the logic and they nod, then leave to “think about it.” Hit only the feeling and they get excited, then talk themselves out of it on the drive home. You need both.",
        "| | **Emotional certainty** | **Logical certainty** |\n| --- | --- | --- |\n| The belief you're building | “This is right for me.” | “This will actually work.” |\n| How you build it | Listen to their story, show you get them, connect their goals to the life they want, name what's at stake. | Explain how the coaching runs, show results and credentials, lay out a clear plan, spell out what's included. |\n| What to ask or say | Why does this goal matter to you now? What's stopped you before? What changes if you pull this off? | Here's how the program works. Here's what clients like you have achieved. Here's the cost and exactly what you get. |",
        "This isn't a script, it's a checklist for the conversation. By the time you talk price, both columns should be ticked.",
        "When someone seems keen but won't commit, it's usually because one of these columns is missing. Work out which one and you know exactly what the next conversation needs to do.",
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
        "The sales chat usually happens straight after the complimentary session, which Part 5 covers. They've shown up, given you their time, and had a good experience. Now you help them take the next step. This is step 5 of the client journey, and it's the highest-leverage conversation you'll have with anyone.",
        "You're not opening with price. You're opening with connection and clarity. Five steps: Engage, Frame, Summarise, Plan, Recommend. Here's Taylor running all five with Mel, the ICU nurse she cold-called earlier.",
        "**1. Engage.** Start with a real chat. How did they find the session? What felt good? What challenged them? Be specific with your praise, it shows you were paying attention.",
        "> **Taylor:** “Mel, how'd you find that?”",
        "> **Mel:** “Better than I expected. I actually liked the technique stuff, I could feel the difference straight away.”",
        "> **Taylor:** “Yeah, you picked it up fast, and you pushed through that last set when it got hard. That tells me you're serious about this.”",
        "**2. Frame.** Tell them what's next and get permission to go there. Permission makes the rest of the conversation feel collaborative, not pushy.",
        "> **Taylor:** “What I'd like to do now is run you through what I picked up about you today and show you the plan I reckon would work best. Sound good?”",
        "**3. Summarise.** Reflect back what they've told you and what you saw. This proves you listened and that the plan is built for them, not pulled off a shelf. Cover their goals and motivations, what's held them back, and anything you noticed in the session.",
        "> **Taylor:** “So when we sat down, you said the main thing is building strength and stamina so the physical side of nursing stops wrecking you. Twelve-hour shifts, lifting and repositioning patients, and a back that's been grumbling. You've struggled to stay consistent when the roster goes mad, and you want something that fits around your shifts, not the other way round. Did I miss anything?”",
        "> **Mel:** “No, that's it exactly.”",
        "> **Taylor:** “And in the session I noticed a bit of instability through your mid-back on the carries, which could be feeding that soreness. That's an easy early win. Everything else looked solid, your squat and hinge are already strong. Any questions on what we did?”",
        "**4. Plan.** Map out how the next 8 to 12 weeks could look. Realistic, personal, tied to what they care about.",
        "> **Taylor:** “Your goal is doable inside 12 weeks. I'd build it in three phases. First four weeks we lock in core control and carrying mechanics, the stuff that protects your back on shift. Weeks five to eight we load it up, squats, hinges, carries, so you feel stronger under fatigue. Last four weeks we make it shift-proof, longer carries and conditioning that mirrors a busy night. Does that line up with what you're after?”",
        "**5. Recommend.** Now you talk price and options. You've earned it. Keep it simple and tie everything back to the value you've already shown.",
        "> **Taylor:** “Here's how I'd support you across those 12 weeks. I split it into two parts. Your training is $80 a session, 45 minutes each. Then there's a flat $20 a week for your program and coaching app, which covers your personalised program, demo videos, weekly check-ins, and progress tracking. The reason I separate them is so you're supported every single week, even the odd one where we can't get a session in because you're on nights or I'm away. You're never left without a plan. Most clients with a goal like yours train twice a week, and given your roster I'd suggest we start there and adjust as we go. How does that sound?”",
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
        "Price is where new PTs flinch — don't. If you believe in the value, say the price plainly and let the silence sit. Here's how Taylor does it, using her own rate:",
        "> **Taylor:** “I run it in two parts. Training is $80 for a 45-minute session. On top of that there's a flat $20 a week for your program and coaching app, which covers your personalised program, weekly check-ins, and progress tracking. That weekly fee means you're supported every week, even the ones we don't train, so you're never paying for nothing and never left without a plan.”",
        "Splitting training from coaching does two things. It shows the client they're paying for more than just gym time, and it means you still get paid for the programming and check-ins you do in any week a session doesn't happen, whether that's you or them away, sick, or slammed at work. The coaching doesn't stop just because a session got missed.",
        "- **Be direct.** No apologising, no “it's a bit pricey but...”",
        "- **Lead with value, not cost.** They're investing in the outcome, not buying a slot.",
        "- **Say the number and pause.** Don't talk yourself into a discount nobody asked for.",
        "- **Think hard before discounting.** Discounting trains clients to wait for a sale and quietly tells them your normal rate is negotiable. If you want to move someone, add value instead: an extra check-in, a program tweak. Same goodwill, no damage to your rate.",
      ],
      activities: [
        { key: "pricing-line", prompt: "Write your pricing line. Say it out loud until you can deliver the number without flinching or padding it.", multiline: true },
      ],
      managerNote:
        "The split in the example, $80 per 45-minute session plus a flat $20 a week for the program and coaching app, is one model that works well here, not a rate the gym sets. The PT prices their own business. What is worth teaching is the logic of the weekly fee: it keeps them paid for programming and check-ins in weeks a session doesn't happen. If a PT's instinct is to drop the price to close, that's a confidence problem, not a pricing problem. Fix the value conversation, not the number.",
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
