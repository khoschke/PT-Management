# Part 7 content for the .docx masters, with the 15 to 18 Nov 2026 amendments.
# Block types:
#   ("KEEP", start, end)  copy the original document's top-level elements [start, end)
#   ("H1", text) ("H2", text)
#   ("P", text)           **bold** allowed
#   ("B", label, text)    bullet with a bold lead-in ("" for no lead-in)
#   ("S", text)           a script line, as its own paragraph
#   ("D", [lines])        dialogue: one paragraph, lines split by breaks
#   ("NOTE", text) ("EX", text)   manager note / worked example boxes (Cheat Sheet only)
#   ("ACT", prompt)       activity prompt plus an answer line
#   ("TABLE", widths, rows)  first row is the header

C = []
A = C.append

# Title block and part intro: unchanged.
A(("KEEP", 0, 6))

# ---- Item 12: the one-page lead flow -------------------------------------
A(("H1", "How a Lead Moves Through the Portal"))
A(("P", "Before the scripts and the sales chat, here's the whole journey of a lead in one place. The sections after this zoom in on each step. When the process changes, this page changes first."))
A(("P", "**1. A lead reaches you.** There are four kinds. Each one lands on your lead board in the PT portal."))
A(("TABLE", [2600, 7364], [
    ["", "Who they are"],
    ["Warm (form)", "Asked about PT themselves through the gym's form."],
    ["Flagged", "Added by the PT Manager after a conversation, an email or a heads-up. They've shown some interest."],
    ["Unverified (cold)", "A new member who hasn't asked about PT. They reach you around day 10 to 17, after two of the gym's three welcome emails."],
    ["Own lead", "Someone you found yourself and added with Add my own lead."],
]))
A(("P", "**2. First contact within 48 hours**, whatever the kind. Once you've reached out, set the lead to Contacted, whether or not they replied."))
A(("P", "**3. Then one of three things happens.**"))
A(("B", "They book.", "  Comp. Booked, then Attended once the session happens, then Converted or Not interested once they decide."))
A(("B", "They go quiet.", "  The 2-2-2 runs itself: a nudge at 2 days, a touch at 2 weeks, a reconnect at 2 months. Tap Done after each one. A week after the reconnect with no reply, the lead closes as Unreachable."))
A(("B", "They say no.", "  Set Said no. You have 48 hours to ask once: “Mind if I check in down the track, or would you rather I leave it there?” A yes goes to Agreed to check-in and the 2-2-2 picks up at the 2-week touch. A “leave it” or no answer closes the lead. Miss the 48 hours and the portal closes it for you and lets the PT Manager know."))
A(("P", "**4. Opt-outs are final.** A STOP, a “leave it there,” or picking Not interested closes the lead after a confirm, with a note saying why. Nobody contacts them about PT again. The one exception is a lead the portal closed because the 48-hour window on a no was missed: the PT Manager can reopen that one if it was a mistake."))
A(("P", "**5. You don't have to remember any of it.** Your board shows what's due on each lead, a short email lands on any morning something's due, and your Monday email lists the week."))
A(("NOTE", "Walk new PTs through this page with their lead board open next to it, ideally with a test lead they can click through: Contacted, Done, Said no, the permission answer. Five minutes of clicking beats reading it twice. When the process changes, update this page first, then the sections that point to it."))

# ---- Sales mindset: unchanged --------------------------------------------
A(("KEEP", 6, 18))

# ---- Cold vs warm (item 7 terms) -----------------------------------------
A(("H1", "Cold vs Warm Lead Scripts"))
A(("P", "Not every lead is the same temperature, and the temperature changes how you open."))
A(("B", "Warm lead:", "  someone who already knows you exist or has put their hand up. They've trained with you, met you on the floor, been referred by a mate, or asked the gym about PT. There's a thread to pull on."))
A(("B", "Cold lead:", "  an unverified lead. A new member who hasn't asked about PT yet and has never met you. No thread yet, so you make one."))
A(("P", "A cold lead isn't a “no,” it's a “not yet introduced.” How a Lead Moves Through the Portal, at the start of this part, shows where each kind comes from."))
A(("P", "The difference is the opening. Warm, you reference the shared moment. Cold, you say who you are, how you got their details, and why you're worth two minutes. After that, both roads lead to the same place: book a complimentary session."))
A(("NOTE", "Most new PTs only think to prepare a warm script (“we met on the floor last Tuesday”), then freeze the first time they get a cold list, which is week one for most of them. Make sure they can run both. The cold opener is the one they'll use most."))

