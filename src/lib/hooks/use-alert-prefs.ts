"use client";

import { useEffect, useState } from "react";

export type AlertPrefs = {
  showVisualAlerts: boolean;
  showExpiryAlerts: boolean;
  showFinancialAlerts: boolean;
  showMarginWarnings: boolean;
};

const STORAGE_KEY = "autohaus:alert_prefs";

const DEFAULT_PREFS: AlertPrefs = {
  showVisualAlerts: true,
  showExpiryAlerts: true,
  showFinancialAlerts: true,
  showMarginWarnings: true,
};

export function useAlertPrefs() {
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  function update(key: keyof AlertPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  return { prefs, update };
}
