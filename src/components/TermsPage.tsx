import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  useEffect(() => {
    document.title = 'Terms of Service – Project Sapiens';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          BACK
        </button>

        <article className="bg-white border border-black p-8 md:p-12 shadow-[8px_8px_0px_#000000] max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="font-extrabold text-4xl md:text-5xl uppercase tracking-tighter mb-4">
              Terms of Service
            </h1>
            <p className="text-lg font-semibold text-[#555555]">Project Sapiens</p>
            <p className="text-sm text-[#888888] mt-2">Last updated: January 2026</p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                By accessing or using Project Sapiens ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not use the Service.
              </p>
              <p className="leading-relaxed text-[#1C1A17] mt-4">
                Project Sapiens is operated by Project Sapiens, Inc. ("we," "us," or "our").
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                2. Description of the Service
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                Project Sapiens is an AI-powered learning platform designed to help users develop practical skills and confidence working with artificial intelligence through lessons, labs, projects, and community features.
              </p>
              <p className="leading-relaxed text-[#1C1A17] mt-4">
                Some features may be experimental, rate-limited, or changed over time.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                3. Eligibility
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                You must be at least 13 years old (or the minimum legal age in your jurisdiction) to use the Service.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                4. Accounts and Security
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                You are responsible for maintaining the confidentiality of your account credentials and all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                5. Acceptable Use
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                You agree not to misuse the Service, attempt to bypass safeguards, abuse AI systems, or violate laws or intellectual property.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                6. AI-Generated Content
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                AI-generated responses may be inaccurate or incomplete. They are provided for educational purposes only. You are responsible for how you use them.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                7. User Content
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                You retain ownership of your content. You grant Project Sapiens a limited license to host, display, and process it to operate the Service.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                8. Payments
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                Some features may require payment. Terms will be disclosed at purchase.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                9. Termination
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                We may suspend or terminate access for violations or security reasons.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                10. Disclaimer of Warranties
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                The Service is provided "as is" without warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                11. Limitation of Liability
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                Project Sapiens is not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                12. Changes to Terms
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                We may update these Terms. Continued use means acceptance.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                13. Contact
              </h2>
              <p className="leading-relaxed text-[#1C1A17]">
                Questions: <a href="mailto:support@projectsapiens.ai" className="text-[#FF6A00] font-semibold hover:underline">support@projectsapiens.ai</a>
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