# ---- Phone (item 5) --------------------------------------------------------
A(("H1", "Phone Approach: First Contact"))
A(("KEEP", 27, 30))  # intro, telemarketer voice, "Warm call" heading
A(("S", "“Hey [Name], it's [Your Name] from Fitaz Gym. We had a chat on the floor last week about your training. Is now alright? ... Good. I said I'd sort out a session for us, so that's why I'm calling. Are you better earlier or later in the week? ... Tuesday or Thursday? ... Sweet, Thursday 6:30am. Wear something you can sweat in, bring a water bottle, and I'll meet you at reception. I'll text you the PT Waiver Form link to fill in before then. Quick heads up, I've got a 24-hour cancellation policy, so just message me if anything changes. Looking forward to it.”"))
A(("H2", "Who you're calling on a cold call"))
A(("P", "An unverified lead is a new member who hasn't asked about PT. They reach you somewhere between day 10 and day 17 of their membership, after the gym has sent them two of its three welcome emails. Both emails told them a complimentary PT consultation and starter session already comes with their membership, and that a trainer would be matched to them. So you're not selling them something new. You're helping them use something they already have."))
A(("H2", "Cold call"))
A(("S", "“Hi, is this [Name]? ... Hey [Name], it's [Your Name], one of the personal trainers at Fitaz Gym. Is now an okay time for a quick one? ... You might have seen a couple of emails from us about the complimentary PT session that comes with your membership. I'm the trainer who'd look after you, so I thought I'd call and get it booked in. Have you trained with a coach before, or is this more of a fresh start? ... [listen] ... The session's already yours. We'll set your goals, show you around the floor and the gear, and you'll walk out with a plan you can run on your own. No pressure, no commitment. Are you better earlier or later in the week?”"))
A(("P", "Once they say yes, lock the detail before you hang up: day, time, where to meet, what to bring, the PT Waiver Form (say you'll text the link), and your 24-hour cancellation policy. Vague bookings become no-shows."))
A(("H2", "Handing over to another trainer"))
A(("P", "Sometimes someone else is the better fit: they've asked for a specific trainer, or their times don't match yours. Don't finish on “we'll take it from there.” Give them a specific follow-up, then make sure it happens."))
A(("S", "“[Trainer] is actually the best fit for what you're after. I'll get back to you within 48 hours with a couple of times that work for them.”"))
A(("H2", "When they say no thanks"))
A(("P", "Plenty will, and that's fine. Don't take it personally and don't argue the point. Ask one permission question, there and then, while you're still on the call:"))
A(("S", "“No worries at all, [Name]. Mind if I check in down the track, or would you rather I leave it there?”"))
A(("P", "Thank them and finish the call warmly either way. Then set the lead to Said no in the portal and record their answer: They said yes to a check-in puts them on the 2-2-2 (coming up shortly), and They said leave it there closes the lead. That's a STOP: no further contact about PT, and the gym's remaining PT emails stop too. Ask once only, and never as a separate follow-up later. A respectful no today keeps the door open, and keeps the gym's name good even if they never train with you."))
A(("NOTE", "The cold call scares them most. The fix is the complimentary session. It turns the call from “buy my thing” into “come and use what you've already got,” which is a much easier yes, and the gym's emails have already told the member it's theirs. Coach them to stop talking after they offer it and let the lead answer."))
A(("EX", "Taylor's cold call to Corey, an ICU nurse on day 12 of his membership: “Hey Corey, it's Taylor from Fitaz Gym, one of the trainers here. Is now alright? ... You might have seen a couple of emails from us about the complimentary PT session with your membership. I'm the trainer who'd look after you, and I used to be a paramedic, so I get the rotating roster thing better than most. What's got you into the gym right now?” Corey talked for two minutes about night shifts and a sore back. Taylor booked him in on the spot and locked the detail: Thursday at 2pm after his last night shift, meet at reception, waiver link by text that afternoon, and her 24-hour cancellation policy. The shared shift-work background did the heavy lifting."))
A(("ACT", "Write your cold-call opener in your own words. Say it out loud until it stops sounding like a script."))

