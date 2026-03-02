import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Droplet,
  Heart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Scale,
  Weight,
  Ruler,
  Award,
  Shield,
  Globe,
} from "lucide-react";

const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATES = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangalore", "Hubli", "Belgaum"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  Delhi: ["New Delhi", "Rohini", "Dwarka", "Saket", "Connaught Place"],
  "Tamil Nadu": [
    "Chennai",
    "Madurai",
    "Coimbatore",
    "Tiruchirappalli",
    "Salem",
  ],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
};

const validators = {
  fullName: (value) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Name should only contain letters";
    return "";
  },
  email: (value) => {
    if (!value.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(value))
      return "Please enter a valid email address";
    return "";
  },
  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value))
      return "Password must contain at least one number";
    return "";
  },
  phone: (value) => {
    if (!value) return "Phone number is required";
    if (!/^[6-9][0-9]{9}$/.test(value))
      return "Phone number must be 10 digits and start with 6-9";
    return "";
  },
  emergencyContact: (value) => {
    if (!value) return "Emergency contact is required";
    if (!/^[6-9][0-9]{9}$/.test(value))
      return "Emergency contact must be 10 digits and start with 6-9";
    return "";
  },
  dob: (value) => {
    if (!value) return "Date of birth is required";
    const age = calculateAge(value);
    if (age < 18) return "You must be at least 18 years old to donate";
    if (age > 65) return "Donors must be under 65 years old";
    return "";
  },
  gender: (value) => (!value ? "Gender is required" : ""),
  bloodGroup: (value) => (!value ? "Blood group is required" : ""),
  weight: (value) => {
    if (!value) return "Weight is required";
    if (parseFloat(value) < 45) return "Minimum weight is 45kg";
    if (parseFloat(value) > 200) return "Weight seems too high";
    return "";
  },
  height: (value) => {
    if (!value) return "Height is required";
    if (parseFloat(value) < 100) return "Height must be at least 100cm";
    if (parseFloat(value) > 250) return "Height seems too high";
    return "";
  },
  "address.street": (value) => {
    if (!value.trim()) return "Street address is required";
    if (value.trim().length < 5) return "Please enter a valid address";
    return "";
  },
  "address.city": (value) => (!value.trim() ? "City is required" : ""),
  "address.state": (value) => (!value.trim() ? "State is required" : ""),
  "address.pincode": (value) => {
    if (!value) return "Pincode is required";
    if (!/^[1-9][0-9]{5}$/.test(value)) return "Pincode must be 6 digits and cannot start with 0";
    return "";
  },
};

