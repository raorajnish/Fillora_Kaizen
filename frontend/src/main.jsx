import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            color: "white",
            background: "#1e293b",
            minHeight: "500px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>Error Loading Extension</h2>
          <p style={{ marginBottom: "8px" }}>
            {this.state.error?.message || "Unknown error"}
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>
            Check the console for more details.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the app
console.log("Initializing React app...");
console.log("Root element check...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = `
    <div style="padding: 20px; color: white; background: #1e293b; min-height: 500px; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <h2>Error: Root element not found</h2>
        <p>Please check the HTML structure.</p>
      </div>
    </div>
  `;
} else {
  console.log("Root element found, creating React root...");
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log("React root created, rendering app...");
    root.render(
      <ErrorBoundary>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ErrorBoundary>
    );
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering React app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #1e293b; min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h2 style="margin-bottom: 16px;">Error Loading Extension</h2>
        <p style="margin-bottom: 8px;">${error.message}</p>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Check the console for more details.</p>
        <button 
          onClick="window.location.reload()" 
          style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;"
        >
          Reload
        </button>
      </div>
    `;
  }
}