# ---- Text (item 6) ---------------------------------------------------------
A(("H1", "Text Approach: First Contact"))
A(("P", "Some people won't answer an unknown number but will reply to a text within the hour. Text is your backup and, for a lot of leads, their preferred channel. Keep it short, name yourself and the gym, and make replying easy. The cold text goes to the same unverified leads as the cold call, so it can mention the emails too."))
A(("H2", "Warm text"))
A(("S", "“Hey [Name], it's [Your Name] from Fitaz Gym. Great chatting on the floor the other day. Keen to lock in that session we talked about. Are you better earlier or later in the week? Reply STOP to opt out.”"))
A(("H2", "Cold text"))
A(("S", "“Hi [Name], it's [Your Name], a personal trainer at Fitaz Gym. You might have seen a couple of emails from us about the complimentary PT session that comes with your membership. I'd love to get it booked in for you. Are you better earlier or later in the week? Reply STOP to opt out.”"))
A(("H2", "Referral text"))
A(("S", "“Hey [Name], it's [Your Name] from Fitaz Gym. [Friend] trains with me and mentioned you might be keen. Happy to get you in for a complimentary session and see if we're a good fit. What's your week looking like? Reply STOP to opt out.”"))
A(("P", "Notice every one ends with an easy either/or, not “let me know if you're interested.” “Earlier or later in the week” is a softer ask than “yes or no,” and it gets a reply."))
A(("H2", "Why every first text ends with “Reply STOP to opt out”"))
A(("P", "These texts promote a service, so under the Spam Act 2003 they count as commercial messages, even though the session is free and it's one text to one person. Each one has to say who it's from (your name and Fitaz Gym) and give the person a way to opt out. Put the line on every first-contact text. You don't need it on every reply once you're in a conversation. If someone replies STOP, that's the end: no further contact about PT, by text or any other way. Open the lead the same day and tap They replied STOP under End communication."))
A(("NOTE", "Watch for the essay text. New PTs try to cram the whole pitch into the first message and it reads like spam. The job of the text is one thing: get a reply. Three or four sentences, max, plus the opt-out line. Save the detail for when they answer. Check every first-contact text a new PT drafts has “Reply STOP to opt out” on the end."))
A(("ACT", "Draft your cold-lead first text. Cut it until it's four sentences or fewer, plus the opt-out line."))

