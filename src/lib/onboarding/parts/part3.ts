import type { OnboardingPart } from "../types";

export const part3: OnboardingPart = {
  number: 3,
  slug: "setting-up-shop",
  title: "Setting Up Shop",
  intro:
    "The boring-but-critical part. ABN, insurance, accounting, money systems, the legal stuff, and your own house rules. Get this right once and the rest of your business runs on a clean foundation.",
  sections: [
    {
      heading: "Business setup checklist",
      body: [
        "Before you take a single client, get the boring stuff sorted:",
        "- Choose a business name (your name is fine to start)",
        "- Apply for an ABN at abr.gov.au",
        "- Open a separate business bank account",
        "- Set up an accounting system (Xero, MYOB, Hnry, or a clean spreadsheet)",
        "- Sort your tax and super",
        "- Purchase your insurance (Public Liability $10M minimum, Professional Indemnity $5M minimum)",
        "- Keep First Aid and CPR certifications current (also a Fitaz Gym contract requirement)",
        "- Set up your client payment system",
        "- Decide whether to register with AUSactive or similar (not mandatory, useful for events/discounts/industry recognition)",
      ],
    },
    {
      heading: "Australian tax and super for sole traders",
      body: [
        "You're running a business, not collecting a wage — tax and super are now your job. Rates and thresholds change, so always cross-check with the ATO or your accountant.",
        "**Income tax.** Taxed at your individual rate via your annual return. No PAYG withholding, no payslip. Rule of thumb: park around 25-30% of every payment into a separate tax account. Track every business expense (rent, insurance, education, equipment, phone, internet, travel). The ATO can ask you to start PAYG instalments once you've lodged a return showing decent income.",
        "**GST and BAS.** Register for GST once turnover hits $75,000 in a 12-month period (or you expect to). Below that, stay unregistered and keep pricing GST-free. Once registered, charge 10% GST and lodge a Business Activity Statement, usually quarterly. Keep an eye on your rolling 12-month turnover — the clock doesn't reset at the financial year.",
        "**Superannuation.** Not legally required to pay yourself super as a sole trader, but you should. Personal contributions are tax-deductible up to the concessional cap (currently $32,500 from 1 July 2026, indexed to AWOTE). Treat it like rent for your future self.",
      ],
    },
    {
      heading: "Insurance",
      body: [
        "Liability insurance is non-negotiable. You can't train clients at Fitaz Gym without it.",
        "**Public Liability** — covers you if a client or anyone else is injured or has property damaged because of something you did. Minimum cover $10M.",
        "**Professional Indemnity** — covers you if a client claims your advice or service caused them loss or harm. Minimum cover $5M.",
        "Get quotes from a few providers (Guild Insurance, AON Sport, Marsh, Sport & Fitness Insurance Brokers). AUSactive membership often includes or discounts insurance.",
      ],
    },
    {
      heading: "Accounting tools",
      body: [
        "You don't need fancy software on day one, but you do need a system: track every dollar in and out.",
        "- **Spreadsheet** — free, simple, good enough for your first 6-12 months.",
        "- **Hnry** — built for sole traders, pays your tax and super as you earn.",
        "- **Xero** — the most common small business tool in Australia, strong reporting.",
        "- **MYOB** — similar to Xero. Pick one, don't run both.",
        "Good tracking looks like: income logged within 7 days, expenses categorised, receipts kept (a photo is fine), and a 30-minute monthly review.",
      ],
    },
    {
      heading: "Client payment systems",
      body: [
        "- **Stripe or Square** — card payments, fees around 1.7-2.9% per transaction.",
        "- **Ezidebit (direct debit)** — great for ongoing weekly/fortnightly clients, reduces no-pays.",
        "- **PayPal** — flexible backup, fees can stack.",
        "- **Direct bank transfer** — zero fees, but you chase manually.",
        "Recurring clients should be on direct debit. Build processing fees into your pricing.",
      ],
    },
    {
      heading: "Knowing your numbers: revenue targets",
      body: [
        "If you don't know what you need to earn each week, you don't have a business plan, you have a hope. Six steps:",
        "1. Define the lifestyle you actually want.",
        "2. Set your personal income target from that.",
        "3. Add your business expenses (weekly rent, insurance, software, education, phone, marketing).",
        "4. Set aside tax (25-30%) and super (5-10%).",
        "5. Divide by your rate: $80 per 45-minute session for training, plus a flat $20 a week per client for their program and coaching app. Divide your weekly target by 80 for the session count, then treat app fees as recurring income on top.",
        "6. Add a 10-15% cancellation buffer.",
      ],
      activities: [
        {
          key: "revenue-walkthrough",
          prompt:
            "Run the 6-step walkthrough for yourself: weekly personal income target, weekly business expenses, total weekly revenue target, session count required at $80/session, and your buffered booking target.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Your pricing foundation",
      body: [
        "Pricing is a value decision, not a confidence test. Your minimum viable rate is whatever covers your lifestyle, expenses, tax, super and buffer — anything below that is volunteering, not business.",
        "At Fitaz Gym the working model is a split rate: $80 per 45-minute session for training, plus a flat $20 a week per client for their program and coaching app (personalised program, weekly check-ins, progress tracking). The split means you're still paid for the programming and check-ins in any week a session doesn't happen. Coaching here runs as an ongoing subscription, not fixed blocks clients renew.",
        "**Signs you're underpriced:** almost every prospect says yes without hesitating, retention and referrals are constant, you're delivering above and beyond and resentment is creeping in, or you can't afford the lifestyle you mapped out.",
        "**When to raise your rates:** books full with a waitlist, retention and results justify it, you've added a meaningful skill since your last increase, or it's been 12 months since your last raise. You don't renegotiate client by client — set the new rate, notify existing clients by email with plenty of notice, new clients start at the new price.",
      ],
      activities: [
        {
          key: "session-rate-review",
          prompt:
            "Write your starting session rate, the date you'll review it, and the three signals you'll watch for that tell you it's time to raise it.",
          multiline: true,
        },
      ],
      managerNote:
        "The price-increase email template lives in the full workbook (Part 3) — point new PTs to it directly rather than having them draft one from scratch the first time they need it.",
    },
    {
      heading: "Your terms and conditions",
      body: [
        "Your T&Cs protect both sides: they set expectations, prevent awkward conversations later, and give you something to point to when a boundary gets tested.",
        "**Cancellation and no-show policy** — industry standard is 24 hours notice; inside that window, the session is charged. No-shows are always charged in full.",
        "**Payment terms** — ongoing clients pay weekly in advance (training plus the program-and-app fee); casual clients pay per session. Clarify what happens if a payment fails (coaching pauses until resolved).",
        "**Refund policy** — what happens to prepaid time when a client gives notice; your humane exception clause for injury/illness.",
        "**Trial session terms** — free, discounted or full price; how many per prospect; what happens at the end.",
        "**Client code of conduct** — punctuality, communication, attire, respect, honesty about injuries/medications, behaviour that ends the relationship.",
        "**Privacy and data handling** — the Australian Privacy Principles cover most of it: collect only what you need, store it securely, get consent before sharing anything, let clients access or delete their data.",
        "A recommended one-page Coaching Agreement template (sessions, payment, cancellations, cancelling coaching with 28 days notice, trial sessions, client conduct, health and safety, privacy, communication, price changes) is in the full workbook — use it as your starting structure.",
      ],
      activities: [
        {
          key: "cancellation-policy-oneliner",
          prompt: "Draft your one-line cancellation policy.",
          multiline: true,
        },
        {
          key: "cancellation-refund-policy",
          prompt:
            "Draft your cancellation and refund policy — notice period, fees that apply within it, and medical exceptions.",
          multiline: true,
        },
      ],
    },
    {
      heading: "Scope of practice",
      body: [
        "Knowing where your job ends is as important as knowing how to do it. Working outside your scope puts your client, your insurance, and your reputation at risk.",
        "**In scope:** program design and delivery, general lifestyle and habit guidance (sleep, stress, recovery), general nutrition information, motivation and accountability, movement screening and pain-free corrective exercise.",
        "**Out of scope:** diagnosing or treating injuries, prescribing meal plans or calorie targets for a medical condition, mental health counselling, programming through pain without clearance, supplement or medication advice.",
        "The simple test: if you wouldn't be comfortable defending your advice to the relevant qualified professional, you're out of scope. Refer out.",
      ],
    },
    {
      heading: "Referral pathways",
      body: [
        "Knowing when to refer out is part of the job. Having someone to refer to is the rest of it — build the relationships before you need them.",
        "**When to refer:** persistent or unexplained pain, a suspected injury not yet assessed, disordered eating signals, mental health concerns, pregnancy/post-partum/chronic conditions needing GP clearance first.",
        "Fitaz Gym doesn't keep a fixed referral list — build your own as the work shows you who you need. Start with physio and GP, introduce yourself in person or by email, refer first and ask for nothing.",
      ],
      activities: [
        {
          key: "referral-categories-needed",
          prompt:
            "Based on your clients, which two referral categories do you need to build first? List a name or 'still to find' next to each.",
          multiline: true,
        },
      ],
    },
    {
      heading: "The Fitaz Gym setup hook",
      body: [
        "A few things you specifically need sorted before you start training clients at Fitaz Gym. The actual numbers live in your PT contract.",
        "**Certifications** — CPR renews every 12 months, First Aid every 3 years, both required by your contract. Insurance certificate uploaded to your folder in the shared drive.",
        "**Pre-start checklist:** signed PT contract on file, ABN confirmed, insurance certificate uploaded, CPR and First Aid current and uploaded, bank details provided for internal lead payments, walk-through of the gym/PT spaces/equipment booking system.",
      ],
      activities: [
        { key: "weekly-gym-fee", prompt: "Write your weekly Fitaz Gym fee here (see your contract)." },
      ],
    },
    {
      heading: "Business setup snapshot",
      body: [
        "By the end of this part you should have something to fill in below. If anything's still blank, that's your action list for this week.",
      ],
      activities: [
        { key: "snapshot-business-name", prompt: "Business name" },
        { key: "snapshot-abn", prompt: "ABN" },
        { key: "snapshot-bank-account", prompt: "Business bank account set up (yes/no)" },
        { key: "snapshot-accounting-tool", prompt: "Accounting tool" },
        {
          key: "snapshot-insurance",
          prompt: "Insurance provider, policy number, expiry date",
          multiline: true,
        },
        { key: "snapshot-payment-system", prompt: "Client payment system" },
        {
          key: "snapshot-rate",
          prompt: "Session rate (per 45-minute session) and weekly program-and-app fee",
        },
        { key: "snapshot-revenue-target", prompt: "Weekly revenue target" },
        { key: "snapshot-sessions-needed", prompt: "Sessions per week needed to hit target (with buffer)" },
        { key: "snapshot-gym-fee", prompt: "Weekly Fitaz Gym fee (see contract)" },
        { key: "snapshot-cpr-expiry", prompt: "CPR expiry date" },
        { key: "snapshot-first-aid-expiry", prompt: "First Aid expiry date" },
        {
          key: "snapshot-referral-professionals",
          prompt: "Three referral professionals identified (physio, dietitian, GP or psych)",
          multiline: true,
        },
      ],
      managerNote:
        "This snapshot is the fastest way to spot a trainer who's behind on the operational basics before it becomes a problem — worth reviewing together in session one alongside the pre-start checklist.",
    },
  ],
};
