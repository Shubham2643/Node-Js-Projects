import { useState, useEffect } from "react";
import {
  Users,
  Hospital,
  Droplet,
  Calendar,
  Heart,
  TrendingUp,
  Activity,
  Shield,
  Beaker,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Eye,
  MoreVertical,
  FileText,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [selectedChart, setSelectedChart] = useState("line");
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchStats = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5001/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch stats");

      const data = await res.json();

      // Mock additional data for demo
      const mockData = {
        ...data,
        recentActivity: [
          {
            id: 1,
            type: "donor",
            action: "New donor registered",
            user: "John Doe",
            time: "5 min ago",
            status: "success",
          },
          {
            id: 2,
            type: "facility",
            action: "Hospital approved",
            user: "City Hospital",
            time: "1 hour ago",
            status: "success",
          },
          {
            id: 3,
            type: "donation",
            action: "Blood donation recorded",
            user: "Sarah Smith",
            time: "2 hours ago",
            status: "info",
          },
          {
            id: 4,
            type: "alert",
            action: "Low stock alert",
            user: "O- Blood",
            time: "3 hours ago",
            status: "warning",
          },
          {
            id: 5,
            type: "camp",
            action: "Camp created",
            user: "Community Center",
            time: "5 hours ago",
            status: "success",
          },
        ],
        alerts: [
          {
            id: 1,
            type: "critical",
            message: "O- blood critically low",
            severity: "high",
            location: "Central Lab",
          },
          {
            id: 2,
            type: "warning",
            message: "5 pending approvals",
            severity: "medium",
            location: "Admin",
          },
          {
            id: 3,
            type: "info",
            message: "Camp tomorrow at City Hall",
            severity: "low",
            location: "Events",
          },
        ],
        chartData: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          donations: [65, 78, 90, 85, 92, 88, 95],
          requests: [45, 52, 48, 60, 55, 42, 38],
        },
        bloodTypeDistribution: {
          labels: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
          data: [28, 7, 20, 5, 35, 8, 4, 3],
        },
        topDonors: [
          {
            name: "Rahul Sharma",
            donations: 24,
            bloodGroup: "O+",
            lastDonation: "2024-01-15",
          },
          {
            name: "Priya Patel",
            donations: 18,
            bloodGroup: "A+",
            lastDonation: "2024-01-14",
          },
          {
            name: "Amit Kumar",
            donations: 15,
            bloodGroup: "B+",
            lastDonation: "2024-01-12",
          },
        ],
      };

      setStats(mockData);
      setRecentActivities(mockData.recentActivity);
      setAlerts(mockData.alerts);

      if (showToast) {
        toast.success("Dashboard updated successfully!");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Chart configurations
  const lineChartData = {
    labels: stats?.chartData?.labels || [],
    datasets: [
      {
        label: "Donations",
        data: stats?.chartData?.donations || [],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: "Requests",
        data: stats?.chartData?.requests || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: stats?.bloodTypeDistribution?.labels || [],
    datasets: [
      {
        label: "Inventory %",
        data: stats?.bloodTypeDistribution?.data || [],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(245, 158, 11, 0.6)",
        ],
        borderColor: "white",
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: stats?.bloodTypeDistribution?.labels || [],
    datasets: [
      {
        data: stats?.bloodTypeDistribution?.data || [],
        backgroundColor: [
          "#ef4444",
          "#f87171",
          "#3b82f6",
          "#60a5fa",
          "#10b981",
          "#34d399",
          "#f59e0b",
          "#fbbf24",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            Loading Admin Dashboard
          </h2>
          <p className="text-gray-500 mt-2">Analyzing system data...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    icon,
    label,
    value,
    subtitle,
    trend,
    color = "red",
    onClick,
  }) => {
    const colorClasses = {
      red: {
        border: "border-l-red-400",
        bg: "bg-red-100",
        text: "text-red-600",
        hover: "hover:bg-red-50",
      },
      blue: {
        border: "border-l-blue-400",
        bg: "bg-blue-100",
        text: "text-blue-600",
        hover: "hover:bg-blue-50",
      },
      green: {
        border: "border-l-green-400",
        bg: "bg-green-100",
        text: "text-green-600",
        hover: "hover:bg-green-50",
      },
      purple: {
        border: "border-l-purple-400",
        bg: "bg-purple-100",
        text: "text-purple-600",
        hover: "hover:bg-purple-50",
      },
      amber: {
        border: "border-l-amber-400",
        bg: "bg-amber-100",
        text: "text-amber-600",
        hover: "hover:bg-amber-50",
      },
    };

    const colors = colorClasses[color] || colorClasses.red;

    return (
      <div
        className={`bg-white rounded-2xl shadow-lg border-l-4 ${colors.border} p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${colors.hover}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-800">
              {value?.toLocaleString()}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-600 font-medium">{trend}%</span>
            <span className="text-gray-500">from last month</span>
          </div>
        )}
      </div>
    );
  };

  const AlertCard = ({ alert }) => {
    const severityColors = {
      high: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: AlertTriangle,
      },
      medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: Clock,
      },
      low: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: Bell,
      },
    };

    const colors = severityColors[alert.severity] || severityColors.medium;
    const Icon = colors.icon;

    return (
      <div
        className={`${colors.bg} border ${colors.border} rounded-xl p-4 flex items-start gap-3`}
      >
        <Icon className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`font-medium ${colors.text}`}>{alert.message}</p>
          <p className="text-sm text-gray-600 mt-1">{alert.location}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {alert.severity}
        </span>
      </div>
    );
  };

  const ActivityItem = ({ activity }) => {
    const statusColors = {
      success: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      info: "text-blue-600 bg-blue-100",
    };

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div
          className={`w-2 h-2 rounded-full ${statusColors[activity.status]?.split(" ")[1] || "bg-gray-300"}`}
        ></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-800">{activity.action}</p>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
          <p className="text-sm text-gray-600">by {activity.user}</p>
        </div>
        <Eye className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer transition-colors" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive overview of the blood bank management system
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Donors"
            value={stats?.totalDonors || 1250}
            subtitle="Active donors"
            trend="+12"
            color="red"
          />
          <StatCard
            icon={<Hospital className="w-6 h-6" />}
            label="Facilities"
            value={stats?.totalFacilities || 48}
            subtitle="Hospitals & Labs"
            trend="+5"
            color="blue"
          />
          <StatCard
            icon={<Droplet className="w-6 h-6" />}
            label="Total Donations"
            value={stats?.totalDonations || 3250}
            subtitle="Blood units"
            trend="+8"
            color="green"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Upcoming Camps"
            value={stats?.upcomingCamps || 12}
            subtitle="This month"
            trend="+3"
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Activity Overview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedChart("line")}
                  className={`p-2 rounded-lg ${selectedChart === "line" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                >
                  <Line className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedChart("bar")}
                  className={`p-2 rounded-lg ${selectedChart === "bar" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
                >
                  <Bar className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-64">
              {selectedChart === "line" ? (
                <Line data={lineChartData} options={chartOptions} />
              ) : (
                <Bar data={lineChartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Blood Type Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-600" />
              Blood Type Distribution
            </h2>
            <div className="h-64">
              <Doughnut
                data={doughnutData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { position: "right" },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity and Top Donors */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Recent Activity
              </h2>
              <button className="text-sm text-red-600 hover:text-red-700">
                View all
              </button>
            </div>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Top Donors */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-600" />
                Top Donors
              </h2>
              <button className="text-sm text-red-600 hover:text-red-700">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {stats?.topDonors?.map((donor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                      {donor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{donor.name}</p>
                      <p className="text-xs text-gray-500">
                        Last: {donor.lastDonation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{donor.donations}</p>
                    <p className="text-xs text-gray-500">donations</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <QuickActionCard
            icon={<Users className="w-5 h-5" />}
            title="Manage Donors"
            description="View and manage donor database"
            href="/admin/donors"
            color="red"
          />
          <QuickActionCard
            icon={<Hospital className="w-5 h-5" />}
            title="Manage Facilities"
            description="Approve and manage facilities"
            href="/admin/facilities"
            color="blue"
          />
          <QuickActionCard
            icon={<Droplet className="w-5 h-5" />}
            title="Donation Reports"
            description="View donation analytics"
            href="/admin/reports"
            color="green"
          />
          <QuickActionCard
            icon={<Calendar className="w-5 h-5" />}
            title="Blood Camps"
            description="Monitor camp activities"
            href="/admin/camps"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, href, color = "red" }) => {
  const colorClasses = {
    red: "hover:bg-red-50 border-red-200 text-red-600",
    blue: "hover:bg-blue-50 border-blue-200 text-blue-600",
    green: "hover:bg-green-50 border-green-200 text-green-600",
    purple: "hover:bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div
      onClick={() => (window.location.href = href)}
      className={`bg-white rounded-2xl shadow-lg border p-6 cursor-pointer transition-all hover:shadow-xl group ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-current bg-opacity-10`}>{icon}</div>
        <h3 className="font-semibold text-gray-800 group-hover:text-current transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-end text-sm group-hover:text-current">
        View <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export default AdminDashboard;
