"use client";

import { SessionProvider } from "next-auth/react";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { ReactQueryProvider } from "@/lib/react-query";
import type { ThemeMode, ThemePreset } from "@/types/preferences/theme";

export function Providers({
  children,
  themeMode,
  themePreset,
}: {
  children: React.ReactNode;
  themeMode: ThemeMode;
  themePreset: ThemePreset;
}) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
          {children}
        </PreferencesStoreProvider>
      </ReactQueryProvider>
    </SessionProvider>
  );
}
