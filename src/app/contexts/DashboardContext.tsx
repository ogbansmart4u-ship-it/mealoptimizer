import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DashboardWidget {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

interface DashboardContextType {
  widgets: DashboardWidget[];
  updateWidgetVisibility: (id: string, visible: boolean) => void;
  reorderWidgets: (widgets: DashboardWidget[]) => void;
  resetToDefault: () => void;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'quick-actions', name: 'Quick Actions', visible: true, order: 0 },
  { id: 'hyper-plan', name: 'Hyper-Personalized Plan', visible: true, order: 1 },
  { id: 'tracker-wheel', name: 'Health Trackers', visible: true, order: 2 },
  { id: 'health-profile', name: 'Health Profile', visible: true, order: 3 },
  { id: 'educational', name: 'Educational Content', visible: true, order: 4 },
  { id: 'notifications', name: 'Notifications', visible: true, order: 5 },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const updateWidgetVisibility = (id: string, visible: boolean) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible } : w))
    );
  };

  const reorderWidgets = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets.map((w, index) => ({ ...w, order: index })));
  };

  const resetToDefault = () => {
    setWidgets(defaultWidgets);
  };

  return (
    <DashboardContext.Provider
      value={{ widgets, updateWidgetVisibility, reorderWidgets, resetToDefault }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
