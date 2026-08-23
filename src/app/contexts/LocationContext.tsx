import React, { createContext, useContext, useState, ReactNode } from "react";

export type Region = {
  id: string;
  name: string;
  country: string;
  flag: string;
  displayName: string;
};

export const availableRegions: Region[] = [
  // ============================================
  // NIGERIA 🇳🇬
  // ============================================
  { id: "lagos", name: "Lagos", country: "Nigeria", flag: "🇳🇬", displayName: "Lagos, Nigeria" },
  { id: "abuja", name: "Abuja", country: "Nigeria", flag: "🇳🇬", displayName: "Abuja, Nigeria" },
  { id: "port-harcourt", name: "Port Harcourt", country: "Nigeria", flag: "🇳🇬", displayName: "Port Harcourt, Nigeria" },
  { id: "ibadan", name: "Ibadan", country: "Nigeria", flag: "🇳🇬", displayName: "Ibadan, Nigeria" },
  { id: "enugu", name: "Enugu", country: "Nigeria", flag: "🇳🇬", displayName: "Enugu, Nigeria" },
  { id: "benin-city", name: "Benin City", country: "Nigeria", flag: "🇳🇬", displayName: "Benin City, Nigeria" },
  { id: "kano", name: "Kano", country: "Nigeria", flag: "🇳🇬", displayName: "Kano, Nigeria" },
  { id: "calabar", name: "Calabar", country: "Nigeria", flag: "🇳🇬", displayName: "Calabar, Nigeria" },
  { id: "asaba", name: "Asaba / Delta", country: "Nigeria", flag: "🇳🇬", displayName: "Asaba, Nigeria" },

  // ============================================
  // CANADA 🇨🇦 (Major Diaspora Hubs)
  // ============================================
  { id: "toronto", name: "Toronto (GTA)", country: "Canada", flag: "🇨🇦", displayName: "Toronto, Canada" },
  { id: "calgary", name: "Calgary", country: "Canada", flag: "🇨🇦", displayName: "Calgary, Canada" },
  { id: "ottawa", name: "Ottawa", country: "Canada", flag: "🇨🇦", displayName: "Ottawa, Canada" },
  { id: "edmonton", name: "Edmonton", country: "Canada", flag: "🇨🇦", displayName: "Edmonton, Canada" },
  { id: "vancouver", name: "Vancouver", country: "Canada", flag: "🇨🇦", displayName: "Vancouver, Canada" },
  { id: "winnipeg", name: "Winnipeg", country: "Canada", flag: "🇨🇦", displayName: "Winnipeg, Canada" },
  { id: "montreal", name: "Montreal", country: "Canada", flag: "🇨🇦", displayName: "Montreal, Canada" },

  // ============================================
  // UNITED STATES 🇺🇸 (Major Diaspora Hubs)
  // ============================================
  { id: "houston", name: "Houston, TX", country: "United States", flag: "🇺🇸", displayName: "Houston, USA" },
  { id: "dallas", name: "Dallas / Fort Worth, TX", country: "United States", flag: "🇺🇸", displayName: "Dallas, USA" },
  { id: "atlanta", name: "Atlanta, GA", country: "United States", flag: "🇺🇸", displayName: "Atlanta, USA" },
  { id: "maryland-dc", name: "Maryland / Washington DC", country: "United States", flag: "🇺🇸", displayName: "Maryland / DC, USA" },
  { id: "new-york", name: "New York / New Jersey", country: "United States", flag: "🇺🇸", displayName: "New York, USA" },
  { id: "chicago", name: "Chicago, IL", country: "United States", flag: "🇺🇸", displayName: "Chicago, USA" },
  { id: "los-angeles", name: "Los Angeles, CA", country: "United States", flag: "🇺🇸", displayName: "Los Angeles, USA" },
  { id: "miami", name: "Miami / South Florida", country: "United States", flag: "🇺🇸", displayName: "Miami, USA" },

  // ============================================
  // AUSTRALIA 🇦🇺 (Major Diaspora Hubs)
  // ============================================
  { id: "sydney", name: "Sydney, NSW", country: "Australia", flag: "🇦🇺", displayName: "Sydney, Australia" },
  { id: "melbourne", name: "Melbourne, VIC", country: "Australia", flag: "🇦🇺", displayName: "Melbourne, Australia" },
  { id: "brisbane", name: "Brisbane, QLD", country: "Australia", flag: "🇦🇺", displayName: "Brisbane, Australia" },
  { id: "perth", name: "Perth, WA", country: "Australia", flag: "🇦🇺", displayName: "Perth, Australia" },
  { id: "adelaide", name: "Adelaide, SA", country: "Australia", flag: "🇦🇺", displayName: "Adelaide, Australia" },

  // ============================================
  // UNITED KINGDOM & IRELAND 🇬🇧 🇮🇪
  // ============================================
  { id: "london", name: "London", country: "United Kingdom", flag: "🇬🇧", displayName: "London, UK" },
  { id: "manchester", name: "Manchester", country: "United Kingdom", flag: "🇬🇧", displayName: "Manchester, UK" },
  { id: "birmingham", name: "Birmingham", country: "United Kingdom", flag: "🇬🇧", displayName: "Birmingham, UK" },
  { id: "leeds", name: "Leeds", country: "United Kingdom", flag: "🇬🇧", displayName: "Leeds, UK" },
  { id: "glasgow", name: "Glasgow / Edinburgh", country: "United Kingdom", flag: "🇬🇧", displayName: "Glasgow, UK" },
  { id: "dublin", name: "Dublin", country: "Ireland", flag: "🇮🇪", displayName: "Dublin, Ireland" },

  // ============================================
  // UAE & MIDDLE EAST 🇦🇪 🇶🇦
  // ============================================
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", flag: "🇦🇪", displayName: "Dubai, UAE" },
  { id: "abu-dhabi", name: "Abu Dhabi", country: "United Arab Emirates", flag: "🇦🇪", displayName: "Abu Dhabi, UAE" },
  { id: "doha", name: "Doha", country: "Qatar", flag: "🇶🇦", displayName: "Doha, Qatar" },

  // ============================================
  // EUROPE 🇩🇪 🇫🇷 🇳🇱
  // ============================================
  { id: "berlin", name: "Berlin / Frankfurt", country: "Germany", flag: "🇩🇪", displayName: "Frankfurt, Germany" },
  { id: "paris", name: "Paris", country: "France", flag: "🇫🇷", displayName: "Paris, France" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", flag: "🇳🇱", displayName: "Amsterdam, Netherlands" },

  // ============================================
  // OTHER AFRICAN HUBS 🇬🇭 🇿🇦 🇰🇪
  // ============================================
  { id: "accra", name: "Accra", country: "Ghana", flag: "🇬🇭", displayName: "Accra, Ghana" },
  { id: "kumasi", name: "Kumasi", country: "Ghana", flag: "🇬🇭", displayName: "Kumasi, Ghana" },
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", flag: "🇿🇦", displayName: "Johannesburg, South Africa" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", flag: "🇿🇦", displayName: "Cape Town, South Africa" },
  { id: "nairobi", name: "Nairobi", country: "Kenya", flag: "🇰🇪", displayName: "Nairobi, Kenya" },
];

