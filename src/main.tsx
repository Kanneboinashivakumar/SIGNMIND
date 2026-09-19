import React, { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('SIGNMIND Runtime Error:', error, info);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      }
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#181c24] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[#00f5a0] flex items-center justify-center mx-auto text-2xl font-bold">
              🤟
            </div>
            <h1 className="text-xl font-bold text-white">SIGNMIND Session Recovery</h1>
            <p className="text-sm text-gray-400">
              The application encountered an unexpected runtime state. Click below to refresh and resume practice.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-[#00f5a0] hover:bg-[#00e293] text-[#0f131c] font-bold text-sm rounded-xl transition-all shadow-lg"
              >
                Reload
              </button>
              <button
                onClick={this.handleReset}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm rounded-xl border border-white/10 transition-all"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)

// Register PWA Service Worker with auto-update
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
  });
}

