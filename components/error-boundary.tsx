"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "40px 24px", maxWidth: 520, margin: "80px auto", textAlign: "center" }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {this.state.error.message || "An unexpected error occurred. Please refresh and try again."}
          </p>
          <button
            className="stitch-primary"
            onClick={() => this.setState({ error: null })}
            type="button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