# ---- Lead process (item 7) ---------------------------------------------------
A(("H1", "The Gym-Provided Lead Process"))
A(("P", "Most of your early leads won't come from your own marketing. They'll come from the gym, through the PT portal. How a Lead Moves Through the Portal (at the start of this part) has the whole journey. This section is the detail: the three kinds the gym sends you, how to open with each, and what the statuses mean."))
A(("TABLE", [1900, 2850, 2850, 2364], [
    ["", "Who they are", "How they reach you", "How to open"],
    ["Warm (form)", "Asked about PT themselves through the gym's form, for a specific trainer or PT in general.", "Allocated to you in the portal, with their goals, preferred times and any trainer request.", "Warm call or text. They asked, so you're booking a time, not selling a session."],
    ["Flagged", "Added by the PT Manager after a conversation on the floor, an email, or a heads-up from front of house. They've shown interest or been flagged for a reason.", "Allocated to you in the portal, with the context in the notes.", "Warm. Mention whatever got them flagged."],
    ["Unverified (cold)", "A new member who hasn't asked about PT.", "Allocated to you around day 10 to 17 of their membership, after two of the gym's three welcome emails.", "The cold call or cold text above."],
]))
A(("B", "", "When a lead is allocated to you, you get an email and it appears on your lead board in the portal."))
A(("B", "", "Make first contact within 48 hours, whatever the lead type. Call, text or email, whatever suits your system. The goal is to book the complimentary session. The board shows where each lead sits against the clock."))
A(("B", "", "Update the lead's status as things move, using the statuses below."))
A(("B", "", "Followed up without changing the status? Tap Log contact, so the date still counts."))
A(("B", "", "Every Monday morning you get an email listing your active leads, never-contacted first."))
A(("B", "", "Hit a problem, or a lead you can't take? Let the PT Manager know, so they can pass it to another trainer."))
A(("TABLE", [2600, 7364], [
    ["Status", "Means"],
    ["Contacted", "You've reached out (call, text or email), whether or not they replied."],
    ["Comp. Booked", "A date is locked in for the complimentary session."],
    ["Attended", "The session happened, decision pending. Move it on once they decide."],
    ["Converted", "They've signed up to paid PT."],
    ["Said no", "They said no or not right now. You have 48 hours to ask the permission question (see the 2-2-2 rule)."],
    ["Agreed to check-in", "They said yes to a check-in, so they're on the 2-2-2."],
    ["Not interested", "They said no, or opted out. Never contacted again about PT."],
    ["Unreachable", "You tried and never got a reply."],
]))
A(("P", "Two habits keep the numbers honest. **Tick through every step that happened**, even when two happen at once: someone who signs up at the end of their session goes Attended, then Converted. And **use Unreachable, not Not interested, when you simply couldn't reach them.** Unreachable leads stay in the gym's welcome emails on purpose, because someone who never picks up is exactly who those emails are for. Not interested is for someone who actually said no."))
A(("P", "Keep the status current. It's how the PT Manager sees what's working and where leads get stuck, and it decides who keeps getting the gym's PT emails. If someone told you no and then gets an email saying their session is about to close, it looks like nobody's talking to each other."))
A(("P", "Leads are allocated on workload, not seniority. Newer trainers get a fair run, either by volume or by the warmer leads, unless another trainer is clearly the better fit. If a member asks for a specific trainer, that comes first. After that it's about matching the right PT to the member, then the PT Manager's call."))
A(("P", "**Leads you find yourself** (on the floor, through a referral, on social, or someone you pick up from the unverified list) go in the portal too. Tap Add my own lead on your lead board and pick where you found them. They're allocated straight to you, the 48-hour clock starts, and from there they work like any other lead. If the portal says the member's already in there, check with the PT Manager rather than contacting them: someone else may be looking after them, or they may have asked not to be contacted."))
A(("NOTE", "This is the section new PTs reread most, because it's the bit that actually puts people in front of them. Walk them through the lead board in the portal in week one rather than leaving them to decode it off the page. The 48-hour turnaround is the number that matters most, because leads go cold fast. Check they know the difference between Unreachable and Not interested. It's the status most often got wrong, and it decides who keeps getting the gym's emails."))
A(("EX", "Taylor gets three leads on Monday: a warm form lead, a flagged lead the PT Manager chatted to on the floor, and an unverified lead on day 12 of his membership. She texts the warm lead within the hour, calls the flagged lead and mentions the chat on the floor, and runs her cold call on the unverified lead. The first two book a complimentary session, so they go to Comp. Booked. The unverified lead doesn't pick up, so she sends the cold text and marks him Contacted. All three statuses are done before lunch, so the PT Manager isn't chasing her. That's a normal week."))
A(("ACT", "Open your PT portal and check your current leads. Which one is closest to the 48-hour mark, and what's your next step with them?"))

