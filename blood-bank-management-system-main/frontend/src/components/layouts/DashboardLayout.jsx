import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Droplet,
  Activity,
  History,
  Building,
  Shield,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Loader2,
  Search,
  Home,
  Users,
  Mail,
  Phone,
  Clock,
  MapPin,
  Heart,
  Award,
  TrendingUp,
  CheckCircle,
  FileText,
} from "lucide-react";
import { apiRequest, getUser, logout } from "../../utils/auth";
import { toast } from "react-hot-toast";

const DashboardLayout = ({ userRole = "donor" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Blood Bank Theme Colors
  const theme = {
    primary: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
  };

  // Enhanced Sidebar menus with icons and badges
  const menuConfig = {
    donor: {
      title: "Blood Donor Portal",
      subtitle: "Be a Hero, Save Lives",
      shortTitle: "Donor",
      icon: User,
      color: "red",
      stats: { label: "Next Donation", value: "Eligible" },
      items: [
        {
          path: "/donor",
          label: "Dashboard",
          icon: BarChart3,
          badge: null,
          description: "Overview of your donations",
        },
        {
          path: "/donor/profile",
          label: "My Profile",
          icon: User,
          badge: null,
          description: "Manage your information",
        },
        {
          path: "/donor/history",
          label: "Donation History",
          icon: History,
          badge: "New",
          description: "View past donations",
        },
        {
          path: "/donor/camps",
          label: "Blood Camps",
          icon: Calendar,
          badge: null,
          description: "Find nearby camps",
        },
        {
          path: "/donor/certificates",
          label: "Certificates",
          icon: Award,
          badge: null,
          description: "Download certificates",
        },
      ],
    },
    hospital: {
      title: "Hospital Management",
      subtitle: "Blood Request & Inventory",
      shortTitle: "Hospital",
      icon: Building,
      color: "blue",
      stats: { label: "Blood Units", value: "Critical" },
      items: [
        {
          path: "/hospital",
          label: "Dashboard",
          icon: BarChart3,
          badge: null,
          description: "Hospital overview",
        },
        {
          path: "/hospital/blood-request-create",
          label: "Blood Requests",
          icon: FileText,
          badge: "Urgent",
          description: "Request blood units",
        },
        {
          path: "/hospital/inventory",
          label: "Inventory",
          icon: Droplet,
          badge: null,
          description: "Track blood stock",
        },
        {
          path: "/hospital/donors",
          label: "Donor Directory",
          icon: Users,
          badge: null,
          description: "Find donors",
        },
        {
          path: "/hospital/request-history",
          label: "Request History",
          icon: History,
          badge: null,
          description: "View past requests",
        },
      ],
    },
    "blood-lab": {
      title: "Blood Lab Center",
      subtitle: "Testing & Quality Control",
      shortTitle: "Lab",
      icon: Activity,
      color: "green",
      stats: { label: "Samples", value: "25" },
      items: [
        {
          path: "/lab",
          label: "Dashboard",
          icon: BarChart3,
          badge: null,
          description: "Lab overview",
        },
        {
          path: "/lab/inventory",
          label: "Inventory",
          icon: Droplet,
          badge: null,
          description: "Manage blood stock",
        },
        {
          path: "/lab/donor",
          label: "Donors",
          icon: Users,
          badge: null,
          description: "Manage donors",
        },
        {
          path: "/lab/camps",
          label: "Camps",
          icon: Calendar,
          badge: null,
          description: "Organize camps",
        },
        {
          path: "/lab/requests",
          label: "Requests",
          icon: FileText,
          badge: null,
          description: "Blood requests",
        },
        {
          path: "/lab/profile",
          label: "Profile",
          icon: User,
          badge: null,
          description: "Lab information",
        },
      ],
    },
    admin: {
      title: "Admin Panel",
      subtitle: "System Administration",
      shortTitle: "Admin",
      icon: Shield,
      color: "purple",
      stats: { label: "Users", value: "1,234" },
      items: [
        {
          path: "/admin",
          label: "Overview",
          icon: BarChart3,
          badge: null,
          description: "System overview",
        },
        {
          path: "/admin/verification",
          label: "Verification",
          icon: Shield,
          badge: "5",
          description: "Verify facilities",
        },
        {
          path: "/admin/facilities",
          label: "Facilities",
          icon: Building,
          badge: null,
          description: "Manage facilities",
        },
        {
          path: "/admin/donors",
          label: "Donors",
          icon: Users,
          badge: null,
          description: "Manage donors",
        },
        {
          path: "/admin/reports",
          label: "Reports",
          icon: TrendingUp,
          badge: null,
          description: "System reports",
        },
      ],
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      const user = getUser();
      if (!user) {
        logout();
        navigate("/login");
        return;
      }

      try {
        // Fetch fresh user data
        const response = await apiRequest(
          "http://localhost:5001/api/auth/profile",
          {},
          navigate,
        );

        const data = await response.json();
        const profileData = data.data || data;
        const user = profileData.user || profileData;

        if (
          !user?.role ||
          user.role.toLowerCase() !== userRole.toLowerCase()
        ) {
          toast.error("Unauthorized access");
          logout();
          navigate("/login");
          return;
        }

        setUserData(user);

        // Mock notifications - replace with real API
        setNotifications([
          {
            id: 1,
            message: "New blood donation camp near you",
            read: false,
            time: "5 min ago",
            type: "info",
          },
          {
            id: 2,
            message: "Your donation request has been approved",
            read: false,
            time: "1 hour ago",
            type: "success",
          },
          {
            id: 3,
            message: "Low stock alert for O+ blood type",
            read: false,
            time: "2 hours ago",
            type: "warning",
          },
        ]);
        setUnreadCount(2);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userRole, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const normalizedRole = userRole?.toLowerCase().replace("-", "_");
  const config = menuConfig[normalizedRole] || {
    title: "Dashboard",
    subtitle: "Welcome",
    shortTitle: "App",
    icon: BarChart3,
    color: "red",
    items: [],
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  const getBadgeColor = (badge) => {
    if (badge === "New") return "bg-green-500 text-white";
    if (badge === "Urgent") return "bg-red-500 text-white";
    if (badge === "5") return "bg-purple-500 text-white";
    if (badge === "Critical") return "bg-orange-500 text-white";
    return "bg-blue-500 text-white";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            Loading Dashboard
          </h2>
          <p className="text-gray-500 mt-2">
            Preparing your personalized experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <header
        className={`flex justify-between items-center bg-white/95 backdrop-blur-md shadow-sm border-b border-red-100 px-4 sm:px-6 py-3 sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-red-100 transition-all"
            style={{ color: theme.primary[600] }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 shadow-sm">
              <config.icon size={20} className="text-red-600" />
            </div>
            <div className="hidden sm:block">
              <h1
                className="text-lg sm:text-xl font-bold"
                style={{ color: theme.primary[700] }}
              >
                {config.title}
              </h1>
              <p
                className="text-xs sm:text-sm"
                style={{ color: theme.secondary[500] }}
              >
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Search size={20} className="text-red-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Bell size={20} className="text-red-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const Icon = getNotificationIcon(notif.type);
                      return (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notif.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          <div className="flex gap-3">
                            <Icon
                              className={`w-5 h-5 flex-shrink-0 ${
                                notif.type === "success"
                                  ? "text-green-500"
                                  : notif.type === "warning"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }`}
                            />
                            <div>
                              <p className="text-sm text-gray-800">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${theme.primary[500]}, ${theme.primary[600]})`,
              }}
              onClick={() => navigate(`/${userRole}/profile`)}
            >
              {userData?.name?.charAt(0)?.toUpperCase() ||
                userData?.fullName?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
            <div className="hidden lg:block">
              <span
                className="font-medium block text-sm"
                style={{ color: theme.primary[700] }}
              >
                {userData?.name || userData?.fullName || "User"}
              </span>
              <span
                className="text-xs capitalize flex items-center gap-1"
                style={{ color: theme.secondary[500] }}
              >
                <Shield className="w-3 h-3" />
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-100 transition-all hidden sm:block"
            style={{ color: theme.primary[600] }}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 ${
            sidebarCollapsed ? "w-16" : "w-64"
          } bg-white shadow-xl border-r border-red-100 transition-all duration-300 flex flex-col transform lg:transform-none`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-red-100">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <config.icon size={20} className="text-red-600" />
                </div>
                <div>
                  <h2
                    className="font-bold text-sm"
                    style={{ color: theme.primary[700] }}
                  >
                    {config.shortTitle}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: theme.secondary[500] }}
                  >
                    Portal
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              style={{ color: theme.primary[600] }}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          </div>

          {/* User Quick Info */}
          {!sidebarCollapsed && userData && (
            <div className="p-4 border-b border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                  {userData.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {config.stats?.label}:{" "}
                    <span className="font-semibold text-red-600">
                      {config.stats?.value}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {config.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <div key={item.path} className="relative group">
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "shadow-md transform scale-[1.02] text-white"
                          : "hover:shadow-md hover:transform hover:scale-[1.02] hover:bg-red-50 text-gray-700 hover:text-red-700"
                      }`}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${theme.primary[500]}, ${theme.primary[600]})`
                          : "transparent",
                      }}
                      title={sidebarCollapsed ? item.label : ""}
                    >
                      <Icon
                        size={20}
                        className="flex-shrink-0"
                        style={{
                          color: isActive ? "white" : theme.primary[600],
                        }}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left whitespace-nowrap text-sm">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(item.badge)}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.badge && (
                        <span
                          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getBadgeColor(item.badge).replace("text-white", "")}`}
                        />
                      )}
                    </button>

                    {/* Tooltip for collapsed sidebar */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-75">
                          {item.description}
                        </div>
                        {item.badge && (
                          <div
                            className={`mt-1 text-xs ${getBadgeColor(item.badge)} inline-block px-2 py-0.5 rounded`}
                          >
                            {item.badge}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer Section */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-red-100">
              <div className="p-3 rounded-lg text-center bg-gradient-to-br from-red-50 to-red-100">
                <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">
                  Blood Bank MS
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Save Lives, Donate Blood
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 transition-all duration-300 min-h-[calc(100vh-80px)]">
          <div className="h-full overflow-auto p-4 sm:p-6">
            {/* Page Header with Breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <span>{config.title}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-red-600 font-medium">
                  {config.items.find((item) => item.path === location.pathname)
                    ?.label || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Render Child Routes */}
            <Outlet context={{ userData, theme, config }} />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Footer Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 shadow-lg z-40">
        <div className="flex justify-around items-center p-2">
          {config.items.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all flex-1 mx-1 ${
                  isActive ? "bg-red-50 text-red-600" : "text-gray-600"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 truncate max-w-full">
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
