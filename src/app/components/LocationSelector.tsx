import React, { useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useLocation, availableRegions, Region } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

export default function LocationSelector() {
  const { selectedLocation, setSelectedLocation } = useLocation();
  const { profile, updateProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegions = availableRegions.filter((region) =>
    region.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group regions by country
  const groupedRegions = filteredRegions.reduce((acc, region) => {
    if (!acc[region.country]) {
      acc[region.country] = [];
    }
    acc[region.country].push(region);
    return acc;
  }, {} as Record<string, Region[]>);

  const handleSelectLocation = async (region: Region) => {
    try {
      console.log('=== LOCATION SELECTOR: Updating location ===');
      console.log('Selected region:', region.displayName);
      console.log('Profile exists:', !!profile);
      
      // Update LocationContext
      setSelectedLocation(region);
      setIsOpen(false);
      setSearchQuery("");

      // Update user profile in backend if profile exists
      if (profile) {
        console.log('Updating profile with location:', region.displayName);
        console.log('Profile data being sent:', {
          name: profile.name,
          age: profile.age,
          bmi: profile.bmi,
          medicalCondition: profile.medicalCondition,
          location: region.displayName,
          profilePicture: profile.profilePicture ? 'present' : 'none',
        });

        try {
          const result = await updateUserProfile({
            name: profile.name,
            age: profile.age,
            bmi: profile.bmi,
            medicalCondition: profile.medicalCondition,
            location: region.displayName,
            profilePicture: profile.profilePicture,
          });
          
          console.log('✅ Backend update successful:', result);

          // Update local profile context
          updateProfile({
            location: region.displayName,
          });

          toast.success(`Location updated to ${region.displayName}! 📍`);
        } catch (apiError) {
          console.error('❌ Backend update failed:', apiError);
          throw apiError;
        }
      } else {
        console.log('No profile found, only updating context');
      }
    } catch (error: any) {
      console.error('❌ Location update error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      toast.error(`Failed to update location: ${error?.message || 'Unknown error'}`);
      
      // Revert the location change in the UI
      // The context has already been updated, but we can show the error
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white rounded-2xl shadow-md px-4 py-3 hover:shadow-lg transition-all border-2 border-transparent hover:border-[#1f7a8c]"
      >
        <div className="bg-[#1f7a8c] rounded-full p-2">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs text-gray-500">Your Location</div>
          <div className="text-sm text-gray-800 flex items-center gap-2">
            <span>{selectedLocation.flag}</span>
            <span className="font-medium">{selectedLocation.displayName}</span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1f7a8c] text-center mb-2">
              Select Your Location
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Choose your region for personalized meal ingredients
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1f7a8c] focus:outline-none transition-colors"
            />
          </div>

          {/* Location List */}
          <div className="overflow-y-auto flex-1 px-4 pb-4">
            <div className="space-y-4">
              {Object.entries(groupedRegions).map(([country, regions]) => (
                <div key={country}>
                  <h3 className="text-sm text-gray-500 mb-2 px-2">{country}</h3>
                  <div className="space-y-2">
                    {regions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => handleSelectLocation(region)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedLocation.id === region.id
                            ? "bg-[#B8E5E5] border-2 border-[#1f7a8c]"
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{region.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-800">
                            {region.name}
                          </div>
                          <div className="text-xs text-gray-500">{region.country}</div>
                        </div>
                        {selectedLocation.id === region.id && (
                          <Check className="h-5 w-5 text-[#1f7a8c]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredRegions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No locations found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}