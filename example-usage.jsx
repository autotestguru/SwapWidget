// Simple React App Example using SwapBridge Widget

import React from 'react';
import SwapWidget from './SwapBridgeWidget-ReactComponent';

const App = () => {
  // Handle successful widget load
  const handleWidgetLoad = () => {
    console.log('🎉 SwapBridge Widget loaded successfully!');
    // You can add analytics tracking here
  };

  // Handle widget loading errors
  const handleWidgetError = (error) => {
    console.error('❌ Widget failed to load:', error);
    // Check if React is available
    console.log('React available:', typeof window.React);
    console.log('ReactDOM available:', typeof window.ReactDOM);
    // You can send error reports to your monitoring service
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px' 
      }}>
        <h1>🚀 My DeFi Platform</h1>
        <p>Trade tokens across multiple chains seamlessly</p>
      </header>

      <main>
        <section style={{ marginBottom: '40px' }}>
          <h2>💱 Token Swap & Bridge</h2>
          <SwapWidget 
            theme="light"
            onLoad={handleWidgetLoad}
            onError={handleWidgetError}
            retryAttempts={3}
            retryDelay={2000}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
        </section>

        <section style={{ 
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9em'
        }}>
          <p>✨ Powered by SwapBridge Widget</p>
        </section>
      </main>
    </div>
  );
};

export default App;