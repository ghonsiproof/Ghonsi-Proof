import React from 'react';
import { logger } from '../utils/logger';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error
    logger.error('Error caught by ErrorBoundary', {
      message: error.toString(),
      stack: errorInfo.componentStack,
    });

    // Optionally send to error tracking service
    // if (process.env.REACT_APP_SENTRY_DSN) {
    //   Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = this.state.error?.toString() || 'An unexpected error occurred';

      return (
        <div className="min-h-screen bg-[#0B0F1B] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
              <p className="text-gray-400 text-sm">We encountered an unexpected error. Please try again.</p>
            </div>

            {/* Error Details (Development Only) */}
            {isDevelopment && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 font-mono text-xs mb-2">{errorMessage}</p>
                {this.state.errorInfo && (
                  <details className="text-gray-400 text-xs">
                    <summary className="cursor-pointer hover:text-gray-300 mb-2">Stack trace</summary>
                    <pre className="overflow-auto max-h-48 text-gray-500">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Error Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-[#C19A4A] text-black px-4 py-3 rounded-lg hover:bg-[#a8853b] transition-colors font-medium"
              >
                <RefreshCw size={18} />
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Go to Home
              </button>
            </div>

            {/* Retry Counter */}
            {this.state.retryCount > 0 && (
              <p className="text-center text-xs text-gray-500 mt-4">
                Retry attempts: {this.state.retryCount}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