# ---- 2-2-2 (items 10 and 11) -----------------------------------------------
A(("H1", "The 2-2-2 Rule for Leads Who Don't Convert"))
A(("P", "Most leads don't sign up the first time, and that's normal. What you do next depends on which of two things happened."))
A(("P", "**They went quiet.** No reply at all to your first contact. They haven't said no, so the 2-2-2 rule below applies. It keeps you on their radar without becoming the trainer who can't take a hint."))
A(("P", "**They said no.** “No thanks,” “not for me,” “not right now.” A no is treated the same as a STOP: no follow-ups unless they agree to them. So reply once, in the same conversation, with the permission question:"))
A(("S", "“Totally fine. Mind if I check in down the track, or would you rather I leave it there?”"))
A(("B", "", "If they say yes to a check-in, they go onto the 2-2-2 below, and every touch is one they agreed to."))
A(("B", "", "If they say leave it there, or don't answer, that's a STOP and the lead closes."))
A(("B", "", "Ask once. The permission question is part of the no conversation, never a separate follow-up later."))
A(("P", "**You have 48 hours to ask.** From the moment a no comes in, you've got 48 hours to send the permission question. After that, asking would be pestering, so the window closes and the lead is treated as a STOP. 48 hours is the outer limit, not the target: if the no comes on the phone or face to face, ask there and then."))
A(("H2", "The three touches"))
A(("B", "2 days after first contact:", "  a light nudge, for leads who went quiet. For someone who said no, the permission question takes the place of this touch."))
A(("B", "2 weeks later:", "  check back in with something useful, not just “you still there?” A tip you genuinely think helps, an invite to Social Saturday, or a quick “saw this and thought of you.”"))
A(("B", "2 months later:", "  one more genuine reconnect. Life changes. The “not now” from January is often a “yes” by March. This one usually lands after weeks of quiet, so treat it as a fresh first contact and end it with “Reply STOP to opt out.” The 2-day and 2-week touches carry on a conversation, so they don't need it."))
A(("P", "Here's what each touch might actually sound like. The 2-week touch has two examples, a tip or an invite: pick whichever suits the person, not both."))
A(("B", "2-day nudge (went quiet only):", "  “Hey [Name], no rush at all, just checking you got my message. Happy to hold a spot this week if you're keen.”"))
A(("B", "2-week touch, option 1, a tip:", "  “Hey [Name], saw this and thought of you, a quick read on training around night shifts. No agenda, just reckoned it might help. Hope you're travelling well.”"))
A(("B", "2-week touch, option 2, an invite:", "  “Hey [Name], we've got Social Saturday coming up, a free session that's open to everyone, relaxed vibe and a good crew. You're welcome to bring a friend along too. Want me to save you both a spot?”"))
A(("B", "2-month reconnect:", "  “Hey [Name], it's [Your Name] from Fitaz Gym, been a while. No pressure at all, just wondering how you've been going with your training. If you ever want that complimentary session, the offer still stands. Reply STOP to opt out.”"))
A(("P", "**When it ends.** After the 2-month reconnect, if nothing changes for a week, the portal closes the lead as Unreachable. And any of these ends everything straight away: a STOP, a “leave it there,” no answer to the permission question within a week, or a missed 48-hour window on a no. The lead closes as Not interested, and they're never contacted about PT again."))
A(("P", "**How the portal runs it.** The timing is handled for you (see How a Lead Moves Through the Portal, at the start of this part). On each lead: tap Done after each touch, set Said no when someone says no, then record their answer: They said yes to a check-in, They said leave it there, or Asked by text, waiting. If you did ask in time but missed updating the portal and the timer closes the lead, tell the PT Manager: they can reopen it. When a prospect ends it themselves, use End communication on the lead."))
A(("P", "This maps to step 6 of the client journey, Follow-Up. It's the step most PTs skip, and it's where a big chunk of your conversions actually live."))
A(("KEEP", 84, 85))  # "Each touch should feel like a person who remembers them..."
A(("NOTE", "PTs tend to go one of two ways with a no: bin the lead, or keep messaging someone who's already said no. The permission question fixes both. It's one line, asked once, and the lead decides. Watch the 48-hour window on a no, and check PTs are recording a “leave it there” straight away. For leads who went quiet, the biggest unlock is still that most PTs never follow up even once. Just doing the two-day touch puts them ahead of the field."))
A(("EX", "Frankie told Taylor on the first call it wasn't the right time. She was mid-block of nights and couldn't think past sleep. Taylor asked there and then: “Mind if I check in down the track, or would you rather I leave it there?” Frankie said to check in. A fortnight later Taylor sent her a shift-worker sleep tip. When Frankie's roster eased six weeks later, she remembered the trainer who got it and booked in. One permission question, two light touches, one client."))
A(("ACT", "Pick one lead in your portal who went quiet. Which 2-2-2 touch are they due for, and what will you send?"))

