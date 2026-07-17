import type { OnboardingPart } from "../types";

export const part6: OnboardingPart = {
  number: 6,
  slug: "finding-clients",
  title: "Finding Clients",
  intro:
    "Coaching pays the bills, but only if people know you exist. This part is about working out who you serve, getting in front of them, and turning interest into booked consults. None of it is hype — it's a handful of habits run consistently.",
  sections: [
    {
      heading: "Understanding your target market: the 3Ps",
      body: [
        "Your target market is the type of person you serve best. Early on it's fine to train a bit of everyone — that's how you learn who you click with. Over time a pattern shows up. That pattern is your niche.",
        "**Passion** — who do you genuinely enjoy working with and naturally connect with?",
        "**Problem** — what specific problem can you solve for them, and is it worth solving?",
        "**Price** — do they value coaching, can they afford it, and are they willing to pay for it?",
      ],
      activities: [
        { key: "3ps-passion", prompt: "Passion — who do you care about helping, connect with easily, and get energy from coaching?", multiline: true },
        { key: "3ps-problem", prompt: "Problem — what specific problem can you solve for them, and is there real upside in solving it?", multiline: true },
        { key: "3ps-price", prompt: "Price — do they understand the value of coaching, can they afford you, and will they pay?", multiline: true },
      ],
      workedExample:
        "Taylor (ex-paramedic) runs the 3Ps. Passion: shift workers, especially health and emergency staff, because Taylor gets the broken sleep and the chaos of a rotating roster. Problem: low energy, no routine, and training that never survives a run of night shifts — big upside if solved. Price: nurses and paramedics earn a steady wage and value anything that protects their health, so yes on all three.",
      managerNote:
        "New PTs panic about niching too early, like one wrong choice locks them in for life. It doesn't — this is a first pass, not a tattoo. Reassure them the niche sharpens with experience. Watch for the trainer whose 3Ps describe everyone with a pulse: that's a sign they haven't committed to anyone yet.",
    },
    {
      heading: "Building your client avatar",
      body: [
        "The 3Ps give you a group. An avatar turns that group into one person you can picture — when you write a post or message, you're talking to them, not a faceless crowd.",
        "Sketch: name, age, location, work and income; family and a typical week; goals and problems you can solve; where they spend time; what they read/watch/listen to; what motivates them and the language they actually use.",
      ],
      activities: [
        {
          key: "client-avatar",
          prompt: "Write your client avatar. One person, real enough that you could pick them out of a crowd.",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor's avatar: Mel, 34, ICU nurse on a rotating roster, lives in Woolloongabba, partner and a four-year-old. Earns a solid wage but time and energy are the scarce currency. Goal: more strength and steadier energy so the night shifts stop flattening her. Problem: every routine she has tried falls apart the week the roster changes. Hangs out on Instagram late at night, follows a couple of nurse-mum accounts, trusts word of mouth from colleagues over any ad. Motivated by feeling capable at work and present at home.\n\nHow Taylor serves Mel: flexible session times around the roster, short efficient programs she can run solo on chaotic weeks, and check-ins that account for shift fatigue instead of guilt-tripping her for missing a session.",
      managerNote:
        "Keep them to one avatar. The eager ones will try to write five and end up with mush. One sharp avatar beats five vague ones every time.",
    },
    {
      heading: "Marketing through being yourself",
      body: [
        "You are the advertisement, and it's the cheapest marketing you'll ever do. Every member on the floor is sizing up whether you look like someone worth training with (Part 4 covers how to carry yourself).",
        "Treat the floor as prospecting, offer a complimentary session so people feel your coaching, and network beyond the gym.",
      ],
      activities: [
        { key: "best-advertisement-action", prompt: "How will you show up as your own best advertisement at Fitaz Gym this week? Be specific.", multiline: true },
      ],
      workedExample:
        "Taylor blocks the first fifteen minutes of each shift to walk the floor, not to train. Says hello to two new faces, fixes one dodgy setup without being asked, and learns three names a day. No pitch. By week three, two of those floor chats had turned into booked consults.",
    },
    {
      heading: "Your brand and voice",
      body: [
        "Your brand is what you stand for and how you sound — you already did the hard part in Part 2 (your why, mission, and defining characteristics). Two pieces: **your story** (real, not polished) and **your difference** (named plainly).",
      ],
      activities: [
        {
          key: "brand-and-difference",
          prompt: "Bring your mission from Part 2 into one line, list 3-5 characteristics that define your brand, and finish: what makes you different is…",
          multiline: true,
        },
      ],
      workedExample:
        "Taylor's line: I help shift workers build strength and steady energy with training that survives a rotating roster. Characteristics: practical, calm, no judgement, genuinely gets shift life, allergic to fitness hype. What makes Taylor different: lived years of broken sleep and emergency work, so the programs are built for real shifts, not a textbook week.",
    },
    {
      heading: "The marketing channels",
      body: [
        "Pick two or three that suit your strengths and your avatar, and do those well:",
        "- In-person and the gym floor — the warmest, cheapest leads you'll ever get.",
        "- Referrals — highest conversion of the lot.",
        "- Social media — reach and proof at scale.",
        "- Partnerships — physios, cafes, allied health, local businesses.",
        "- Email — the one audience you actually own.",
        "- Local SEO — getting found when someone searches nearby.",
        "- Paid ads — amplification once the rest is working.",
        "- Community events and workshops — visibility plus a chance to demonstrate value live.",
      ],
      activities: [
        { key: "channels-to-focus", prompt: "Which two or three channels will you focus on first, and why those given your avatar?", multiline: true },
      ],
      managerNote:
        "New PTs scatter themselves across six channels and do none properly. Steer them to the floor plus referrals first — those two cost nothing, convert best, and build the habits everything else relies on. Social and the rest can layer on once the basics are running.",
    },
    {
      heading: "Building your online presence",
      body: [
        "The goal isn't to go viral — it's to look like someone who knows their stuff and is worth a conversation.",
        "**Content pillars:** Educate (tips, myth-busting), Inspire (client wins, with permission), Personality (your story, behind the scenes), Proof (testimonials, results).",
        "**Cadence:** consistency beats volume. Three posts a week you can keep up for a year beats daily posting that burns you out by March.",
      ],
      activities: [
        { key: "content-pillars-cadence", prompt: "Define your 3-4 content pillars and the posting cadence you can realistically hold.", multiline: true },
        { key: "profile-audit", prompt: "Audit your current profiles. List 3 things to fix (photos, bio, service clarity, pinned proof).", multiline: true },
      ],
      workedExample:
        "Taylor's pillars: Educate (training that fits shift work), Inspire (a nurse client's six-month win, shared with permission), Personality (paramedic stories and what they taught), Proof (screenshots of client check-ins). Cadence: three posts a week, batched on a Sunday off. Sustainable, and it sounds like Taylor.",
    },
    {
      heading: "Local SEO basics",
      body: [
        "The single highest-leverage move is a Google Business Profile — free, and most trainers never bother. Claim and verify it, choose the Personal Trainer category, add real photos of you coaching, keep details accurate, and collect reviews.",
      ],
      activities: [
        { key: "google-business-profile-audit", prompt: "Set up or audit your Google Business Profile. List what's missing and your next step.", multiline: true },
      ],
      managerNote:
        "Reviews are the lever here. Encourage PTs to ask happy clients to leave a Google review at a natural high point, like a milestone hit. Five genuine reviews will out-rank a fancy website for local searches every time.",
    },
    {
      heading: "Email marketing",
      body: [
        "Your email list is the one audience you actually own. Build it with a lead magnet, use a free tool (MailerLite, Mailchimp), keep a simple cadence of one or two emails a month with real value, and occasionally make a clear offer once you've earned it.",
      ],
      activities: [
        { key: "lead-magnet-cadence", prompt: "Sketch one lead magnet idea and the email cadence you could actually keep up.", multiline: true },
      ],
      workedExample:
        "Taylor's lead magnet: a one-page guide, Training That Survives Night Shift. People download it, land on Taylor's list, and get one short email a fortnight: a shift-work tip, a client win, and now and then an invite to a free consult. Low effort, steady stream of warm leads.",
    },
    {
      heading: "Paid ads: when it makes sense",
      body: [
        "Paid ads amplify an offer that already works — they don't fix one that doesn't. Start only once your organic and referral leads are converting, begin small, and track cost per lead and cost per client. Most new PTs don't need paid ads in their first year.",
      ],
      activities: [
        { key: "paid-ads-decision", prompt: "Do paid ads make sense for you right now? Make the case either way.", multiline: true },
      ],
      managerNote:
        "Talk most new PTs out of ads early. They reach for ads to avoid the harder, free work of walking the floor and asking for referrals. Ads on top of a working system are great. Ads instead of one are an expensive way to learn that lesson.",
    },
    {
      heading: "Promotions and lead magnets: add value, never discount",
      body: [
        "Discounting trains people to wait for the next sale and quietly tells the market your coaching is worth less. Lead with value instead: a free workshop, a genuinely useful guide, a complimentary consult, or a sign-up bonus (extra check-in, movement screen, program add-on).",
      ],
      activities: [
        { key: "value-add-promo", prompt: "Write one value-add promotion and one lead magnet, each with a simple action plan and timeline.", multiline: true },
      ],
      workedExample:
        "Taylor's promotion: a free 45-minute Shift-Proof Your Training workshop at the gym, capped at ten spots, run on a quiet Saturday. Promote it for two weeks on the floor, on socials and to the email list. No discount anywhere. The value is the room, the room is the pitch. Lead magnet: the night-shift guide feeds the same list year round.",
      managerNote:
        "Hold the line on no discounts. A PT will float a 25% off new-year deal because it feels easy. Redirect them to a value-add that protects their rate and their positioning. This is a brand rule across Fitaz Gym, not a preference.",
    },
    {
      heading: "Referrals and testimonials strategy",
      body: [
        "Referrals are the warmest leads you'll ever get — trust comes pre-loaded. Ask at the right moment (just after a win), make it easy, and say thank you with value, never a discount. Testimonials are the public version of the same trust: ask happy clients, then put them on your Google profile, socials and the gym noticeboard.",
      ],
      activities: [
        { key: "referral-message-draft", prompt: "Draft a short referral message you would actually send to a happy client.", multiline: true },
        { key: "testimonial-candidates", prompt: "Name 3 clients who could give you a strong testimonial, and how you'll ask each one.", multiline: true },
      ],
      workedExample:
        "Taylor's referral message: “Hi Mel, it has been great watching your strength climb even through that run of nights. If you know another shift worker who is struggling to make training stick, I would love to help. Send them my way and I will shout you an extra session and give them a free consult to get started. No pressure at all.”",
    },
    {
      heading: "Tracking marketing performance",
      body: [
        "If you don't measure it, you're guessing. Track new leads per week, consults booked and consult-to-client conversion, and where your leads came from. Avoid vanity numbers like follower counts. Set a baseline this month, a realistic target for next month, and review monthly.",
      ],
      activities: [
        { key: "marketing-metrics-targets", prompt: "Pick 2-3 metrics to track and set a target for each from your current baseline.", multiline: true },
      ],
      links: [
        {
          label: "Client Journey Tracker (the 12-stage funnel this workbook is built around)",
          url: "https://docs.google.com/spreadsheets/d/1dVY962ijw-_bfkjO5AU6ig0XUrv-7YbGzQxHLa9E7A8/edit",
        },
      ],
      managerNote:
        "Push them past vanity metrics. A thousand followers and zero consults is a hobby, not a business. The questions that matter: how many conversations, how many consults, how many sign-ups, and where did they come from. Help newer PTs set targets off their own baseline so the goal feels real.",
    },
    {
      heading: "The client journey map",
      body: [
        "Everything in this part feeds the first step of a bigger journey — the spine of the whole workbook. It runs in four phases: **Attract** (the marketing above), **Convert** (the consult, trial and sales chat), **Deliver** (onboarding and training that earns trust), **Retain** (check-ins, loyalty, referrals).",
        "In full, it's 12 steps: Client Interest → Initial Contact → PT Waiver Form → Consultation & Trial Session → The Sales Chat → Follow-Up → Agreement & Payment → Onboarding & First Program → Regular Training & Tracking → Check-Ins & Adjustments → Retention & Referrals → Loyal Client. The Client Journey Tracker above tracks every lead through these exact stages.",
      ],
      activities: [
        { key: "weakest-journey-step", prompt: "Which step in the journey is your weakest right now, and what's one thing you'll do about it?", multiline: true },
      ],
      managerNote:
        "Use this map as the reference point all year. When a PT is stuck, find the step: no clients means the Attract or Convert end needs work; clients leaving early means Deliver or Retain. It keeps coaching conversations specific instead of a vague chat about being busier. (The Client Journey Tracker's Dashboard also highlights the weakest conversion link automatically — worth pulling up together.)",
    },
  ],
};
