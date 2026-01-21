import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  onAuthClick?: () => void;
  onPathsClick?: () => void;
  onLabsClick?: () => void;
  onCommunityClick?: () => void;
  onPricingClick?: () => void;
}

export default function Navigation({ onAuthClick, onPathsClick, onLabsClick, onCommunityClick, onPricingClick }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#F4F4F4] border-b border-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Compass className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
            <h1 className="font-extrabold text-base md:text-xl uppercase tracking-tight">
              PROJECT SAPIENS
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={onPathsClick}
              className="font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              LEARNING PATHS
            </button>
            <button
              onClick={onLabsClick}
              className="font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              LABS
            </button>
            <button
              onClick={onPricingClick}
              className="font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              PRICING
            </button>
            <button
              onClick={onCommunityClick}
              className="font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              COMMUNITY
            </button>
            <button
              onClick={onAuthClick}
              className="font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              LOG IN
            </button>

            <button
              onClick={onAuthClick}
              className="bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              SIGN UP
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border border-black bg-white shadow-[2px_2px_0px_#000000]"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={2} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-black space-y-4">
            <button
              onClick={() => {
                onPathsClick?.();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              LEARNING PATHS
            </button>
            <button
              onClick={() => {
                onLabsClick?.();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              LABS
            </button>
            <button
              onClick={() => {
                onPricingClick?.();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              PRICING
            </button>
            <button
              onClick={() => {
                onCommunityClick?.();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              COMMUNITY
            </button>
            <button
              onClick={() => {
                onAuthClick?.();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left font-extrabold text-sm uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              LOG IN
            </button>

            <button
              onClick={() => {
                onAuthClick?.();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              SIGN UP
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
