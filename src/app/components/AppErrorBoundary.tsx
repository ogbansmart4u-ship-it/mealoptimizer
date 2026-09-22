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
        <div className="min-h-screen bg-canvas-organic dark:bg-[#0F1412] flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-white dark:bg-[#171E1B] rounded-3xl shadow-xl p-8 max-w-sm w-full border border-stone-200/80 dark:border-stone-800">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
              The app hit an unexpected problem. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl py-3.5 font-semibold active:scale-[0.98] transition-transform cursor-pointer shadow-xs"
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
