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
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-10 sm:py-14">
      <header className="mb-8 flex flex-col items-start gap-6">
        <Image
          src="/logo-placeholder.svg"
          alt="Fitaz Gym"
          width={180}
          height={48}
          priority
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Your Complimentary PT Session
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-700">
            Welcome to Fitaz Gym. As a new member, your first PT consultation and
            starter session are on us. It&rsquo;s a chance to set your goals, learn
            your way around, and train with someone who knows what they&rsquo;re
            doing. Fill out this quick form so we can match you with the right
            trainer and get you booked in.
          </p>
        </div>
      </header>

      <PTSessionForm trainers={trainers ?? []} />

      <footer className="mt-10 border-t border-neutral-200 pt-6 text-xs leading-relaxed text-neutral-500">
        Fitaz Gym collects these details to match you with a trainer and arrange
        your complimentary session. Only gym staff and the trainer you&rsquo;re
        matched with can see them. We don&rsquo;t share your details with anyone
        outside the gym, and you can ask us to remove them at any time.
      </footer>
    </main>
  );
}
