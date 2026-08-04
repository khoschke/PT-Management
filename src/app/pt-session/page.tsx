import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import PTSessionForm from "./components/PTSessionForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Complimentary PT Session | Fitaz Gym",
  description: "Book your complimentary PT consultation and starter session at Fitaz Gym.",
};

export default async function PtSessionPage() {
  const supabase = await createClient();

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <main className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-10 border-b border-black/5">
        <div className="mx-auto flex max-w-2xl items-center px-5 py-3.5 sm:px-6">
          <Image src="/logo-fitaz.svg" alt="Fitaz Gym" width={118} height={34} priority />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="mb-9 sm:mb-12">
          <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl">
            Your Complimentary
            <br />
            PT Session
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-secondary-label sm:text-lg">
            Welcome to Fitaz Gym. As a new member, your first PT consultation and
            starter session are on us. It&rsquo;s a chance to set your goals, learn
            your way around, and train with someone who knows what they&rsquo;re
            doing. Fill out this quick form so we can match you with the right
            trainer and get you booked in.
          </p>
        </div>

        <PTSessionForm trainers={trainers ?? []} />

        <footer className="mx-auto mt-12 flex max-w-lg items-start gap-2.5 px-1 text-xs leading-relaxed text-secondary-label">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span>
            Fitaz Gym collects these details to match you with a trainer and arrange
            your complimentary session. Only gym staff and the trainer you&rsquo;re
            matched with can see them. We don&rsquo;t share your details with anyone
            outside the gym, and you can ask us to remove them at any time.
          </span>
        </footer>
      </div>
    </main>
  );
}
