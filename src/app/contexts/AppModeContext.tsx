import { createContext, useContext, useState, ReactNode } from "react";

type AppMode = "simple" | "expert";

interface AppModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("simple");

  const toggleMode = () => {
    setModeState((prev) => (prev === "simple" ? "expert" : "simple"));
  };

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
  };

  return (
    <AppModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
}