type LocationContextType = {
  selectedLocation: Region;
  setSelectedLocation: (location: Region) => void;
  // Helper function to get ingredient substitutes based on location
  getRegionalKey: () => "lagos" | "london";
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Region>(() => {
    try {
      const saved = localStorage.getItem("user_selected_region");
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = availableRegions.find((r) => r.id === parsed.id);
        if (match) return match;
      }
    } catch {
      /* ignore */
    }
    return availableRegions[0]; // Default to Lagos
  });

  const handleSetLocation = (location: Region) => {
    setSelectedLocation(location);
    try {
      localStorage.setItem("user_selected_region", JSON.stringify(location));
    } catch {
      /* ignore */
    }
  };

  // Map regions to ingredient keys (lagos/london)
  // Nigerian/Ghanaian/African cities use "lagos" fresh local ingredients,
  // Canada, US, Australia, UK, Europe use "london" diaspora substitutes
  const getRegionalKey = (): "lagos" | "london" => {
    const localAfricanRegions = [
      "lagos", "abuja", "port-harcourt", "ibadan", "enugu", "benin-city", "kano", "calabar", "asaba",
      "accra", "kumasi", "johannesburg", "cape-town", "nairobi",
    ];

    if (localAfricanRegions.includes(selectedLocation.id)) {
      return "lagos";
    }
    return "london";
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation: handleSetLocation,
        getRegionalKey,
      }}
    >
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
