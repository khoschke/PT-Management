import type { OnboardingPart } from "../types";

export const part1: OnboardingPart = {
  number: 1,
  slug: "welcome-and-orientation",
  title: "Welcome and Orientation",
  intro:
    "Welcome to Fitaz Gym. You're now part of a team and a community that takes coaching seriously. This workbook is your guide for the next 12 weeks and beyond.",
  sections: [
    {
      heading: "How to use this workbook",
      body: [
        "The workbook is broken into 10 parts. Each one tackles a different piece of the PT craft, from the role itself through to building and running your business.",
        "Throughout you'll find short activities. They're self-driven — the more you put in, the more you get out.",
        "Across the 12 weeks you've got four one-hour sessions with the PT Manager. Book them when you need them: working through an activity together, feedback on a consult, troubleshooting a client situation, or planning the next phase of your business. You're self-employed, so you set the agenda.",
      ],
      managerNote:
        "Walk the PT through this section in person on day one — it's the only section you typically read together. Use it to gauge their excitement and surface first-week nerves. Re-emphasise that the four one-hour sessions are bookable on the PT's timing, not a fixed cadence. Push them to book the first within their first week; if they haven't booked by day 10, reach out yourself.",
    },
    {
      heading: "Who's who",
      body: ["Your key Fitaz Gym contacts during onboarding."],
      activities: [
        {
          key: "contacts-saved",
          prompt:
            "Save the PT Manager, Gym Manager, senior trainers and front desk contacts in your phone now.",
          placeholder: "Done — or note who you still need details for",
        },
      ],
      managerNote:
        "Walk the PT around the gym in week one and introduce them to each person on the list. Don't rely on the workbook to do it for you — faces beat names on a page every time.",
    },
    {
      heading: "Introduction to Fitaz Gym",
      body: [
        "Fitaz Gym started in 2015 as FitazFK, an online fitness guides business. In 2017 we opened our physical home in Kangaroo Point, built around the FK Method (now Functional Group Training, or FGT). Today we operate as Fitaz Gym: our Brisbane gym, home to FGT, personal training and a full gym floor.",
        "Fitaz Gym is a community first and a gym second. People come for the training. They stay for the place and the people.",
        "**Our purpose:** to create happier, healthier humans. Move, connect, thrive.",
        "**Our vision:** to be the home of Brisbane's best trainers — a gym with soul, where performance training isn't just for athletes. It's for everybody.",
        "**Our core values:**",
        "- Community — belonging matters. We build a culture where everyone feels valued, supported, and part of something bigger.",
        "- Integrity — we say what we mean and follow through. Trust gets built, not declared.",
        "- Growth — small, consistent improvements beat big, inconsistent ones every time. Progress over perfection.",
      ],
    },
    {
      heading: "The role of a Fitaz Gym personal trainer",
      body: [
        "Being a Fitaz Gym PT isn't an employee job. You're a self-employed business owner running your business inside our community. That changes the shape of the role.",
        "Day to day, you're wearing two hats at once: coach and operator. Underneath both, you're a contributor to the community.",
        "**As a coach** — deliver sessions that are technically sound, tailored, and engaging. Run consults that set real goals. Program with intent. Check in on progress. Adjust what's not working. Hold your clients accountable when life gets in the way.",
        "**As an operator** — run the business side. Manage your schedule, track your numbers, follow up on leads, handle invoicing and admin, and keep investing in your own development.",
        "**As a contributor to the community** — the strongest trainers here aren't the ones with the biggest social following. They're the ones who know members by name, jump in when the gym needs a hand, and make the space better by being in it.",
        "You're encouraged to define your own mission, purpose, values and vision as a trainer — they sit alongside Fitaz Gym's, not inside them. We work through this in Part 2.",
      ],
      activities: [
        {
          key: "three-hats",
          prompt:
            "In one sentence each: as a coach, my job is… As an operator, my job is… As a community contributor, my job is…",
          multiline: true,
        },
      ],
      workedExample:
        "As a coach, my job is to design and deliver sessions that move clients toward their goals safely, while building the kind of trust that keeps them coming back.\n\nAs an operator, my job is to run a business that pays me well, doesn't burn me out, and gives me room to keep growing.\n\nAs a community contributor, my job is to leave the gym better than I found it. Know the members, back the team, add to the culture.",
      managerNote:
        "Use these answers in your first 1:1. If they only fill in the coach hat, or skip the community contributor one, that's a flag worth a conversation. Revisit at the end of the 12 weeks to see how their definitions have evolved.",
    },
    {
      heading: "Expectations over the next 12 weeks",
      body: [
        "1. **Engagement and active participation** — show up, be present, ask questions. Sessions with senior trainers, roleplays, floor time, and feedback conversations are where the real learning happens.",
        "2. **Mastering client consultations** — by the end of 12 weeks, run structured initial consults with confidence: SMART goals, progress-tracking check-ins, adjusting programs when needed.",
        "3. **Building strong client relationships** — retention is won in the small moments: active listening, remembering details, following up between sessions.",
        "4. **Professional communication** — your voice, your writing, your body language. Members form opinions of you in seconds.",
        "5. **Time and schedule management** — you run your own calendar. Leave room for sessions, admin, planning, recovery, and growth work.",
        "6. **Revenue and business development** — know your numbers: sessions needed each week, your pricing, and how you articulate the value of what you do.",
        "7. **Self-reflection and growth** — block time weekly to review what's working. Ask for feedback. Set development goals and track them.",
      ],
      managerNote:
        "These seven expectations get revisited in the Part 10 wrap-up. Refer back to them in 1:1s if a PT seems off track on one — they're also handy as a self-rating exercise midway through the 12 weeks.",
    },
    {
      heading: "How you'll be assessed",
      body: [
        "There are no formal exams. Each of the 10 parts contains short, self-driven activities — work through them at your own pace.",
        "Across the 12 weeks you have four one-hour sessions with the PT Manager, booked whenever they're most useful. The agenda is yours.",
        "The onus is on you. If you want help, ask. If you want to put your head down and run, do that. Either way, engagement drives outcomes.",
      ],
      activities: [
        {
          key: "book-first-session",
          prompt: "Book your first one-hour session with the PT Manager before you finish Part 1.",
          placeholder: "Date and time booked, or note if still pending",
        },
      ],
      managerNote:
        "Confirm the booking happens within the first 7 days. If it hasn't by day 10, send a quick check-in — don't wait for them to come to you in week one. Some PTs read “self-driven” as “hands-off”.",
    },
    {
      heading: "General gym cleanliness",
      body: [
        "Day-to-day cleanliness and tidiness is the responsibility of Fitaz Gym staff, not PTs. That said, every bit of help goes a long way: wipe down equipment after your sessions, re-rack weights, keep your corner tidy.",
      ],
    },
    {
      heading: "Safety and emergency protocols",
      body: [
        "Read this before your first session, and don't just skim it. Fitaz Gym has a full Safety and Emergency Protocols document you'll sign before you start on the floor. What follows is the working version: things you need to know cold, because in an emergency you won't have time to look them up.",
        "**Emergency contacts — save these in your phone before your first shift:**",
        "- Emergency services (police, fire, ambulance): 000",
        "- Poison Information Centre: 13 11 26",
        "- Non-emergency police: 131 444",
        "- Gym Director, Daniel Catanzaro: 0400 714 960",
        "- Gym Director, Georgio Batsinilas: 0422 357 316",
        "- Nearest hospital, Princess Alexandra Hospital, Woolloongabba: (07) 3176 2111",
        "- Gym inbox: team@fitazgym.com",
        "In any medical emergency, call 000 first. Anyone can make that call — you never need a manager's approval, and you never delay 000 to phone a director.",
        "**First aid kits and defibrillator.** Two first aid kits: on the wall next to reception, and a green free-standing box on top of the pigeonhole lockers next to the group fitness area. If you use anything, tell management so it gets restocked — both are checked monthly. The AED is on the wall next to reception, accessible 24/7, needs no special training, and talks you through every step. It doesn't replace calling 000.",
        "**If a member collapses or is unresponsive:**",
        "- 1. Call out for help — send someone to call 000 straight away.",
        "- 2. Check for a response: tap their shoulders firmly and call their name.",
        "- 3. If unresponsive and not breathing normally, start CPR.",
        "- 4. Send someone for the AED on the reception wall. Attach it and follow the audio prompts.",
        "- 5. If you're alone, call 000 on speaker so your hands are free for CPR.",
        "- 6. Keep going until emergency services arrive or the member comes good.",
        "- 7. Call one of the directors as soon as you can.",
        "- 8. Complete an incident report.",
        "**If a member is injured on the floor:** stop the session and remove further risk, assess the injury (call 000 if any doubt), don't move them if spinal/neck injury is possible, apply first aid as trained, note it if they decline an ambulance, tell management and complete an incident report.",
        "**Fire and evacuation.** If you discover a fire: set off the nearest alarm, call 000, don't fight it unless it's tiny/you're trained/you have a clear exit, and start moving people out. Evacuating: direct everyone to the nearest exit (front entrance, northern side; rear entrance, southern side), check change rooms and private areas, send everyone to the assembly point at **Captain Burke Park**, don't re-enter until emergency services say it's safe, account for everyone and notify management on 0400 714 960 or team@fitazgym.com, then complete an incident report. Fire extinguishers are near reception and near the hack squat — same rule: only use one if trained with a clear exit behind you.",
        "**Other situations:** aggressive or disruptive behaviour (stay calm, low steady voice, don't get cornered, call 000 if it escalates, 131 444 for non-urgent, tell management once things settle); faulty or damaged equipment (stop the client using it, tag it out of service, report and log an incident report); spills and slip hazards (wet floor signage immediately, PPE and biohazard steps for chemical/bodily-fluid spills, report if a member was involved or at risk).",
        "**Reporting an incident.** Report any injury, medical emergency or 000 call, fire or evacuation, aggressive behaviour, faulty equipment in use, or near-miss — anything that could have hurt someone but didn't. No blame in a good-faith near-miss report. Fill in the form as soon as you can, always within 24 hours, or email team@fitazgym.com if you can't do it online.",
        "**Training clients in unstaffed hours.** During 24/7 unstaffed access, members train at their own risk under their membership agreement. If you're running a session in those hours, you hold full duty of care for your client — know where the AED and exits are before you train anyone outside staffed times.",
        "CPR and First Aid certification requirements are covered in your PT contract. Keep them current, and get AED-trained if you aren't already.",
        "This is the short version. Read the full Safety and Emergency Protocols document, and sign the acknowledgement, before your first session. If you spot a gap in it, tell management.",
      ],
      managerNote:
        "Don't leave this as a paper exercise. Walk the PT physically through every emergency location in week one: defib, first aid kits, fire exits, assembly point. The workbook entry is reference only. And confirm the signed Safety and Emergency Protocols acknowledgement is on file before their first floor session.",
    },
    {
      heading: "Reporting an incident — the form",
      body: ["Reports are done online. There's a QR code at reception too."],
      links: [{ label: "Incident report form", url: "https://forms.gle/uuYPTSjnxNnpMsPZ7" }],
    },
    {
      heading: "Dress code",
      body: [
        "See your PT contract for the full dress code. Default expectation: clean Fitaz Gym branded apparel where supplied, neat and professional, closed footwear suitable for training.",
      ],
    },
    {
      heading: "Professional communication and first impressions",
      body: [
        "You've got about ten seconds to set the tone with someone new. Use them well.",
        "- Greet people by name. Use the GymMaster Staff App to check names if you don't remember — members notice.",
        "- Smile, make eye contact, stand open.",
        "- Ask about their day or their workout. Keep it light, make it human.",
        "- Offer help where it adds value. Don't hover.",
        "We go deep on communication in Part 4. For now, this is your default mode every time you walk through the door.",
      ],
      activities: [
        {
          key: "greet-by-name",
          prompt:
            "For your next shift, greet every member by name as they walk in. If you don't know their name, look it up. Notice what shifts in the room.",
          multiline: true,
        },
      ],
      managerNote:
        "Ask about this in your next 1:1. Was it natural? Did they look up names? Did members notice? It's a small reps exercise that builds the floor presence we want every Fitaz Gym PT to have.",
    },
  ],
};
