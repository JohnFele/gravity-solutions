import { Component } from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AlertProvider } from "./context/AlertProvider";
import { QuotationProvider } from "./context/QuotationContext";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800">
          <h1 className="text-xl font-bold">Something went wrong.</h1>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <AuthProvider>
          <QuotationProvider>
            <Outlet />
          </QuotationProvider>
        </AuthProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}

export default App;
