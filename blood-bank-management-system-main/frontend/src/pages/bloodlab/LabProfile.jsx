import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Loader2,
  Save,
  Edit3,
  X,
  MapPin,
  Mail,
  FlaskConical,
  Phone,
  User,
  Shield,
  Heart,
  Droplet,
  Clock,
  Tag,
  Building,
} from "lucide-react";

// NOTE: Using localStorage and hardcoded URL for API connection as per previous context.
const API_BASE_URL = "http://localhost:5001/api";

// Define a default structured object for operating hours
const defaultOperatingHours = {
  weekdays: "",
  weekends: "",
  notes: "",
};

const LabProfile = () => {
  const [Faculty, setFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emergencyContact: "",
    FacultyCategory: "", // NEW FIELD ADDED
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    contactPerson: "",
    operatingHours: defaultOperatingHours, // CHANGED TO OBJECT
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Utility function to safely initialize operating hours as an object
  const initializeOperatingHours = (hoursData) => {
    if (hoursData && typeof hoursData === 'object' && !Array.isArray(hoursData)) {
      return {
        weekdays: hoursData.weekdays || "",
        weekends: hoursData.weekends || "",
        notes: hoursData.notes || "",
      };
    }
    // If it was previously a string (like the old state suggested) or null, initialize to defaults
    return defaultOperatingHours;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const path = name.includes('.') ? name : name;

    switch (path) {
      case "phone":
      case "emergencyContact":
        if (value && !/^\d{10}$/.test(value)) {
          newErrors[path] = "Must be a valid 10-digit phone number";
        } else {
          delete newErrors[path];
        }
        break;
      case "address.pincode":
        if (value && !/^\d{6}$/.test(value)) {
          newErrors["address.pincode"] = "Must be a valid 6-digit pincode";
        } else {
          delete newErrors["address.pincode"];
        }
        break;
      // No validation for operatingHours fields for now, as they are free text
      default:
        // Basic check for empty required fields if needed, but keeping it flexible
        break;
    }

    // Clean up error if field becomes empty (except for specific validated fields)
    if (
      value === "" &&
      !["phone", "emergencyContact", "address.pincode"].includes(path)
    ) {
      delete newErrors[path];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      const { data } = await axios.get(`${API_BASE_URL}/Faculty/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setFaculty(data.Faculty);
        setFormData({
          name: data.Faculty.name || "",
          phone: data.Faculty.phone || "",
          emergencyContact: data.Faculty.emergencyContact || "",
          FacultyCategory: data.Faculty.FacultyCategory || "", // NEW
          address: {
            street: data.Faculty.address?.street || "",
            city: data.Faculty.address?.city || "",
            state: data.Faculty.address?.state || "",
            pincode: data.Faculty.address?.pincode || "",
          },
          contactPerson: data.Faculty.contactPerson || "",
          operatingHours: initializeOperatingHours(data.Faculty.operatingHours), // Mapped to object
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Fetch Profile Error:", error);
      let message;

      if (
        error.message.includes("No authorization token found") ||
        error.response?.status === 401
      ) {
        message = "Session expired or unauthorized. Please log in.";
        localStorage.removeItem("token");
        setFaculty(null);
        toast.error(message);
        return;
      }

      message = error.response?.data?.message || "Failed to load profile";
      toast.error(message);
      setFaculty(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          address: { ...prev.address, [key]: value },
        };
        validateField(name, value);
        return updatedData;
      });
    } else if (name.startsWith("operatingHours.")) {
      const key = name.split(".")[1];
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          operatingHours: { ...prev.operatingHours, [key]: value },
        };
        // No specific validation for hours, just update state
        return updatedData;
      });
    } else {
      setFormData((prev) => {
        const updatedData = { ...prev, [name]: value };
        validateField(name, value);
        return updatedData;
      });
    }
  };

  const handleSave = async () => {
    const currentErrors = Object.values(errors).filter((e) => e).length > 0;

    if (currentErrors) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    
    // Prepare data payload, excluding internal state keys if necessary, 
    // but current formData structure aligns with the necessary updates.
    const payload = formData;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required to save changes.");
        setSaving(false);
        return;
      }

      const { data } = await axios.put(
        `${API_BASE_URL}/Faculty/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        setFaculty(data.Faculty);
        setIsEditing(false);
        setErrors({});
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Update Profile Error:", error);
      let message = error.response?.data?.message || "Update failed";
      toast.error(message);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (Faculty) {
      setFormData({
        name: Faculty.name || "",
        phone: Faculty.phone || "",
        emergencyContact: Faculty.emergencyContact || "",
        FacultyCategory: Faculty.FacultyCategory || "", // NEW
        address: {
          street: Faculty.address?.street || "",
          city: Faculty.address?.city || "",
          state: Faculty.address?.state || "",
          pincode: Faculty.address?.pincode || "",
        },
        contactPerson: Faculty.contactPerson || "",
        operatingHours: initializeOperatingHours(Faculty.operatingHours), // Mapped to object
      });
    }
  };

  if (loading && !Faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Droplet className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Laboratory Profile
          </h2>
          <p className="text-gray-500">Preparing your Faculty information...</p>
        </div>
      </div>
    );
  }

  if (!Faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg border border-red-100 p-8">
          <Droplet className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Faculty Profile Error
          </h3>
          <p className="text-gray-600 mb-4">
            Could not load profile. Please ensure you are authenticated.
          </p>
          <button
            onClick={fetchProfile}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Droplet className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {Faculty.name || "Laboratory Profile"}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <FlaskConical size={16} className="text-red-500" />
                  {Faculty.FacultyCategory?.toUpperCase() || "BLOOD LAB"} • 
                  <span className="font-mono text-sm">{Faculty.registrationNumber}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || hasErrors}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit3 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Verification Details and Quick Contact */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Verification Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    Faculty.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : Faculty.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {Faculty.status?.charAt(0).toUpperCase() + Faculty.status?.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-medium text-gray-800">{Faculty.FacultyCategory || "N/A"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Registration</span>
                  <span className="text-sm font-mono text-gray-800">{Faculty.registrationNumber}</span>
                </div>
                
                {Faculty.approvedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved On</span>
                    <span className="text-sm text-gray-800">
                      {new Date(Faculty.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Quick Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">{Faculty.email}</span>
                </div>
                {Faculty.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">{Faculty.phone}</span>
                  </div>
                )}
                {Faculty.emergencyContact && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">Emergency: {Faculty.emergencyContact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Editable Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              
              {/* General Faculty Details (Name, Category) */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-red-600" />
                  Faculty Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      placeholder="e.g., Central Diagnostics Lab"
                    />
                  </div>

                  {/* Category Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty Category
                    </label>
                    <input
                      type="text"
                      name="FacultyCategory"
                      value={formData.FacultyCategory}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      placeholder="e.g., Blood Lab, Radiology Center"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      } ${errors.phone ? "border-red-500" : ""}`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-2">{errors.phone}</p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      } ${errors.emergencyContact ? "border-red-500" : ""}`}
                      placeholder="Emergency contact number"
                    />
                    {errors.emergencyContact && (
                      <p className="text-red-500 text-xs mt-2">{errors.emergencyContact}</p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      placeholder="Primary contact person name"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Faculty Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["street", "city", "state", "pincode"].map((field) => (
                    <div key={field} className={field === "street" ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {field === "pincode" ? "PIN Code" : field}
                      </label>
                      <input
                        type={field === "pincode" ? "number" : "text"}
                        name={`address.${field}`}
                        value={formData.address?.[field] || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          isEditing
                            ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "bg-gray-50 border-gray-200"
                        } ${
                          field === "pincode" && errors["address.pincode"] ? "border-red-500" : ""
                        }`}
                        placeholder={`Enter ${field === "pincode" ? "PIN code" : field}`}
                      />
                      {field === "pincode" && errors["address.pincode"] && (
                        <p className="text-red-500 text-xs mt-2">{errors["address.pincode"]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Hours (Structured Object) */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  Operating Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Weekdays */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekdays (e.g., Mon - Fri)
                    </label>
                    <input
                      type="text"
                      name="operatingHours.weekdays"
                      value={formData.operatingHours.weekdays}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      placeholder="e.g., 9:00 AM to 5:00 PM"
                    />
                  </div>

                  {/* Weekends */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekends (e.g., Sat - Sun)
                    </label>
                    <input
                      type="text"
                      name="operatingHours.weekends"
                      value={formData.operatingHours.weekends}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      placeholder="e.g., 9:00 AM to 1:00 PM or Closed"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (e.g., Emergency services)
                    </label>
                    <textarea
                      name="operatingHours.notes"
                      value={formData.operatingHours.notes}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditing
                          ? "border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      placeholder="e.g., Emergency services available 24/7."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabProfile;