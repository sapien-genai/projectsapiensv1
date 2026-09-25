import { useBrand } from '../contexts/BrandContext';
import { brandDisplayLabel } from '../lib/brand';

interface FooterProps {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onPathsClick?: () => void;
  onLabsClick?: () => void;
  onCommunityClick?: () => void;
}

export default function Footer({ onTermsClick, onPrivacyClick, onPathsClick, onLabsClick, onCommunityClick }: FooterProps) {
  const { brand } = useBrand();

  return (
    <footer className="bg-ink text-surface mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-sm">
              {onPathsClick ? (
                <li><button onClick={onPathsClick} className="py-1 hover:text-accent transition-colors">Paths</button></li>
              ) : (
                <li><span className="text-[#777777]">Paths</span></li>
              )}
              {onLabsClick ? (
                <li><button onClick={onLabsClick} className="py-1 hover:text-accent transition-colors">Labs</button></li>
              ) : (
                <li><span className="text-[#777777]">Labs</span></li>
              )}
              {onCommunityClick ? (
                <li><button onClick={onCommunityClick} className="py-1 hover:text-accent transition-colors">Community</button></li>
              ) : (
                <li><span className="text-[#777777]">Community</span></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-[#777777]">Careers</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              RESOURCES
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-[#777777]">Tools</span></li>
              <li><span className="text-[#777777]">API</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              SOCIAL
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-[#777777]">Twitter</span></li>
              <li><span className="text-[#777777]">LinkedIn</span></li>
              <li><span className="text-[#777777]">GitHub</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#555555] pt-8 space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {onTermsClick && (
              <button
                onClick={onTermsClick}
                className="px-3 py-2 hover:text-accent transition-colors"
              >
                Terms
              </button>
            )}
            {onPrivacyClick && (
              <button
                onClick={onPrivacyClick}
                className="px-3 py-2 hover:text-accent transition-colors"
              >
                Privacy
              </button>
            )}
          </div>
          <p className="text-sm text-center uppercase">
            &copy; 2026 {brandDisplayLabel(brand)}
          </p>
        </div>
      </div>
    </footer>
  );
}
