import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { DEMO_STEPS } from "./demoScenario";

const DemoContext = createContext(null);
const AUTO_STEP_MS = 3200;

function storageSuffix(user) {
  return user?.id || user?.username || "anonymous";
}

function readStored(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value == null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function DemoProvider({ children }) {
  const { user } = useAuth();
  const suffix = storageSuffix(user);
  const onboardingKey = `sentinelcore:onboarding:v1:${suffix}`;
  const demoKey = `sentinelcore:demo:v1:${suffix}`;

  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!user) return;
    const completed = readStored(onboardingKey, false);
    const storedDemo = readStored(demoKey, null);
    setTourOpen(!completed);
    setTourStep(0);
    setDemoStep(Math.min(storedDemo?.step ?? 0, DEMO_STEPS.length - 1));
    setHasStarted(Boolean(storedDemo?.started));
    setPlaying(false);
  }, [demoKey, onboardingKey, user]);

  useEffect(() => {
    if (!user || !hasStarted) return;
    try {
      window.localStorage.setItem(demoKey, JSON.stringify({ step: demoStep, started: true }));
    } catch {
      // The simulation still works when browser storage is unavailable.
    }
  }, [demoKey, demoStep, hasStarted, user]);

  useEffect(() => {
    if (!playing) return undefined;
    if (demoStep >= DEMO_STEPS.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setDemoStep((step) => step + 1), AUTO_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [demoStep, playing]);

  const openTour = useCallback(() => {
    setTourStep(0);
    setTourOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    try {
      window.localStorage.setItem(onboardingKey, JSON.stringify(true));
    } catch {
      // A private browsing policy may block storage; closing still works.
    }
  }, [onboardingKey]);

  const start = useCallback(() => {
    setHasStarted(true);
    setDemoStep(0);
    setPlaying(true);
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setHasStarted(false);
    setDemoStep(0);
    try {
      window.localStorage.removeItem(demoKey);
    } catch {
      // Reset local state even if storage is unavailable.
    }
  }, [demoKey]);

  const next = useCallback(() => {
    setHasStarted(true);
    setDemoStep((step) => Math.min(step + 1, DEMO_STEPS.length - 1));
  }, []);

  const previous = useCallback(() => {
    setPlaying(false);
    setDemoStep((step) => Math.max(step - 1, 0));
  }, []);

  const value = useMemo(
    () => ({
      tourOpen,
      tourStep,
      setTourStep,
      openTour,
      closeTour,
      demoStep,
      setDemoStep,
      playing,
      setPlaying,
      hasStarted,
      start,
      reset,
      next,
      previous,
      complete: demoStep === DEMO_STEPS.length - 1,
    }),
    [tourOpen, tourStep, openTour, closeTour, demoStep, playing, hasStarted, start, reset, next, previous],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside a <DemoProvider>");
  return value;
}