# ---- Certainty (item 13) ----------------------------------------------------
A(("H1", "Creating Certainty: Emotional, Logical and Self-Belief"))
A(("P", "People commit when they feel certain. Certain about you, about the plan, and about their own ability to stick with it. That's three kinds of certainty, and a good sales chat builds all three."))
A(("B", "Emotional certainty", "  is the feeling: “this is right for me.” You build it by listening, showing you get them, and reflecting back what matters to them."))
A(("B", "Logical certainty", "  is the facts: “this will actually work.” You build it by explaining how the coaching runs and laying out a clear plan. Client stories help, shared with permission, as examples of what's possible, never as a promise of results."))
A(("B", "Self-belief", "  is “I can actually do this.” For clients who've tried everything before, it's often the one that matters most. You build it with a plan sized to their real week and small wins early on."))
A(("P", "Lead with emotional, back it with logical, and make sure they leave believing they can do it. People need it to feel right and make sense. Hit only the logic and they nod, then leave to “think about it.” Hit only the feeling and they get excited, then talk themselves out of it on the drive home. Skip self-belief and they agree it's a great plan for someone else."))
A(("TABLE", [1900, 2688, 2688, 2688], [
    ["", "Emotional certainty", "Logical certainty", "Self-belief"],
    ["The belief you're building", "“This is right for me.”", "“This will actually work.”", "“I can actually do this.”"],
    ["How you build it", "Listen to their story, show you get them, connect their goals to the life they want, reflect back what matters to them.", "Explain how the coaching runs, lay out a clear plan, spell out what's included. Share client stories, with permission, as examples of what's possible, never as a promise.", "Size the plan to their real week, build on something they've stuck with before, and set a first win they can hit early."],
    ["What to ask or say", "What's made now the time? What's got in the way of it sticking before? If this goes well, what's different in six months?", "Here's how the program works. Here's a client story, shared with their permission. Here's the cost and exactly what you get.", "What's one thing you've stuck with before, in any part of life? What would make this feel doable in a normal week?"],
]))
A(("P", "This isn't a script, it's a checklist for the conversation. By the time you talk price, all three columns should be ticked."))
A(("P", "When someone seems keen but won't commit, it's usually because one of the three is missing. Work out which one and you know exactly what the next conversation needs to do."))
A(("NOTE", "This is the most useful diagnostic in the whole sales section. When a PT says “they seemed keen but didn't sign,” ask which certainty was missing. Usually they built one and forgot another. The emotional side gets skipped because logic feels safer to talk about, and self-belief gets skipped because PTs assume it's there."))
A(("ACT", "Think of a goal a client of yours might have. What's one emotional, one logical and one self-belief certainty you'd want to build for them?"))

