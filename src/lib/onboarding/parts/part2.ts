import type { OnboardingPart } from "../types";

export const part2: OnboardingPart = {
  number: 2,
  slug: "know-yourself",
  title: "Know Yourself",
  intro:
    "Before you build the business, build the foundation. Your why, your values, and your mission shape every decision that follows: who you work with, how you market yourself, the pricing you stand behind, and the calls you make when things get hard.",
  sections: [
    {
      heading: "Finding your why",
      body: [
        "Your why is the emotional anchor underneath the work. It's not your marketing tagline and it's not your sales pitch — it's the deeper reason you chose this over any other job you could be doing.",
        "When you're clear on it, three things shift: you attract the clients you actually want to work with, you stay grounded on the days that don't go your way, and you make decisions faster because you've got a tiebreaker.",
        "People don't buy what you do. They buy why you do it.",
      ],
      activities: [
        {
          key: "why-drew-you",
          prompt: "What first drew you to fitness or personal training?",
          multiline: true,
        },
        {
          key: "why-life-experiences",
          prompt:
            "What life experiences shaped your decision to become a PT? Think beyond fitness: personal struggles, role models, past work.",
          multiline: true,
        },
        {
          key: "why-who-you-help",
          prompt:
            "What kind of people do you feel most driven to help, and why? Often this is people like you, or the person you used to be.",
          multiline: true,
        },
        {
          key: "why-people-come-to-you",
          prompt:
            "What do people regularly come to you for support, help or advice on? This often points to a natural strength you haven't named yet.",
          multiline: true,
        },
        {
          key: "why-most-fulfilled",
          prompt:
            "When have you felt most fulfilled while coaching? Think of a specific moment, session or conversation that stood out.",
          multiline: true,
        },
        {
          key: "why-change-you-want",
          prompt: "What change do you want to see in your clients, or in the world?",
          multiline: true,
        },
        {
          key: "why-statement",
          prompt:
            "Now summarise what you've uncovered into one or two sentences — your internal compass, not a marketing tagline. e.g. “To help people feel proud of their bodies, no matter where they're starting from.”",
          multiline: true,
        },
      ],
      managerNote:
        "Some PTs land on their why straight away; others uncover it slowly through experience and a few setbacks. Don't push for polish here — a rough, honest answer beats a slick one. Revisit this with them in 6-12 months, it usually sharpens.",
    },
    {
      heading: "Discovering your Ikigai",
      body: [
        "Ikigai is a Japanese concept translating roughly as “a reason for being.” It's the overlap between four questions: what you love, what you're good at, what the world needs, and what you can be paid for. Where the four overlap is the work that's energising, valuable, and pays the bills.",
        "Use it to guide your mission and purpose statements, clarify who your ideal clients are, refine your services and marketing, and stay aligned when business decisions get tricky.",
      ],
      activities: [
        { key: "ikigai-love", prompt: "What you love — what energises you about coaching and training?", multiline: true },
        { key: "ikigai-good-at", prompt: "What you're good at — technical or interpersonal strengths.", multiline: true },
        { key: "ikigai-world-needs", prompt: "What the world needs — the problems your clients are trying to solve.", multiline: true },
        { key: "ikigai-paid-for", prompt: "What you can be paid for — your services, packaged and priced.", multiline: true },
        {
          key: "ikigai-overlap",
          prompt: "Name the overlap: describe the kind of work that sits in the middle of all four.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Identifying your values",
      body: [
        "Your values are the drivers behind how you show up. They influence the decisions you make, the way you treat people, and the business you end up building.",
        "When your work aligns with your values, things flow — you feel more energised, more fulfilled. When it doesn't, the work feels heavy. There's no right or wrong here; knowing your values helps you choose your clients, your environment, and how you build your business.",
        "**Step 1.** Highlight the values that resonate from a broad list (achievement, adventure, balance, community, connection, courage, creativity, discipline, empathy, growth, integrity, mastery, purpose, resilience, service, and dozens more) — add your own if something's missing.",
        "**Step 2.** Narrow to your top 5.",
        "**Step 3.** Reflect on how they show up in your coaching now, and where they don't yet.",
        "**Step 4.** Pick one value and name a small action this week to express it more clearly.",
      ],
      activities: [
        { key: "values-top-5", prompt: "Your top 5 values.", multiline: true },
        {
          key: "values-show-up-now",
          prompt: "How do these values currently show up in your work as a personal trainer?",
          multiline: true,
        },
        {
          key: "values-not-reflected",
          prompt: "Are any important to you but not yet reflected in your business?",
          multiline: true,
        },
        {
          key: "values-this-week-action",
          prompt: "This week I'll focus on the value of… by taking this action…",
          multiline: true,
        },
      ],
    },
    {
      heading: "Drafting your purpose and mission",
      body: [
        "Turn what you've uncovered into three short statements — a purpose, a personal mission, and a business mission. They sound similar but answer different questions.",
        "**Your purpose** is why you do what you do — it guides decisions, program design and how you interact with clients. e.g. “I want to help people feel stronger and more confident in their bodies.”",
        "**Your personal mission** defines who you are as a PT and how you go about your work. e.g. “I'm committed to helping clients reach their health goals through evidence-based training that's fun and challenging.”",
        "**Your business mission** focuses on what your business offers and the values behind it. e.g. “My mission is to deliver personalised fitness solutions that inspire long-term health and wellbeing.” The difference: personal mission is about you, business mission is about what clients get from you.",
      ],
      activities: [
        { key: "purpose-statement", prompt: "Write your purpose.", multiline: true },
        { key: "personal-mission", prompt: "Write your personal mission statement.", multiline: true },
        { key: "business-mission", prompt: "Write your business mission statement.", multiline: true },
        {
          key: "what-makes-you-different",
          prompt:
            "Write down 3-5 characteristics that define you as a trainer. This becomes the spine of your marketing voice in Part 6.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Mapping yourself against Fitaz Gym",
      body: [
        "You've done the personal work. Now look at how it sits alongside the gym you're working in — Fitaz Gym's purpose, vision, and core values (Community, Integrity, Growth) from Part 1.",
        "This is great material to bring to your next one-hour session with the PT Manager. Coming in with clarity on what you stand for, where you align, and where you bring something different makes for a far better conversation.",
      ],
      activities: [
        { key: "align-purpose", prompt: "Where does your why align with Fitaz Gym's purpose?", multiline: true },
        {
          key: "align-values",
          prompt: "Where do your values overlap with Fitaz Gym's (Community, Integrity, Growth)?",
          multiline: true,
        },
        {
          key: "diverge-values",
          prompt: "Where might your values diverge from Fitaz Gym's? (Not a problem — useful to know.)",
          multiline: true,
        },
        {
          key: "mission-complement",
          prompt: "Where does your mission complement what Fitaz Gym offers as a gym?",
          multiline: true,
        },
      ],
      managerNote:
        "Ask them to bring this page to session one rather than re-deriving it live with you. Where they've named a genuine divergence from the gym's values, treat it as useful signal, not a red flag to correct.",
    },
    {
      heading: "Applying your why",
      body: [
        "Your why, values and mission are working tools, not a page you fill in once and never look at again.",
        "**Client selection** — when your values are clear, you can tell the difference between clients you want to work with and clients who'll drain you.",
        "**Marketing voice** — your marketing should sound like you, not like every other PT on Instagram. You'll come back to this in Part 6.",
        "**Business decisions** — when something feels off (a discount, a 6am you don't want, saying yes to something that doesn't fit), your values are the tiebreaker.",
        "**Hard calls** — boundaries, ending client relationships, raising prices, saying no. Going back to your why and values gives you a clearer answer than short-term financial pressure.",
        "Revisit this part of the workbook every 6-12 months. Your why and values will evolve as you do.",
      ],
      activities: [
        {
          key: "clients-you-want",
          prompt: "Looking at your values and mission, who are the clients you most want to work with?",
          multiline: true,
        },
        {
          key: "hard-business-decision",
          prompt: "Think of a recent business decision you've struggled with. How would your values inform it?",
          multiline: true,
        },
      ],
    },
  ],
};
