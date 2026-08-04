import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UnitSystem = 'metric' | 'imperial';

interface UnitsContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  convertWeight: (kg: number) => number;
  convertHeight: (cm: number) => number;
  convertTemperature: (celsius: number) => number;
  convertVolume: (ml: number) => number;
  weightUnit: string;
  heightUnit: string;
  temperatureUnit: string;
  volumeUnit: string;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem('unitSystem');
    return (saved as UnitSystem) || 'metric';
  });

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem('unitSystem', system);
  };

  const convertWeight = (kg: number): number => {
    if (unitSystem === 'imperial') {
      return kg * 2.20462; // kg to lbs
    }
    return kg;
  };

  const convertHeight = (cm: number): number => {
    if (unitSystem === 'imperial') {
      return cm * 0.393701; // cm to inches
    }
    return cm;
  };

  const convertTemperature = (celsius: number): number => {
    if (unitSystem === 'imperial') {
      return (celsius * 9/5) + 32; // Celsius to Fahrenheit
    }
    return celsius;
  };

  const convertVolume = (ml: number): number => {
    if (unitSystem === 'imperial') {
      return ml * 0.033814; // ml to fl oz
    }
    return ml;
  };

  const value = {
    unitSystem,
    setUnitSystem,
    convertWeight,
    convertHeight,
    convertTemperature,
    convertVolume,
    weightUnit: unitSystem === 'metric' ? 'kg' : 'lbs',
    heightUnit: unitSystem === 'metric' ? 'cm' : 'in',
    temperatureUnit: unitSystem === 'metric' ? '°C' : '°F',
    volumeUnit: unitSystem === 'metric' ? 'ml' : 'fl oz',
  };

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error('useUnits must be used within UnitsProvider');
  }
  return context;
}
