import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <h1 className="title" style={{ fontSize: '2rem' }}>Something broke.</h1>
          <p style={{ color: 'var(--text-soft)', marginTop: '8px' }}>
            The app ran into trouble. Try refreshing.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
