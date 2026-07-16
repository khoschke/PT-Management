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
    },
    {
      heading: "Local SEO basics",
      body: [
        "The single highest-leverage move is a Google Business Profile — free, and most trainers never bother. Claim and verify it, choose the Personal Trainer category, add real photos of you coaching, keep details accurate, and collect reviews.",
      ],
      activities: [
        { key: "google-business-profile-audit", prompt: "Set up or audit your Google Business Profile. List what's missing and your next step.", multiline: true },
      ],
    },
    {
      heading: "Email marketing",
      body: [
        "Your email list is the one audience you actually own. Build it with a lead magnet, use a free tool (MailerLite, Mailchimp), keep a simple cadence of one or two emails a month with real value, and occasionally make a clear offer once you've earned it.",
      ],
      activities: [
        { key: "lead-magnet-cadence", prompt: "Sketch one lead magnet idea and the email cadence you could actually keep up.", multiline: true },
      ],
    },
    {
      heading: "Paid ads: when it makes sense",
      body: [
        "Paid ads amplify an offer that already works — they don't fix one that doesn't. Start only once your organic and referral leads are converting, begin small, and track cost per lead and cost per client. Most new PTs don't need paid ads in their first year.",
      ],
      activities: [
        { key: "paid-ads-decision", prompt: "Do paid ads make sense for you right now? Make the case either way.", multiline: true },
      ],
    },
    {
      heading: "Promotions and lead magnets: add value, never discount",
      body: [
        "Discounting trains people to wait for the next sale and quietly tells the market your coaching is worth less. Lead with value instead: a free workshop, a genuinely useful guide, a complimentary consult, or a sign-up bonus (extra check-in, movement screen, program add-on).",
      ],
      activities: [
        { key: "value-add-promo", prompt: "Write one value-add promotion and one lead magnet, each with a simple action plan and timeline.", multiline: true },
      ],
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
        "The Client Journey Tracker's Dashboard tab highlights the weakest conversion link in the funnel automatically — worth pulling up together in a one-hour session rather than relying only on the trainer's self-rating here.",
    },
  ],
};
