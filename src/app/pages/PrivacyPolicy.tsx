import { Shield, Lock, Eye, Database, UserCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-28">
      {/* Header */}
      <PageHeader
        title="Privacy Policy"
        actions={<Shield className="h-6 w-6 text-white" />}
      />

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Last Updated */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <p className="text-sm text-gray-600 text-center">
            Last Updated: March 17, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#1f7a8c] rounded-full p-3">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Our Commitment to Privacy</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            At MealOptimiza, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this privacy policy carefully.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#4ecdc4] rounded-full p-3">
              <Database className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Information We Collect</h2>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Name and contact information</li>
                <li>Age, gender, and date of birth</li>
                <li>Location data (city/region)</li>
                <li>Weight, height, and BMI</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Health Information</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Medical conditions and diagnoses</li>
                <li>Medications and dosages</li>
                <li>Dietary preferences and restrictions</li>
                <li>Nutritional goals and progress</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Usage Data</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Food images uploaded or captured</li>
                <li>Meal plans and nutrition data</li>
                <li>App usage statistics</li>
                <li>Device information and IP address</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#e63946] rounded-full p-3">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">How We Use Your Information</h2>
          </div>
          
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-[#1f7a8c] mt-1">•</span>
              <span>To provide personalized meal plans and nutrition recommendations</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1f7a8c] mt-1">•</span>
              <span>To analyze food images and calculate nutritional content</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1f7a8c] mt-1">•</span>
              <span>To check for food-drug interactions and dietary restrictions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1f7a8c] mt-1">•</span>
              <span>To send local market updates and fresh produce notifications</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1f7a8c] mt-1">•</span>
              <span>To improve our services and develop new features</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#1f7a8c] mt-1">•</span>
              <span>To communicate with you about your account and updates</span>
            </li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 rounded-full p-3">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Data Security</h2>
          </div>
          
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            We implement industry-standard security measures to protect your personal and health information:
          </p>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span>🔒</span>
              <span>End-to-end encryption for sensitive health data</span>
            </li>
            <li className="flex gap-2">
              <span>🛡️</span>
              <span>Secure servers with regular security audits</span>
            </li>
            <li className="flex gap-2">
              <span>🔐</span>
              <span>Access controls and authentication protocols</span>
            </li>
            <li className="flex gap-2">
              <span>📱</span>
              <span>Data stored locally on your device when possible</span>
            </li>
          </ul>
        </div>

        {/* Data Sharing */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500 rounded-full p-3">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Data Sharing & Disclosure</h2>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-medium text-gray-800">We DO NOT sell your personal information.</p>
            
            <p>We may share your information only in these circumstances:</p>
            
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span><strong>With Your Consent:</strong> When you explicitly authorize us to share data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span><strong>Service Providers:</strong> Third-party vendors who help us operate the app (under strict confidentiality agreements)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span><strong>Legal Requirements:</strong> When required by law or to protect our rights</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span><strong>Aggregated Data:</strong> Anonymous, aggregated statistics for research (no personal identification)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Your Privacy Rights</h2>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Access & Correction</p>
              <p>You can view and update your information anytime in your profile</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Data Deletion</p>
              <p>Request deletion of your account and all associated data</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Data Portability</p>
              <p>Request a copy of your data in a portable format</p>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Opt-Out</p>
              <p>Unsubscribe from marketing communications at any time</p>
            </div>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-3">Children's Privacy</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            MealOptimiza is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from a child under 13, please contact us immediately.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-3xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-lg mb-3">Contact Us</h2>
          <p className="text-sm mb-4">
            If you have questions or concerns about this Privacy Policy, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p>📧 privacy@mealoptimiza.com</p>
            <p>📱 +234 (0) 800 MEAL OPT</p>
            <p>🌐 www.mealoptimiza.com/privacy</p>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-white text-[#1f7a8c] font-bold border-2 border-[#1f7a8c] rounded-2xl py-3.5 shadow-md hover:bg-teal-50 transition-all cursor-pointer mb-6"
        >
          Go Back
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}