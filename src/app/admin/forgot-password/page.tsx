import Image from "next/image";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/fitaz-gym-logo.svg" alt="Fitaz Gym" width={245} height={32} priority />
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
