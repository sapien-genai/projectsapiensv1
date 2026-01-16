import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-500 border-2 border-black p-3">
                <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h1 className="font-extrabold text-2xl uppercase tracking-tight mb-2">
                  Something Went Wrong
                </h1>
                <p className="text-base leading-relaxed text-gray-700">
                  We encountered an unexpected error. Don't worry, your data is safe.
                  Try refreshing the page or returning home.
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 border-2 border-black">
                <p className="font-bold text-sm uppercase tracking-wide mb-2">Error Details:</p>
                <pre className="text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
              >
                <Home className="w-4 h-4" strokeWidth={2.5} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
