import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  ArrowUp,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();

  // Handle scroll to top button visibility
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    } catch (error) {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Our Mission", path: "/mission" },
    { name: "Success Stories", path: "/stories" },
    { name: "News & Updates", path: "/news" },
    { name: "Blog", path: "/blog" },
  ];

  const donorResources = [
    { name: "Become a Donor", path: "/register/donor" },
    { name: "Eligibility Criteria", path: "/eligibility" },
    { name: "Donation Process", path: "/process" },
    { name: "Donor Benefits", path: "/benefits" },
    { name: "Find Camps", path: "/camps" },
  ];

  const hospitalResources = [
    { name: "Partner with Us", path: "/register/facility" },
    { name: "Blood Request", path: "/request-blood" },
    { name: "Inventory Management", path: "/inventory" },
    { name: "Emergency Protocol", path: "/emergency" },
    { name: "FAQs", path: "/faqs" },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#", color: "hover:bg-blue-600" },
    { icon: Twitter, name: "Twitter", url: "#", color: "hover:bg-sky-500" },
    {
      icon: Instagram,
      name: "Instagram",
      url: "#",
      color: "hover:bg-pink-600",
    },
    { icon: Linkedin, name: "LinkedIn", url: "#", color: "hover:bg-blue-700" },
  ];

  const contactInfo = [
    {
      icon: Phone,
      text: "Emergency: 1-800-BLOOD-NOW",
      subtext: "24/7 Helpline",
    },
    { icon: Mail, text: "help@bloodconnect.org", subtext: "General Inquiries" },
    { icon: MapPin, text: "Nationwide Network", subtext: "500+ Locations" },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-gray-900 text-white relative">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 p-3 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter for blood donation drives and health
              tips
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={subscribing}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">BloodConnect</h2>
                <p className="text-red-200 text-sm">Life Saver Network</p>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting compassionate donors with those in need through
              advanced blood bank management technology. Together, we save lives
              and build healthier communities.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 mb-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 ${social.color} transition-all duration-300 hover:scale-110`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-300">Verified by Health Ministry</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Donors */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              For Donors
            </h3>
            <ul className="space-y-3">
              {donorResources.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Hospitals */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              For Hospitals
            </h3>
            <ul className="space-y-3">
              {hospitalResources.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-300 group"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-red-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{item.text}</span>
                    <p className="text-xs text-gray-500">{item.subtext}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} BloodConnect. All rights reserved.
              <span className="mx-2 text-red-500">❤️</span>
              Saving lives through technology.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-white transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Donate Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/register/donor"
          className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:from-red-700 hover:to-red-800 group"
        >
          <Heart className="w-5 h-5 group-hover:animate-pulse" />
          <span>Donate Now</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
