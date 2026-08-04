import React, { createContext, useContext, useState, ReactNode } from "react";

export type Region = {
  id: string;
  name: string;
  country: string;
  flag: string;
  displayName: string;
};

export const availableRegions: Region[] = [
  // Nigeria
  { id: "lagos", name: "Lagos", country: "Nigeria", flag: "🇳🇬", displayName: "Lagos, Nigeria" },
  { id: "abuja", name: "Abuja", country: "Nigeria", flag: "🇳🇬", displayName: "Abuja, Nigeria" },
  { id: "port-harcourt", name: "Port Harcourt", country: "Nigeria", flag: "🇳🇬", displayName: "Port Harcourt, Nigeria" },
  { id: "ibadan", name: "Ibadan", country: "Nigeria", flag: "🇳🇬", displayName: "Ibadan, Nigeria" },
  { id: "kano", name: "Kano", country: "Nigeria", flag: "🇳🇬", displayName: "Kano, Nigeria" },
  
  // United Kingdom
  { id: "london", name: "London", country: "United Kingdom", flag: "🇬🇧", displayName: "London, UK" },
  { id: "manchester", name: "Manchester", country: "United Kingdom", flag: "🇬🇧", displayName: "Manchester, UK" },
  { id: "birmingham", name: "Birmingham", country: "United Kingdom", flag: "🇬🇧", displayName: "Birmingham, UK" },
  
  // United States
  { id: "new-york", name: "New York", country: "United States", flag: "🇺🇸", displayName: "New York, USA" },
  { id: "houston", name: "Houston", country: "United States", flag: "🇺🇸", displayName: "Houston, USA" },
  { id: "atlanta", name: "Atlanta", country: "United States", flag: "🇺🇸", displayName: "Atlanta, USA" },
  
  // Ghana
  { id: "accra", name: "Accra", country: "Ghana", flag: "🇬🇭", displayName: "Accra, Ghana" },
  { id: "kumasi", name: "Kumasi", country: "Ghana", flag: "🇬🇭", displayName: "Kumasi, Ghana" },
  
  // South Africa
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", flag: "🇿🇦", displayName: "Johannesburg, South Africa" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", flag: "🇿🇦", displayName: "Cape Town, South Africa" },
  
  // Canada
  { id: "toronto", name: "Toronto", country: "Canada", flag: "🇨🇦", displayName: "Toronto, Canada" },
  { id: "vancouver", name: "Vancouver", country: "Canada", flag: "🇨🇦", displayName: "Vancouver, Canada" },
];

type LocationContextType = {
  selectedLocation: Region;
  setSelectedLocation: (location: Region) => void;
  // Helper function to get ingredient substitutes based on location
  getRegionalKey: () => "lagos" | "london";
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Region>(availableRegions[0]); // Default to Lagos

  // Map regions to ingredient keys (lagos/london)
  // Nigerian cities use "lagos" ingredients, UK/US/other diaspora use "london" ingredients
  const getRegionalKey = (): "lagos" | "london" => {
    const nigerianRegions = ["lagos", "abuja", "port-harcourt", "ibadan", "kano"];
    const ghanaRegions = ["accra", "kumasi"];
    
    // Nigeria and Ghana use local ingredients
    if (nigerianRegions.includes(selectedLocation.id) || ghanaRegions.includes(selectedLocation.id)) {
      return "lagos";
    }
    // All other regions use diaspora substitutes
    return "london";
  };

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation, getRegionalKey }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
