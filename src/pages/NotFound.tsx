import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Stethoscope } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-6">
      <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg border border-blue-200">
        <div className="text-red-500 mb-4 text-5xl flex justify-center">
          <Stethoscope />
        </div>
        <h1 className="text-5xl font-extrabold text-cyan-800 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-2">
          Oops! This medical page seems to have flatlined.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          The route <span className="font-mono text-red-600">{location.pathname}</span> does not exist.
        </p>
        <a
          href="/"
          className="inline-block bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          🏥 Return to Health Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
