import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      // Check if authenticated
      if (!isAuthenticated()) {
        console.log("Not authenticated, redirecting to login");
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
        setIsChecking(false);
        return;
      }

      // Check role if required
      if (requiredRole) {
        const userRole = getUserRole();
        if (userRole !== requiredRole) {
          console.log(
            `Role mismatch: required ${requiredRole}, got ${userRole}`,
          );

          // Redirect to appropriate dashboard based on role
          const roleRoutes = {
            donor: "/donor",
            hospital: "/hospital",
            "blood-lab": "/lab",
            admin: "/admin",
          };

          const redirectPath = roleRoutes[userRole] || "/";
          navigate(redirectPath, { replace: true });
          setIsChecking(false);
          return;
        }
      }

      // Additional token validation could be done here
      setIsValid(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate, location.pathname, requiredRole]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-red-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            Verifying Authentication
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we secure your session...
          </p>
        </div>
      </div>
    );
  }

  return isValid ? children : null;
};

export default ProtectedRoute;
