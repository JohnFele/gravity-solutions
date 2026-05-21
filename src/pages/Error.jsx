import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  console.error("Route error:", error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h1>
        <p className="text-sm mb-4">
          {error?.statusText || error?.message || "Unknown error occurred."}
        </p>
        <pre className="text-xs text-red-700 bg-red-200 p-2 rounded overflow-auto max-w-md mx-auto">
          {error?.stack}
        </pre>
      </div>
    </div>
  );
}
