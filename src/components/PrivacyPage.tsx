import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  useEffect(() => {
    document.title = 'Privacy Policy – Project Sapiens';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          BACK
        </button>

        <article className="bg-white border border-ink p-8 md:p-12 shadow-brutal-xl max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="font-extrabold text-4xl md:text-5xl uppercase tracking-tighter mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg font-semibold text-[#555555]">Project Sapiens</p>
            <p className="text-sm text-[#888888] mt-2">Last updated: January 2026</p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                1. Information We Collect
              </h2>
              <p className="leading-relaxed text-strong">
                We collect account information, usage data, and content you submit.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                2. How We Use Information
              </h2>
              <p className="leading-relaxed text-strong">
                To operate the Service, authenticate users, improve learning, and ensure security.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                3. AI Processing
              </h2>
              <p className="leading-relaxed text-strong">
                Some content is processed by AI systems. Private content is not used to train public AI models.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                4. Data Sharing
              </h2>
              <p className="leading-relaxed text-strong">
                We do not sell personal data. We share data only with infrastructure, AI, and payment providers as needed.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                5. Cookies
              </h2>
              <p className="leading-relaxed text-strong">
                We use cookies for authentication and basic analytics.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                6. Data Security
              </h2>
              <p className="leading-relaxed text-strong">
                We apply reasonable safeguards to protect data.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                7. Data Retention
              </h2>
              <p className="leading-relaxed text-strong">
                Data is retained only as long as necessary. You may request deletion.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                8. Your Rights
              </h2>
              <p className="leading-relaxed text-strong">
                You may request access, correction, or deletion of your data.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                9. Children's Privacy
              </h2>
              <p className="leading-relaxed text-strong">
                The Service is not intended for children under 13.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                10. Changes
              </h2>
              <p className="leading-relaxed text-strong">
                This policy may be updated over time.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4 border-b-2 border-ink pb-2">
                11. Contact
              </h2>
              <p className="leading-relaxed text-strong">
                Privacy questions: <a href="mailto:support@projectsapiens.ai" className="text-accent font-semibold hover:underline">support@projectsapiens.ai</a>
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
