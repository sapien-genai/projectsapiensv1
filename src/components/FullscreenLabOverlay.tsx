import { ArrowLeft, X } from 'lucide-react';
import { ReactNode } from 'react';

interface FullscreenLabOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
}

export default function FullscreenLabOverlay({ isOpen, onClose, children, title, subtitle, hideHeader = false }: FullscreenLabOverlayProps) {
  if (!isOpen) return null;

  if (hideHeader) {
    return (
      <div className="fixed inset-0 z-50">
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F5F5] overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F5F5] rounded-lg transition-colors text-[#57524D] hover:text-[#1C1A17]"
                aria-label="Return to lesson"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Back to Lesson</span>
              </button>
              <div className="h-6 w-px bg-[#E0E0E0]"></div>
              <div>
                <h1 className="font-bold text-base uppercase tracking-wide text-black">{title || 'LAB'}</h1>
                {subtitle && (
                  <p className="text-sm text-[#666666] mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
              aria-label="Close lab"
            >
              <X className="w-5 h-5 text-[#57524D]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
