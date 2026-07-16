"use client";

import { createContext, useContext, useState } from "react";

export type OnboardingView = "pt" | "manager";

interface ViewContextValue {
  view: OnboardingView;
  setView: (view: OnboardingView) => void;
}

const ViewContext = createContext<ViewContextValue | null>(null);

const STORAGE_KEY = "fitaz-onboarding-view";

// Not read from localStorage on mount: doing so would make the client's
// first render diverge from the server-rendered HTML (which always uses
// defaultView), causing a hydration mismatch. The choice still gets
// remembered for next time via localStorage, it just doesn't override the
// role-based default until the user actively toggles it in this session.
export function ViewProvider({
  defaultView,
  children,
}: {
  defaultView: OnboardingView;
  children: React.ReactNode;
}) {
  const [view, setViewState] = useState<OnboardingView>(defaultView);

  function setView(next: OnboardingView) {
    setViewState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return <ViewContext.Provider value={{ view, setView }}>{children}</ViewContext.Provider>;
}

export function useOnboardingView(): ViewContextValue {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useOnboardingView must be used within a ViewProvider");
  return ctx;
}
