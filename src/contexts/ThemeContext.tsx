"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/supabase/auth";

export type Accent = "orange" | "green" | "blue" | "purple";

interface ThemeContextValue {
  accent: Accent;
  animations: boolean;
  loading: boolean;

  setAccent: (accent: Accent) => Promise<void>;
  setAnimations: (enabled: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

const accentValues: Record<
  Accent,
  {
    hex: string;
    rgb: string;
  }
> = {
  orange: {
    hex: "#fd6401",
    rgb: "253, 100, 1",
  },

  green: {
    hex: "#10b981",
    rgb: "16, 185, 129",
  },

  blue: {
    hex: "#3b82f6",
    rgb: "59, 130, 246",
  },

  purple: {
    hex: "#a855f7",
    rgb: "168, 85, 247",
  },
};

function applyAccent(accent: Accent) {
  const root = document.documentElement;
  const values = accentValues[accent];

  root.style.setProperty("--accent", values.hex);
  root.style.setProperty("--accent-rgb", values.rgb);
}

function applyAnimations(enabled: boolean) {
  const root = document.documentElement;

  root.classList.toggle("no-animations", !enabled);
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [accent, setAccentState] = useState<Accent>("orange");
  const [animations, setAnimationsState] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      const userId = await getUserId();

      if (!userId) {
        applyAccent("orange");
        applyAnimations(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("accent, animations")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error(
          "Erro ao carregar preferências de aparência:",
          error,
        );

        applyAccent("orange");
        applyAnimations(true);

        return;
      }

      const savedAccent: Accent =
        data?.accent === "green" ||
        data?.accent === "blue" ||
        data?.accent === "purple"
          ? data.accent
          : "orange";

      const savedAnimations =
        typeof data?.animations === "boolean"
          ? data.animations
          : true;

      setAccentState(savedAccent);
      setAnimationsState(savedAnimations);

      applyAccent(savedAccent);
      applyAnimations(savedAnimations);
    } catch (error) {
      console.error(
        "Erro ao carregar preferências:",
        error,
      );

      applyAccent("orange");
      applyAnimations(true);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updateSetting = useCallback(
    async (
      field: "accent" | "animations",
      value: Accent | boolean,
    ) => {
      try {
        const userId = await getUserId();

        if (!userId) return;

        const { error } = await supabase
          .from("user_settings")
          .update({
            [field]: value,
          })
          .eq("user_id", userId);

        if (error) {
          console.error(
            `Erro ao salvar ${field}:`,
            error,
          );
        }
      } catch (error) {
        console.error(
          `Erro ao salvar ${field}:`,
          error,
        );
      }
    },
    [supabase],
  );

  const setAccent = useCallback(
    async (value: Accent) => {
      setAccentState(value);
      applyAccent(value);

      await updateSetting("accent", value);
    },
    [updateSetting],
  );

  const setAnimations = useCallback(
    async (value: boolean) => {
      setAnimationsState(value);
      applyAnimations(value);

      await updateSetting("animations", value);
    },
    [updateSetting],
  );

  return (
    <ThemeContext.Provider
      value={{
        accent,
        animations,
        loading,
        setAccent,
        setAnimations,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme deve ser usado dentro de um ThemeProvider",
    );
  }

  return context;
}