import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
            <h2 style={{ marginBottom: '8px', color: 'var(--team-color, #E8002D)', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              3D Model Unavailable
            </h2>
            <p style={{ marginBottom: '20px', opacity: 0.7, fontSize: '0.75rem', maxWidth: '260px' }}>
              The model file could not be loaded. Make sure all <code>.glb</code> files are present in <code>/public/models/</code>.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '10px 24px',
                background: 'var(--team-color, #E8002D)',
                color: '#fff',
                border: '2px solid var(--team-color, #E8002D)',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                letterSpacing: '2px',
                fontSize: '0.625rem'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
