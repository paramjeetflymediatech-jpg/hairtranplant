import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Eye, Database, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | GraftDesk & ASG Hair Transplant',
  description: 'Your privacy and medical data safety are our top priorities. Learn about our data practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 text-lg">Last Updated: July 27, 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/90 shadow-sm space-y-10">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-teal-600">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
            <h2 className="text-xl font-bold text-slate-900">1. Commitment to Privacy</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            GraftDesk and ASG Hair Transplant are dedicated to protecting your privacy. We implement secure, HIPAA-compliant encryption standards to safeguard all personal and medical information collected via our website, patient portal, and mobile application.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-teal-600">
            <Eye className="w-6 h-6 stroke-[2]" />
            <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            To provide clinical hair restoration analysis and doctor consultations, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 text-sm">
            <li><strong>Personal Details:</strong> Full Name, phone number, and email address.</li>
            <li><strong>Authentication Info:</strong> Encrypted passwords and login session details.</li>
            <li><strong>Clinical & Medical Data:</strong> Photos of your scalp (front, top, sides, and back) uploaded for hair test diagnostics, hair density analyses, Norwood hair loss stages, and doctor-prescribed treatment plans.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-teal-600">
            <Database className="w-6 h-6 stroke-[2]" />
            <h2 className="text-xl font-bold text-slate-900">3. How Your Data is Used & Protected</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Your information is used solely to generate AI hair analysis results, coordinate clinical appointments, and manage your hair restoration surgery history. We do not sell or lease your personal or medical data to third-party advertisers. All data is encrypted in transit and at rest.
          </p>
        </section>

        {/* Section 4 - Account Deletion */}
        <section className="space-y-4 p-6 rounded-2xl bg-rose-50 border border-rose-100">
          <div className="flex items-center gap-3 text-rose-600">
            <Trash2 className="w-6 h-6 stroke-[2]" />
            <h2 className="text-xl font-bold text-rose-900">4. User Rights & Account Deletion</h2>
          </div>
          <p className="text-rose-800 leading-relaxed text-sm">
            We support your right to control your personal and clinical data. You can delete your account and all associated medical history at any time.
          </p>
          <div className="text-rose-800 leading-relaxed text-sm space-y-2">
            <p><strong>To request account and data deletion:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>In the App:</strong> Go to <em>My Profile</em>, tap the <em>Delete Account</em> button, and confirm.</li>
              <li><strong>On the Website:</strong> You can self-delete your account directly without installing the app by using our online portal here: <Link href="/delete-account" className="underline font-bold hover:text-rose-700">Delete My Account Tool</Link>.</li>
            </ul>
            <p className="mt-2 text-xs opacity-90">
              *Note: Once deleted, your data (including hair analysis logs, uploaded photos, and clinical history) is purged permanently and cannot be recovered.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">5. Contact Support</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            If you have any questions or feedback regarding this Privacy Policy, please contact our privacy compliance officer at <a href="mailto:support@asghairtransplant.com" className="text-teal-600 hover:underline">support@asghairtransplant.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
