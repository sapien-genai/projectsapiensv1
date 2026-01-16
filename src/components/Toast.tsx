import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#98C9A3]',
          border: 'border-black',
          icon: <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
        };
      case 'error':
        return {
          bg: 'bg-[#FF6B6B]',
          border: 'border-black',
          icon: <AlertCircle className="w-5 h-5" strokeWidth={2} />
        };
      default:
        return {
          bg: 'bg-[#0A74FF]',
          border: 'border-black',
          icon: <Info className="w-5 h-5 text-white" strokeWidth={2} />
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`${styles.bg} ${styles.border} border-2 p-4 shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-4 min-w-[300px] max-w-[500px] animate-slide-in`}
    >
      <div className="flex items-center gap-3">
        {styles.icon}
        <p className={`font-semibold text-sm ${type === 'info' ? 'text-white' : 'text-black'}`}>
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`${type === 'info' ? 'text-white hover:text-gray-200' : 'text-black hover:text-gray-700'} transition-colors flex-shrink-0`}
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  );
}
