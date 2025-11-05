import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    // A simple way to recover is to reload the page.
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="w-full flex justify-center items-center p-8 my-10">
            <div className="bg-zinc-800 border border-red-500/30 rounded-lg p-6 text-center max-w-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-zinc-200">Er is iets misgegaan</h2>
                <p className="text-zinc-400 mt-2 mb-6">
                    Dit onderdeel kon niet correct geladen worden. Dit kan een tijdelijk probleem zijn.
                </p>
                <button
                    onClick={this.handleRefresh}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full text-sm transition-all transform hover:scale-105 duration-300 ease-out"
                >
                    Probeer Opnieuw
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
