import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  diagramName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DiagramErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Diagram Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          border: '2px dashed #f44336',
          borderRadius: '8px',
          backgroundColor: '#ffebee',
          textAlign: 'center',
          color: '#d32f2f'
        }}>
          <h3>⚠️ Diagram Error</h3>
          <p>
            The {this.props.diagramName || 'diagram'} could not be loaded.
          </p>
          <details style={{ marginTop: '10px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <pre style={{ 
              background: '#fff', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '0.8rem',
              overflow: 'auto',
              marginTop: '5px'
            }}>
              {this.state.error?.message}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}