# ---- Sales chat (item 14) ---------------------------------------------------
A(("H1", "The Sales Chat: 5-Step Framework"))
A(("KEEP", 105, 106))
A(("P", "You're not opening with price. You're opening with connection and clarity. Five steps: Engage, Frame, Summarise, Plan, Recommend. Here's Taylor running all five with Corey, the unverified lead from her cold call earlier, straight after his complimentary session."))
A(("KEEP", 107, 109))  # "1. Engage" + guidance
A(("D", ["Taylor: “Corey, how'd you find that?”", "Corey: “Better than I expected. I actually liked the technique stuff, I could feel the difference straight away.”", "Taylor: “Yeah, you picked up the hinge really fast. Most people take a few sessions to feel that.”"]))
A(("KEEP", 110, 115))  # Frame heading, guidance, script; Summarise heading, guidance
A(("D", ["Taylor: “So when we sat down, you said the main thing is building strength and stamina so the physical side of nursing stops wrecking you. Twelve-hour shifts, lifting and repositioning patients, and a back that's been grumbling. Sticking with it has been hard when the roster goes mad, and you want something that fits around your shifts, not the other way round. Did I miss anything?”", "Corey: “No, that's it exactly.”", "Taylor: “And in the session I noticed your mid-back tiring on the carries. That's something we can strengthen, and it's an easy early win. If the soreness hangs around, it's worth getting your physio or GP to have a look too. Everything else looked solid, your squat and hinge are already strong. Any questions on what we did?”"]))
A(("KEEP", 116, 118))  # Plan heading + guidance
A(("D", ["Taylor: “Twelve weeks is a realistic block to make real progress on this. I'd build it in three phases. First four weeks we lock in core control and carrying technique, the strength you use every shift. Weeks five to eight we load it up, squats, hinges, carries, so you feel stronger under fatigue. Last four weeks we make it shift-proof, longer carries and conditioning that mirrors a busy night. Does that line up with what you're after?”"]))
A(("H2", "5. Recommend"))
A(("P", "Now you talk price and options. You've earned it. Say the commitment out loud, give the weekly total as one number, and finish with a specific booking ask."))
A(("D", ["Taylor: “Here's what I'd recommend: a 12-week block, training twice a week. I split it into two parts. Your training is $80 a session, 45 minutes each. Then there's a flat $20 a week for your program and coaching app, which covers your personalised program, demo videos, weekly check-ins, and progress tracking. I separate them so you're supported every single week, even the odd one where we can't get a session in because you're on nights or I'm away. Twice a week, that's $180 a week all up. ... Want to start Monday?”"]))
A(("NOTE", "Get new PTs to run this as a roleplay until the steps are muscle memory. The two they skip under pressure are Frame (asking permission) and Summarise (reflecting back). Those are the two that make it feel like a conversation instead of a pitch. Listen for two scope slips in Summarise and Plan: linking a movement pattern to the cause of pain (that's a diagnosis, refer it on), and promising an outcome (sell the coaching, not a guaranteed result)."))
A(("ACT", "Write a one-line Engage opener and a one-line Frame line you'd actually say."))

# ---- Pricing (item 15) -------------------------------------------------------
A(("H1", "Explaining Pricing with Confidence"))
A(("KEEP", 127, 129))
A(("S", "“I run it in two parts. Training is $80 for a 45-minute session. On top of that there's a flat $20 a week for your program and coaching app, which covers your personalised program, weekly check-ins, and progress tracking. That weekly fee means you're supported every week, even the ones we don't train, so you keep making progress towards your goals. Twice a week, that's $180 a week all up.”"))
A(("KEEP", 130, 132))  # splitting paragraph, "Be direct"
A(("B", "Lead with value, not cost.", "  They're investing in support, not buying a slot."))
A(("B", "Give the weekly total.", "  Once you've said your session rate and any weekly fee, say the total for the arrangement they're considering as one number: “Twice a week, that's $X a week all up” (including GST, if you charge it). Nobody should be doing maths while they decide."))
A(("KEEP", 133, 137))  # "Say the number and pause", "Think hard before discounting", manager note, spacer
A(("ACT", "Write your pricing line. Say it out loud until you can deliver the number without flinching or padding it."))

# ---- Hesitations (item 17) ---------------------------------------------------
A(("H1", "Handling Hesitations"))
A(("P", "Often the hesitation isn't price, it's frequency. “Do I really need two sessions a week?” Here's how to think about it and how to talk about it."))
A(("KEEP", 141, 144))  # skill / accountability / stimulus bullets
A(("P", "So 2x a week is your recommended minimum and your default pitch. But it's a recommendation, not a rule. Some clients need more, some can only manage one, and budget, lifestyle and goals all factor in. Consistency beats volume every time. A client who shows up once a week for a year beats one who burns out on four sessions in a month."))
A(("KEEP", 145, 146))  # the "Totally fair question" script
A(("P", "If they still choose once a week, accept it and start there. Agree to review it at their first check-in, then let the progress do the talking. Don't keep pushing."))
A(("H2", "“I need to think about it”"))
A(("P", "Fair enough, and often true. It usually means one of the three certainties is missing, so ask gently what's on their mind:"))
A(("S", "“Of course. What's the bit you want to think through?”"))
A(("P", "If there's a real question, answer it. If they still want time, agree a specific time to reconnect before they leave (see Closing the Conversation, below)."))
A(("H2", "“I'll check with my partner”"))
A(("P", "Respect it. Money and time are often shared decisions. Make it easy for them to have that conversation:"))
A(("S", "“Makes sense. Want me to text you a quick summary of the plan and the weekly cost, so you've got it in front of you both?”"))
A(("P", "Then agree when you'll follow up."))
A(("NOTE", "Frame 2x a week as the recommended minimum, not a take-it-or-leave-it. The phrase that lands is “consistency over volume.” It lets the PT hold the recommendation while giving the client a real choice, which paradoxically makes them more likely to take it. A client pushed into three sessions they can't sustain churns in a month."))
A(("EX", "Corey balked at twice a week. His roster's all over the place. Taylor didn't drop it to one and fold. She said: “Here's what I'd do with your shifts. We lock one session you can always make, then float the second around your roster week to week. You get the benefit of two without pretending your schedule is something it isn't.” Corey signed up for two. The flex was the yes, not a discount."))
A(("ACT", "How would you explain the value of training twice a week to a hesitant client, in your own words?"))