const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const DonorRegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    emergencyContact: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    weight: "",
    height: "",
    hasDiseases: false,
    diseaseDetails: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength++;
      if (/[A-Z]/.test(formData.password)) strength++;
      if (/[a-z]/.test(formData.password)) strength++;
      if (/[0-9]/.test(formData.password)) strength++;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (name.startsWith("address.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          address: { ...prev.address, [field]: value },
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });

    setTouched((prev) => ({ ...prev, [name]: true }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName) => {
    let value;

    if (fieldName.includes(".")) {
      const [parent, child] = fieldName.split(".");
      value = formData.address[child];
    } else {
      value = formData[fieldName];
    }

    const error = validators[fieldName]?.(value);

    setErrors((prev) => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
    });
  };

  const validateStep = () => {
    const newErrors = {};

    const stepValidations = {
      1: ["fullName", "email", "password", "phone", "emergencyContact"],
      2: ["dob", "gender", "bloodGroup", "weight", "height"],
      3: ["address.street", "address.city", "address.state", "address.pincode"],
    };

    stepValidations[step].forEach((field) => {
      let value;

      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        value = formData.address[child];
      } else {
        value = formData[field];
      }

      const error = validators[field]?.(value);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    const newTouched = { ...touched };
    stepValidations[step].forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      toast.error("Please fix the errors before proceeding");
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    const age = calculateAge(formData.dob);

    const submissionPayload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact,
      age: age,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      street: formData.address.street,
      city: formData.address.city,
      state: formData.address.state,
      pincode: formData.address.pincode,
      role: "donor",
    };

    const API_URL = "http://localhost:5001/api/auth/register";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please login.");

        navigate("/login", {
          state: {
            email: formData.email,
            message:
              "Registration successful! Please login with your credentials.",
          },
        });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const progressPercentage = (step / 3) * 100;

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Become a Blood Donor</h1>
                <p className="text-red-100 mt-1">
                  Join our life-saving mission in 3 simple steps
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Step {step} of 3</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="w-full bg-red-300 rounded-full h-2.5">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={step >= 1 ? "font-semibold" : "opacity-75"}>
                  Personal Info
                </span>
                <span className={step >= 2 ? "font-semibold" : "opacity-75"}>
                  Health Details
                </span>
                <span className={step >= 3 ? "font-semibold" : "opacity-75"}>
                  Address
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("fullName")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {shouldShowError("fullName") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("email")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {shouldShowError("email") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("password")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded-full transition-colors ${
                                i < passwordStrength
                                  ? getPasswordStrengthColor()
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {passwordStrength <= 2 && "Weak"}
                          {passwordStrength === 3 && "Fair"}
                          {passwordStrength === 4 && "Good"}
                          {passwordStrength === 5 && "Strong"}
                        </p>
                      </div>
                    )}

                    {shouldShowError("password") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("phone")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="10-digit phone number"
                        maxLength="10"
                      />
                    </div>
                    {shouldShowError("phone") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block font-medium mb-2">
                      Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("emergencyContact")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Emergency contact number"
                        maxLength="10"
                      />
                    </div>
                    {shouldShowError("emergencyContact") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.emergencyContact}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Password Requirements
                  </h4>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${formData.password?.length >= 8 ? "text-green-500" : "text-gray-300"}`}
                      />
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`}
                      />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`}
                      />
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-300"}`}
                      />
                      One number
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Health Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date of Birth */}
                  <div>
                    <label className="block font-medium mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("dob")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {shouldShowError("dob") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.dob}
                      </p>
                    )}
                    {formData.dob && !errors.dob && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Age: {calculateAge(formData.dob)} years
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block font-medium mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                        shouldShowError("gender")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                    {shouldShowError("gender") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block font-medium mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("bloodGroup")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                    {shouldShowError("bloodGroup") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.bloodGroup}
                      </p>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block font-medium mb-2">
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("weight")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Minimum 45kg"
                        min="45"
                        max="200"
                        step="0.1"
                      />
                    </div>
                    {shouldShowError("weight") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.weight}
                      </p>
                    )}
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block font-medium mb-2">
                      Height (cm) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("height")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Height in cm"
                        min="100"
                        max="250"
                        step="0.1"
                      />
                    </div>
                    {shouldShowError("height") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.height}
                      </p>
                    )}
                  </div>

                  {/* Medical Conditions */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasDiseases"
                        checked={formData.hasDiseases}
                        onChange={handleChange}
                        className="w-5 h-5 accent-red-500"
                      />
                      <span className="font-medium">
                        I have existing medical conditions
                      </span>
                    </label>
                  </div>

                  {formData.hasDiseases && (
                    <div className="md:col-span-2">
                      <label className="block font-medium mb-2">
                        Medical Conditions Details
                      </label>
                      <textarea
                        name="diseaseDetails"
                        value={formData.diseaseDetails}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Please describe any medical conditions, allergies, or medications..."
                      />
                    </div>
                  )}
                </div>

                {/* Eligibility Info */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Donor Eligibility Criteria
                  </h4>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-green-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Age between 18-65 years
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Weight minimum 45kg
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Good general health
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      No recent infections
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Address Information */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("address.street")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter street address"
                      />
                    </div>
                    {shouldShowError("address.street") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors["address.street"]}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block font-medium mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="address.state"
                      value={formData.address.state}
                      onChange={(e) => {
                        handleChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: "" },
                        }));
                      }}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                        shouldShowError("address.state")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select State</option>
                      {Object.keys(STATES).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {shouldShowError("address.state") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors["address.state"]}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block font-medium mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                        shouldShowError("address.city")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={!formData.address.state}
                    >
                      <option value="">Select City</option>
                      {formData.address.state &&
                        STATES[formData.address.state]?.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                    {shouldShowError("address.city") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors["address.city"]}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                          shouldShowError("address.pincode")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="6-digit pincode"
                        maxLength="6"
                      />
                    </div>
                    {shouldShowError("address.pincode") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors["address.pincode"]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Map Preview */}
                {formData.address.city && formData.address.state && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Location Preview
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formData.address.street}, {formData.address.city},{" "}
                      {formData.address.state} - {formData.address.pincode}
                    </p>
                    <div className="mt-2 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">
                        Map view will be available here
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              className={`flex ${step > 1 ? "justify-between" : "justify-end"} pt-8 mt-6 border-t`}
            >
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition font-medium"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Secure & Private</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Verified Platform</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Save Lives</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorRegisterForm;
