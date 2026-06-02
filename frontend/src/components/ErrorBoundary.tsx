import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#FFF0F0', color: '#900', fontFamily: 'sans-serif', minHeight: '100vh' }}>
          <h2>Oops, có lỗi xảy ra!</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Xem chi tiết lỗi</summary>
            <p style={{ fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
            <pre style={{ fontSize: '12px' }}>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '15px', padding: '8px 16px', background: '#900', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
