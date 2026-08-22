import { FileText, AlertTriangle, CheckCircle, Scale as ScaleIcon, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-28">
      {/* Header */}
      <PageHeader
        title="Terms & Conditions"
        actions={<FileText className="h-6 w-6 text-white" />}
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
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Agreement to Terms</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Welcome to MealOptimiza! By accessing or using our application, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services. If you do not agree to these terms, please do not use the app.
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg text-red-600">Medical Disclaimer</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-medium">
              MealOptimiza is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Always consult your physician or qualified healthcare provider with any questions about medical conditions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Never disregard professional medical advice or delay seeking it because of information from this app</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>In case of emergency, call your local emergency services immediately</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Use of Service */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#4ecdc4] rounded-full p-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Use of Service</h2>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Eligibility</h3>
              <p>You must be at least 13 years old to use MealOptimiza. Users under 18 should use the app under parental supervision.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Account Registration</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Acceptable Use</h3>
              <p className="mb-2">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Use the app for any illegal purpose</li>
                <li>Upload harmful or malicious content</li>
                <li>Attempt to hack or disrupt the service</li>
                <li>Share false or misleading health information</li>
                <li>Use the app to harm others</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Service Features */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 rounded-full p-3">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Service Features & Limitations</h2>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Meal Analysis</p>
              <p>Our food analysis is based on AI algorithms and may not be 100% accurate. Always verify nutritional information.</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Personalized Plans</p>
              <p>Meal plans are generated based on the information you provide. Accuracy depends on complete and honest input.</p>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Drug Interactions</p>
              <p>Food-drug interaction warnings are informational. Always consult your pharmacist or doctor.</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 mb-1">Market Updates</p>
              <p>Local market information is provided as-is and may not always be current or available in your area.</p>
            </div>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#e63946] rounded-full p-3">
              <ScaleIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">Intellectual Property</h2>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              All content, features, and functionality of MealOptimiza are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            
            <p className="font-medium text-gray-800">You may NOT:</p>
            <ul className="space-y-1 pl-4">
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Copy, modify, or distribute our content without permission</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Reverse engineer or decompile the application</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Remove any copyright or proprietary notices</span>
              </li>
            </ul>
          </div>
        </div>

        {/* User Content */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">User-Generated Content</h2>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              When you upload food images or other content to MealOptimiza:
            </p>
            
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>You retain ownership of your content</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>You grant us a license to use, process, and analyze your content to provide our services</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>You are responsible for ensuring you have the right to upload the content</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>We may use anonymized, aggregated data for improving our AI models</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Limitation of Liability</h2>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-medium text-gray-800">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>MealOptimiza is provided "AS IS" without warranties of any kind</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>We are not liable for any health issues arising from use of the app</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>We are not responsible for inaccuracies in nutritional information</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>We do not guarantee uninterrupted or error-free service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Our total liability shall not exceed the amount you paid us (if any)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-3">Termination</h2>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe:
            </p>
            
            <ul className="space-y-1 pl-4">
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Violates these Terms and Conditions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Is harmful to other users or the service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1f7a8c] mt-1">•</span>
                <span>Violates applicable laws or regulations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-3">Changes to Terms</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            We may update these Terms and Conditions from time to time. We will notify you of any changes by posting the new terms on this page and updating the "Last Updated" date. Your continued use of the app after changes constitutes acceptance of the new terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-3">Governing Law</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            These Terms and Conditions are governed by and construed in accordance with the laws of Nigeria. Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-3xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-lg mb-3">Questions About Terms?</h2>
          <p className="text-sm mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p>📧 legal@mealoptimiza.com</p>
            <p>📱 +234 (0) 800 MEAL OPT</p>
            <p>🌐 www.mealoptimiza.com/terms</p>
          </div>
        </div>

        {/* Acceptance */}
        <div className="bg-green-50 border-2 border-green-200 rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-lg text-green-600">Your Acceptance</h2>
          </div>
          <p className="text-sm text-gray-700">
            By using MealOptimiza, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>
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