import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  MessageSquare,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Map,
} from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import { toast } from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [officeHours, setOfficeHours] = useState({
    monday: "9:00 AM - 8:00 PM",
    tuesday: "9:00 AM - 8:00 PM",
    wednesday: "9:00 AM - 8:00 PM",
    thursday: "9:00 AM - 8:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      setSuccess(true);
      toast.success(
        "Message sent successfully! We'll respond within 24 hours.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5001);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How quickly do you respond to inquiries?",
      answer:
        "We aim to respond to all inquiries within 24 hours during business days. For emergency blood requests, please use our 24/7 helpline.",
    },
    {
      question: "Can I schedule a blood donation camp?",
      answer:
        "Yes! Organizations can request to host blood donation camps. Fill out the form with 'Camp Organization' as the subject, and our team will contact you.",
    },
    {
      question: "What information should I provide for emergency requests?",
      answer:
        "For emergencies, please call our helpline directly. Include patient details, blood type needed, location, and urgency level.",
    },
    {
      question: "Do you provide support in multiple languages?",
      answer:
        "Yes, we have support staff available in English, Hindi, Spanish, and Mandarin. Please specify your preferred language in the message.",
    },
  ];

  const contactCards = [
    {
      icon: Phone,
      title: "Emergency Helpline",
      primary: "+1 (555) 123-4357",
      secondary: "24/7 Available",
      color: "red",
      action: "Call Now",
      link: "tel:+15551234357",
    },
    {
      icon: Mail,
      title: "Email Support",
      primary: "help@bloodconnect.org",
      secondary: "support@bloodconnect.org",
      color: "blue",
      action: "Send Email",
      link: "mailto:help@bloodconnect.org",
    },
    {
      icon: MapPin,
      title: "Regional Offices",
      primary: "Mumbai | Delhi | Bangalore",
      secondary: "Chennai | Kolkata | Hyderabad",
      color: "green",
      action: "View Locations",
      link: "#locations",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: "bg-red-50",
        hover: "hover:bg-red-100",
        text: "text-red-600",
        border: "border-red-200",
      },
      blue: {
        bg: "bg-blue-50",
        hover: "hover:bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        hover: "hover:bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
      },
    };
    return colors[color] || colors.red;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 mt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <div className="relative text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            Get in <span className="text-red-200">Touch</span>
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up">
            We're here to support you 24/7. Reach out for any help, queries, or
            blood-related emergencies.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6">
          {contactCards.map((card, index) => {
            const Icon = card.icon;
            const colors = getColorClasses(card.color);

            return (
              <div
                key={index}
                className={`${colors.bg} rounded-2xl p-8 text-center border ${colors.border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full ${colors.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className={`${colors.text} font-bold text-lg mb-1`}>
                  {card.primary}
                </p>
                <p className="text-gray-600 text-sm mb-4">{card.secondary}</p>
                <a
                  href={card.link}
                  className={`inline-flex items-center gap-2 ${colors.text} hover:underline font-medium`}
                >
                  {card.action} →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 px-6">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Send className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Send a Message
              </h2>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Message Sent Successfully!
                  </p>
                  <p className="text-sm text-green-600">
                    We'll respond within 24 hours.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="10-digit phone number"
                    maxLength="10"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Inquiry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="emergency">Emergency Blood Request</option>
                  <option value="donation">Donation Related</option>
                  <option value="camp">Camp Organization</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Brief subject line"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Write your message here..."
                  />
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/500 characters minimum 10
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                By submitting this form, you agree to our
                <a
                  href="/privacy"
                  className="text-red-600 hover:underline ml-1"
                >
                  Privacy Policy
                </a>
              </p>
            </form>
          </div>

          {/* Right Side - Info & FAQ */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Quick Response
              </h3>
              <p className="text-gray-600 mb-4">
                We typically respond within 24 hours. For emergencies, call our
                helpline.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <Phone className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Emergency Helpline
                    </p>
                    <p className="text-red-600 font-bold text-lg">
                      +1 (555) 123-4357
                    </p>
                    <p className="text-xs text-gray-500">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Support</p>
                    <p className="text-blue-600">help@bloodconnect.org</p>
                    <p className="text-xs text-gray-500">Response within 24h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Office Hours
              </h3>
              <div className="space-y-2">
                {Object.entries(officeHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{day}</span>
                    <span
                      className={`font-medium ${hours === "Closed" ? "text-red-600" : "text-gray-800"}`}
                    >
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                Frequently Asked
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setActiveFaq(activeFaq === index ? null : index)
                      }
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">
                        {faq.question}
                      </span>
                      <span className="text-red-600 text-xl">
                        {activeFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {activeFaq === index && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Connect With Us
              </h3>
              <div className="flex gap-4 justify-center">
                {[
                  {
                    icon: Instagram,
                    color: "hover:bg-pink-600",
                    label: "Instagram",
                  },
                  {
                    icon: Facebook,
                    color: "hover:bg-blue-600",
                    label: "Facebook",
                  },
                  {
                    icon: Linkedin,
                    color: "hover:bg-blue-700",
                    label: "LinkedIn",
                  },
                  { icon: Globe, color: "hover:bg-red-600", label: "Website" },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href="#"
                      className={`p-3 bg-gray-100 rounded-xl ${social.color} hover:text-white transition-all hover:scale-110`}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="mb-5">
        <div className="relative h-96">
          <iframe
            title="Office Locations"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1698776543210!5m2!1sen!2sin"
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />

          {/* Map Overlay */}
          <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 border border-red-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-gray-800">Headquarters</h4>
                <p className="text-sm text-gray-600">
                  123 Healthcare Ave, Medical District
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
