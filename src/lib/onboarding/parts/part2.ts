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
      workedExample:
        "Sample answers from a PT named Taylor, ex-paramedic, now training shift workers:\n\n1. Got into training after years of helping other people in crisis with nothing left for myself. Realised fitness was the one thing that consistently brought me back.\n\n2. Burnout from emergency medicine. Watching colleagues fall apart. Wanting a job where the goal was building people up before they break, not patching them after.\n\n3. Shift workers, frontline staff, mid-career professionals who've put their own health last for a decade.\n\n4. People ask me how I stay calm under pressure, how I built my training back after burnout, and how to talk to a partner who refuses to look after themselves.\n\n5. The session where a client cried after their first proper deadlift PB. They'd been told their back was “broken” for ten years.\n\n6. People who've written themselves off thinking it's too late or too risky. I want to give them their bodies back.\n\nTaylor's drafted why statement: “To help shift workers and burnt-out professionals rebuild the energy and strength they need to live the rest of their lives well.”",
      managerNote:
        "The story reflection questions are the engine of this section. Most PTs find one or two easy and one or two confronting — the confronting ones are the gold. Question 4 (what people come to you for) is the one PTs most often shrug at; push them on it, the answer usually reveals a natural strength they undervalue. If the why statement reads like a marketing slogan or a generic “empower people to be their best version,” send them back to their story answers. The strongest whys are specific, personal, and slightly uncomfortable to say out loud.",
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
      workedExample:
        "Taylor's Ikigai:\n\nLove: coaching people through long rebuild phases. Programming. The quiet 1:1 work, not big group classes.\n\nGood at: building rapport with high-stress, time-poor clients. Pacing programs. Reading when someone's burning out before they say so.\n\nWorld needs: better support for shift workers and frontline staff. Most gym programming assumes office hours.\n\nPaid for: 1:1 PT, small group sessions for shift workers (5am, 8pm), online programming for night-shift clients.\n\nOverlap: “Coaching shift workers and high-stress professionals to rebuild strength and energy through programs that actually fit their life.”",
      managerNote:
        "Most PTs find “what you love” and “what you're good at” easy. “What the world needs” and “what you can be paid for” are where they get stuck. If a PT is vague on “what the world needs,” point them at the gym floor: who's struggling, who's not being served well by the current PT offering in Brisbane? That's the real-world version of the question.",
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
      workedExample:
        "Taylor's top 5 values: Integrity, Service, Resilience, Mastery, Connection.\n\nCurrently shows up: Connection (1:1 rapport with shift workers, follow-up texts). Mastery (continual programming education). Integrity (referring out when a client needs a physio).\n\nGap: Resilience is a stated value but not yet visible in marketing or service design — no content, no programs aimed at burnt-out clients rebuilding.\n\nAction this week: focus on Resilience. Write one post telling the story of a client who rebuilt their training after a setback. Pin it to my social profile.",
      managerNote:
        "This is the section where a PT often spots the gap between their stated values and what they're actually doing on the floor. That gap is the most useful thing to discuss in a 1:1 — the PT who says they value “connection” but never remembers a member's name has work to do. Surface it gently and concretely.",
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
      workedExample:
        "Taylor's three statements:\n\nPurpose: “I want to help shift workers and frontline staff get their health back, so the rest of their lives don't suffer for the work they do.”\n\nPersonal mission: “I show up calm, prepared, and willing to meet clients exactly where they are, especially when they're running on empty.”\n\nBusiness mission: “I deliver evidence-based, time-realistic 1:1 and small-group training for shift workers in Brisbane, with programming and check-ins that fit non-standard hours.”\n\nWhat makes Taylor different: ex-paramedic credibility, fluency with shift-work physiology, calm under pressure, evening and early-morning availability, willingness to coach the head as much as the body.",
      managerNote:
        "PTs reliably confuse these three. Keep them separate: Purpose = why you do the work. Personal mission = how you show up while doing it. Business mission = what you deliver to the client. If a PT writes three statements that all sound interchangeable, send them back with that framing.",
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
        "Divergence is not a red flag. A PT who values quiet 1:1 work and brings a calmer energy adds something the gym needs. The only time divergence becomes a problem is when it sits in opposition to Community, Integrity, or Growth themselves — a PT who genuinely doesn't care about community contribution will struggle here, and it's worth raising directly.",
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
      managerNote:
        "Part 2 is the most introspective section in the workbook — don't rush a PT through it, and use one of the four 1:1 hours to walk their answers together. This closing section is the turning point, where reflection becomes operating principle. In quarterly 1:1s, refer back to a PT's answers here whenever they're facing a hard call (a client they should let go, a pricing change they're avoiding, a 6am they keep saying yes to). The answers they wrote in week one are usually the right call.",
    },
  ],
};
