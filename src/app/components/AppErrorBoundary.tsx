import { Component, ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Top-level safety net. Catches render errors anywhere in the tree (including the
 * context providers that wrap the router) and shows a friendly reload screen
 * instead of a white page or a raw crash.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-6">
              The app hit an unexpected problem. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3.5 font-semibold active:scale-[0.98] transition-transform"
            >
              Reload the app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
