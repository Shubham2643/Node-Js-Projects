import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  MoreVertical,
  Star,
  Award,
  TrendingUp,
  Globe,
  Clock3,
} from "lucide-react";

const FacultyApproval = () => {
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    category: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    hospitals: 0,
    labs: 0,
  });

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5001/api/admin";

  // Fetch pending facilities
  const fetchPendingFacilities = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_URL}/facilities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch facilities: ${res.status}`);

      const data = await res.json();
      const facilitiesList = data.facilities || [];

      setFacilities(facilitiesList);

      // Calculate stats
      const newStats = {
        total: facilitiesList.length,
        pending: facilitiesList.filter((f) => f.status === "pending").length,
        approved: facilitiesList.filter((f) => f.status === "approved").length,
        rejected: facilitiesList.filter((f) => f.status === "rejected").length,
        hospitals: facilitiesList.filter((f) => f.facilityType === "hospital")
          .length,
        labs: facilitiesList.filter((f) => f.facilityType === "blood-lab")
          .length,
      };
      setStats(newStats);

      if (showToast) {
        toast.success(`Found ${newStats.pending} pending facilities`);
      }
    } catch (error) {
      console.error("Fetch facilities error:", error);
      toast.error("Failed to load facilities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingFacilities();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...facilities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.registrationNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          f.phone?.includes(searchTerm),
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((f) => f.facilityType === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((f) => f.status === filters.status);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (f) => f.facilityCategory === filters.category,
      );
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchTerm, filters]);

  const handleApprove = async (facilityId) => {
    if (!facilityId) {
      toast.error("Invalid facility ID");
      return;
    }

    setActionLoading(facilityId);

    try {
      const res = await fetch(`${API_URL}/facility/approve/${facilityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Facility approved successfully!");
        await fetchPendingFacilities();
        setSelectedFaculty(null);
      } else {
        throw new Error(data.message || "Approval failed");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.message || "Error approving facility");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (facilityId) => {
    if (!facilityId) {
      toast.error("Invalid facility ID");
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(facilityId);

    try {
      const res = await fetch(`${API_URL}/facility/reject/${facilityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Facility rejected successfully!");
        await fetchPendingFacilities();
        setSelectedFaculty(null);
        setRejectionReason("");
      } else {
        throw new Error(data.message || "Rejection failed");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(error.message || "Error rejecting facility");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDocument = (documentUrl, filename = "document") => {
    if (!documentUrl) {
      toast.error("Document not available");
      return;
    }
    window.open(documentUrl, "_blank");
  };

  const handleDownloadDocument = (documentUrl, filename = "document") => {
    if (!documentUrl) {
      toast.error("Document not available");
      return;
    }

    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending Review",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getFacilityTypeBadge = (type) => {
    const isHospital = type === "hospital";
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
          isHospital
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : "bg-purple-100 text-purple-800 border-purple-200"
        }`}
      >
        <Building size={12} />
        {isHospital ? "Hospital" : "Blood Lab"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">
            Loading Facility Approvals
          </h2>
          <p className="text-gray-500 mt-2">
            Fetching registration requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                Facility Verification
              </h1>
              <p className="text-gray-600 mt-2">
                Review and verify hospital and blood lab registration requests
              </p>
            </div>

            <button
              onClick={() => fetchPendingFacilities(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-gray-400">
              <div className="text-2xl font-bold text-gray-800">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-yellow-400">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-green-400">
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-red-400">
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-blue-400">
              <div className="text-2xl font-bold text-blue-600">
                {stats.hospitals}
              </div>
              <div className="text-sm text-gray-600">Hospitals</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-purple-400">
              <div className="text-2xl font-bold text-purple-600">
                {stats.labs}
              </div>
              <div className="text-sm text-gray-600">Blood Labs</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email, registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:w-48 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={18} />
                Filters
                {showFilters ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Types</option>
                  <option value="hospital">Hospitals</option>
                  <option value="blood-lab">Blood Labs</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Trust">Trust</option>
                  <option value="Charity">Charity</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredFacilities.length}</span>{" "}
            of <span className="font-semibold">{facilities.length}</span>{" "}
            facilities
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Facilities List */}
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4">
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-red-100">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Facilities Found
                </h3>
                <p className="text-gray-600">
                  No facilities match your current filters
                </p>
              </div>
            ) : (
              filteredFacilities.map((facility) => (
                <div
                  key={facility._id}
                  className={`bg-white rounded-2xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    selectedFaculty?._id === facility._id
                      ? "border-red-300 bg-red-50"
                      : "border-red-100 hover:border-red-300"
                  }`}
                  onClick={() => setSelectedFaculty(facility)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {facility.name}
                        </h3>
                        {getFacilityTypeBadge(facility.facilityType)}
                      </div>
                      <p className="text-gray-600 text-sm flex items-center gap-1 mb-1">
                        <Mail size={14} />
                        {facility.email}
                      </p>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <Phone size={14} />
                        {facility.phone || "No phone provided"}
                      </p>
                    </div>
                    {getStatusBadge(facility.status)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <MapPin size={14} />
                      {facility.address?.street || "Address not provided"},{" "}
                      {facility.address?.city}, {facility.address?.state} -{" "}
                      {facility.address?.pincode}
                    </p>
                    <p className="flex items-center gap-1">
                      <FileText size={14} />
                      Reg: {facility.registrationNumber || "Not provided"}
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar size={14} />
                      Registered:{" "}
                      {new Date(facility.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {facility.documents?.registrationProof && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(
                            facility.documents.registrationProof.url,
                            facility.documents.registrationProof.filename,
                          );
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDocument(
                            facility.documents.registrationProof.url,
                            facility.documents.registrationProof.filename,
                          );
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Facility Details & Actions */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            {selectedFaculty ? (
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-red-600" />
                  Review Facility
                </h2>

                {/* Facility Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facility Name
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {selectedFaculty.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      {getFacilityTypeBadge(selectedFaculty.facilityType)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedFaculty.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedFaculty.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      <p className="text-gray-900">
                        {selectedFaculty.emergencyContact || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">
                      {selectedFaculty.address?.street || "Street not provided"}
                      , {selectedFaculty.address?.city}
                      <br />
                      {selectedFaculty.address?.state} -{" "}
                      {selectedFaculty.address?.pincode}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <p className="text-gray-900 font-mono">
                      {selectedFaculty.registrationNumber || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedFaculty.facilityCategory || "Not specified"}
                    </p>
                  </div>

                  {selectedFaculty.operatingHours && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operating Hours
                      </label>
                      <p className="text-gray-900">
                        {selectedFaculty.operatingHours.open} -{" "}
                        {selectedFaculty.operatingHours.close}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedFaculty.operatingHours.workingDays?.join(
                          ", ",
                        ) || "Not specified"}
                        {selectedFaculty.is24x7 && " • 24/7 Service"}
                      </p>
                    </div>
                  )}

                  {selectedFaculty.emergencyServices && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-700 font-semibold flex items-center gap-2">
                        <Shield size={16} />
                        Emergency Services Available
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => handleApprove(selectedFaculty._id)}
                    disabled={actionLoading === selectedFaculty._id}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                  >
                    {actionLoading === selectedFaculty._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {actionLoading === selectedFaculty._id
                      ? "Approving..."
                      : "Approve Facility"}
                  </button>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rejection Reason (required)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide specific reason for rejection..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none transition-colors"
                      rows="3"
                    />
                    <button
                      onClick={() => handleReject(selectedFaculty._id)}
                      disabled={
                        actionLoading === selectedFaculty._id ||
                        !rejectionReason.trim()
                      }
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                    >
                      {actionLoading === selectedFaculty._id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle size={20} />
                      )}
                      {actionLoading === selectedFaculty._id
                        ? "Rejecting..."
                        : "Reject Facility"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-12 text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Select a Facility
                </h3>
                <p className="text-gray-500">
                  Click on any facility from the list to review details and take
                  action
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyApproval;
