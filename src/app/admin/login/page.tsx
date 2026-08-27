import { Suspense } from "react";
import Image from "next/image";
import LoginForm from "./LoginForm";

// Rendered per request rather than prerendered as a static page. The sign-in
// form reads the ?redirectTo query param, and forcing dynamic rendering
// avoids a static-generation edge case on the hosting platform.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/fitaz-gym-logo.svg" alt="Fitaz Gym" width={245} height={32} priority />
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
