import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Settings,
  Shield,
  Droplet,
} from "lucide-react";
import { getUser, logout, isAuthenticated } from "../utils/auth";

const WEBSITE_NAME = import.meta.env.VITE_WEBSITE_NAME || "BloodConnect";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Fetch notifications (mock for now - replace with real API)
  useEffect(() => {
    if (authenticated) {
      // Mock notifications - replace with real API call
      const mockNotifications = [
        {
          id: 1,
          message: "New blood donation camp near you",
          read: false,
          time: "5 min ago",
        },
        {
          id: 2,
          message: "Your donation saved 3 lives!",
          read: false,
          time: "1 hour ago",
        },
        {
          id: 3,
          message: "Upcoming blood drive in your area",
          read: true,
          time: "2 days ago",
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    }
  }, [authenticated]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "donor":
        return "/donor";
      case "hospital":
        return "/hospital";
      case "blood-lab":
        return "/lab";
      case "admin":
        return "/admin";
      default:
        return "/login";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-red-100"
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                {WEBSITE_NAME}
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Blood Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? "text-red-700 bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {authenticated ? (
              <>
                {/* Notifications */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">
                          Notifications
                        </h3>
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
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notif.read ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markNotificationAsRead(notif.id)}
                            >
                              <p className="text-sm text-gray-800">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notif.time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role?.replace("-", " ")}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                      <Link
                        to={getDashboardPath()}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Droplet className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        to={`/${user?.role}/profile`}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to={`/${user?.role}/settings`}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register/donor"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-red-50 text-gray-600 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    location.pathname === link.path
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {authenticated ? (
                <>
                  <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-lg"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={`/${user?.role}/profile`}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-lg"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-3 space-y-2 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register/donor"
                    className="block w-full text-center px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Register as Donor
                  </Link>
                  <Link
                    to="/register/facility"
                    className="block w-full text-center px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Register as Facility
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
