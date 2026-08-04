import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useLocation, availableRegions } from "../contexts/LocationContext";

/**
 * Component that synchronizes location between UserProfile and LocationContext
 * This ensures that when a user's profile location changes, the LocationContext is updated
 */
export function LocationProfileSync() {
  const { profile } = useUser();
  const { selectedLocation, setSelectedLocation } = useLocation();

  useEffect(() => {
    // When profile loads or updates, sync location to LocationContext
    if (profile?.location) {
      const matchingRegion = availableRegions.find(
        (r) =>
          r.displayName === profile.location ||
          profile.location?.includes(r.name)
      );

      // Only update if we found a match and it's different from current selection
      if (matchingRegion && matchingRegion.id !== selectedLocation.id) {
        console.log(
          `Syncing location from profile: ${profile.location} -> ${matchingRegion.displayName}`
        );
        setSelectedLocation(matchingRegion);
      }
    }
  }, [profile?.location]); // Only re-run when profile.location changes

  // This component doesn't render anything
  return null;
}
