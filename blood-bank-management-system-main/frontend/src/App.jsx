import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import Login from "./pages/auth/Login";
import LandingPage from "./pages/Landing";
import DonorRegister from "./pages/auth/DonorRegister";
import DonorDashboard from "./pages/donor/DonorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import DonorProfile from "./pages/donor/DonorProfile";
import FacultyRegister from "./pages/auth/FacultyRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFaculties from "./pages/admin/AdminFaculties";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import BloodCamps from "./pages/bloodlab/BloodCamps";
import BloodlabDashboard from "./pages/bloodlab/BloodlabDashboard";
import BloodStock from "./pages/bloodlab/BloodStock";
import LabProfile from "./pages/bloodlab/LabProfile";
import GetAllFaculties from "./pages/admin/GetAllFaculties";
import GetAllDonors from "./pages/admin/GetAllDonors";
import DonorCampsList from "./pages/donor/DonorCampsList";
import LabManageRequests from "./pages/bloodlab/LabManageRequests";
import HospitalRequestBlood from "./pages/hospital/HospitalRequestBlood";
import HospitalRequestHistory from "./pages/hospital/HospitalRequestHistory";
import HospitalBloodStock from "./pages/hospital/HospitalBloodStock";
import BloodLabDonor from "./pages/bloodlab/BloodLabDonor";
import DonorDirectory from "./pages/hospital/DonorDirectory";
import About from "./components/about/About";
import Contact from "./components/contact/Contact";
import DonorDonationHistory from "./pages/donor/DonorDonationHistory";
import Register from "./pages/auth/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { WebSocketManager, getAuthToken } from "./utils/auth";

function App() {
  const [wsManager, setWsManager] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Initialize WebSocket connection
      const ws = new WebSocketManager(
        "ws://localhost:5001/ws",
        token,
        (data) => {
          // Handle incoming messages
          console.log("WebSocket message:", data);
          setNotifications((prev) => [data, ...prev].slice(0, 50));

          // Show toast for important notifications
          if (data.type === "alert" || data.type === "emergency") {
            toast[data.severity || "info"](data.message, {
              duration: 5001,
              position: "top-right",
            });
          }
        },
        (error) => {
          console.error("WebSocket error:", error);
        },
      );

      ws.connect();
      setWsManager(ws);

      return () => {
        ws.disconnect();
      };
    }
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register/donor" element={<DonorRegister />} />
        <Route path="/register/faculty" element={<FacultyRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Donor Routes */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute requiredRole="donor">
              <DashboardLayout userRole="donor" />
            </ProtectedRoute>
          }
        >
          <Route index element={<DonorDashboard />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="camps" element={<DonorCampsList />} />
          <Route path="history" element={<DonorDonationHistory />} />
        </Route>

        {/* Hospital Routes */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute requiredRole="hospital">
              <DashboardLayout userRole="hospital" />
            </ProtectedRoute>
          }
        >
          <Route index element={<HospitalDashboard />} />
          <Route
            path="blood-request-create"
            element={<HospitalRequestBlood />}
          />
          <Route
            path="blood-request-history"
            element={<HospitalRequestHistory />}
          />
          <Route path="inventory" element={<HospitalBloodStock />} />
          <Route path="donors" element={<DonorDirectory />} />
        </Route>

        {/* Blood Lab Routes */}
        <Route
          path="/lab"
          element={
            <ProtectedRoute requiredRole="blood-lab">
              <DashboardLayout userRole="blood-lab" />
            </ProtectedRoute>
          }
        >
          <Route index element={<BloodlabDashboard />} />
          <Route path="inventory" element={<BloodStock />} />
          <Route path="camps" element={<BloodCamps />} />
          <Route path="profile" element={<LabProfile />} />
          <Route path="requests" element={<LabManageRequests />} />
          <Route path="donor" element={<BloodLabDonor />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout userRole="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="verification" element={<AdminFaculties />} />
          <Route path="donors" element={<GetAllDonors />} />
          <Route path="facilities" element={<GetAllFaculties />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
