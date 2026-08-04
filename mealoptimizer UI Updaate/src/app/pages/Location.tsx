import { MapPin, ChevronLeft, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { availableRegions } from "../contexts/LocationContext";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import OnboardingProgress from "../components/OnboardingProgress";

export default function Location() {
  const navigate = useNavigate();
  const { selectedLocation, setSelectedLocation } = useLocation();
  const { profile, updateProfile } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [tempSelectedLocation, setTempSelectedLocation] = useState(selectedLocation);

  // Sync with current location context on mount
  useEffect(() => {
    setTempSelectedLocation(selectedLocation);
  }, [selectedLocation]);

  const handleSaveLocation = async () => {
    try {
      setSaving(true);
      
      console.log('=== SAVING LOCATION ===');
      console.log('Profile exists:', !!profile);
      console.log('Selected location:', tempSelectedLocation.displayName);

      // Update LocationContext
      setSelectedLocation(tempSelectedLocation);

      // Update user profile in backend if profile exists
      if (profile) {
        console.log('Updating profile with location:', tempSelectedLocation.displayName);
        console.log('Profile data being sent:', {
          name: profile.name,
          age: profile.age,
          bmi: profile.bmi,
          medicalCondition: profile.medicalCondition,
          location: tempSelectedLocation.displayName,
          profilePicture: profile.profilePicture ? 'present' : 'none',
        });

        try {
          const result = await updateUserProfile({
            name: profile.name,
            age: profile.age,
            bmi: profile.bmi,
            medicalCondition: profile.medicalCondition,
            location: tempSelectedLocation.displayName,
            profilePicture: profile.profilePicture,
          });
          
          console.log('✅ Backend update successful:', result);

          // Update local profile context
          updateProfile({
            location: tempSelectedLocation.displayName,
          });

          toast.success("Location updated successfully! 📍");
        } catch (apiError) {
          console.error('❌ Backend update failed:', apiError);
          throw apiError;
        }
      } else {
        console.log('No profile found, only updating context');
        // If no profile, just update the context
        toast.success("Location preference saved! 📍");
      }

      navigate("/home");
    } catch (error: any) {
      console.error('❌ Location save error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      toast.error(`Failed to save location: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-8">
      {/* Header */}
      <div className="bg-[#1f7a8c] px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl text-white flex-1">My Location</h1>
          <MapPin className="h-6 w-6 text-white" />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for your city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#4ecdc4]"
          />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="px-6 mt-6">
        <OnboardingProgress currentStep={1} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Current Location */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Current Location</h2>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-2xl">
            <MapPin className="h-6 w-6 text-white" />
            <div className="flex-1">
              <p className="text-white text-lg">{tempSelectedLocation.displayName}</p>
              <p className="text-white/80 text-sm">Active location</p>
            </div>
            <span className="text-2xl">{tempSelectedLocation.flag}</span>
          </div>
        </div>

        {/* Why Location Matters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-3">Why Location Matters</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-xl">🥬</span>
              <p>Get recommendations based on locally available fresh produce</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🏪</span>
              <p>Discover nearby markets with the best prices for healthy ingredients</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🌍</span>
              <p>Receive meal plans adapted to your regional cuisine</p>
            </div>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Popular Locations</h2>
          <div className="space-y-3">
            {availableRegions
              .filter(loc => 
                searchQuery === "" || 
                loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.country.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((location) => (
                <button
                  key={location.id}
                  onClick={() => setTempSelectedLocation(location)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    tempSelectedLocation.id === location.id
                      ? "bg-[#1f7a8c] text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-2xl">{location.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{location.name}</p>
                    <p className={`text-sm ${
                      tempSelectedLocation.id === location.id
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}>{location.country}</p>
                  </div>
                  {tempSelectedLocation.id === location.id && (
                    <span className="text-xl">✓</span>
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate("/weight")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleSaveLocation}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}