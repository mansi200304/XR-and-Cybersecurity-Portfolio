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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ marginBottom: '10px', color: 'var(--team-color, #E8002D)' }}>
              3D Scene Error
            </h2>
            <p style={{ marginBottom: '20px', opacity: 0.8 }}>
              Unable to load the 3D model. Please try selecting a different team.
            </p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '10px 20px',
                background: 'var(--team-color, #E8002D)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                letterSpacing: '1px'
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