# ---- Body language and voice (item 16) ---------------------------------------
A(("H1", "Body Language and Voice in the Sales Chat"))
A(("P", "Sometimes it's not what you say, it's how you're sitting and how you sound while you say it. In a conversation about trust and money, your body and your voice are talking the whole time."))
A(("KEEP", 154, 155))  # Stay open
A(("KEEP", 156, 157))  # Hold eye contact, gently
A(("B", "Warm through the conversation, neutral and steady at the number.", "  A smile right on the price can read as nervous or apologetic."))
A(("KEEP", 158, 159))  # Slow down
A(("B", "Keep your voice the same at the price.", "  Same pace, same tone as the rest of the conversation. Speeding up, or your voice lifting so the number sounds like a question, is the most common tell, and clients pick it up even when everything else is right."))
A(("P", "The two are linked. When your voice speeds up, your body has usually gone first: shallower breath, shoulders lifting, a small lean back. A grounded posture keeps your voice steady: feet flat, shoulders down, and a slow breath out before the number."))
A(("P", "Try this: record yourself saying your pricing line on your phone, then listen back for any change at the number."))
A(("P", "The aim is to stay relaxed and present, so what you say comes across clearly. If you're genuinely there to help, your body usually says so on its own. This just stops nerves from talking over you."))
A(("NOTE", "Body language and voice are where the sales chat is won or lost before a word about price. New PTs leak nerves: they look away on the number, they speed up, their voice lifts, they cross their arms. Film a roleplay on a phone and play it back. They'll see and hear it instantly, and noticing it is most of the fix."))
A(("ACT", "Which body language or voice habit do you most need to work on in a money conversation?"))

# ---- Closing (item 18) -------------------------------------------------------
A(("H1", "Closing the Conversation"))
A(("KEEP", 165, 166))
A(("P", "**When they say yes,** make the next step dead easy. Confirm the day and time of their first paid session. Send your agreement and payment setup straight after the yes, and the PT Waiver Form link if it isn't already done. Then tell them exactly what happens next. A clear next step is the difference between a “yes” and a “yes” that actually shows up. This rolls into step 7 of the journey, Agreement and Payment."))
A(("P", "**When it's a clear no,** thank them and ask your one permission question:"))
A(("S", "“Totally fine. Mind if I check in down the track, or would you rather I leave it there?”"))
A(("P", "Set the lead to Said no, and record their answer on the lead. Only start the 2-2-2 follow-up if they say yes to a check-in. Anything else is a STOP, and the lead closes."))
A(("P", "**When they're undecided** (“I need to think about it”), agree a specific time to reconnect before they leave, then note it on their lead in the portal so it doesn't rely on memory:"))
A(("S", "“Can I text you Thursday to see where you've landed?”"))
A(("P", "Run a two-minute reflection after every chat, win or lose. There's a one-page Post-Chat Reflection sheet at the end of this part you can print and reuse."))
A(("KEEP", 169, 172))  # every sale is practice, manager note, spacer
A(("KEEP", 172, 175))  # page-break paragraph, "Post-Chat Reflection" heading, intro
A(("P", "No sales chat yet? Run it on your most recent consult instead."))
A(("ACT", "What went well?"))
A(("ACT", "Where did it stall, if it did?"))
A(("ACT", "Which certainty was missing: emotional, logical or self-belief?"))
A(("ACT", "What would I do differently next time?"))
