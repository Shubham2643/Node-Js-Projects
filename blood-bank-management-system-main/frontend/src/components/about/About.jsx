import React, { useState, useEffect } from "react";
import {
  Heart,
  Users,
  Shield,
  Award,
  Target,
  Droplet,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  Play,
  X,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import Footer from "../Footer";
import Header from "../Header";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [stats, setStats] = useState({
    livesSaved: 50010,
    donations: 100000,
    camps: 500,
    safetyRate: 99.8,
  });

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStats();
          }
        });
      },
      { threshold: 0.5 },
    );

    const statsSection = document.getElementById("stats-section");
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    const targets = {
      livesSaved: 50010,
      donations: 100000,
      camps: 500,
      safetyRate: 99.8,
    };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setStats(targets);
        clearInterval(timer);
        return;
      }

      setStats({
        livesSaved: Math.floor((targets.livesSaved * currentStep) / steps),
        donations: Math.floor((targets.donations * currentStep) / steps),
        camps: Math.floor((targets.camps * currentStep) / steps),
        safetyRate: (targets.safetyRate * currentStep) / steps,
      });
    }, interval);

    return () => clearInterval(timer);
  };

  const statsData = [
    {
      icon: Users,
      number: stats.livesSaved.toLocaleString() + "+",
      label: "Lives Saved",
    },
    {
      icon: Droplet,
      number: stats.donations.toLocaleString() + "+",
      label: "Donations",
    },
    {
      icon: MapPin,
      number: stats.camps.toLocaleString() + "+",
      label: "Camps Organized",
    },
    {
      icon: Shield,
      number: stats.safetyRate.toFixed(1) + "%",
      label: "Safety Rate",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description:
        "We believe in the power of human kindness and the impact one person can make in saving lives.",
      color: "red",
    },
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Every donation follows strict medical protocols ensuring donor safety and blood quality.",
      color: "blue",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building strong communities where people help each other in times of need.",
      color: "green",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Committed to maintaining the highest standards in blood collection and distribution.",
      color: "purple",
    },
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Medical Director",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
      bio: "15+ years in hematology and transfusion medicine",
      expertise: ["Hematology", "Transfusion Medicine", "Research"],
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Head",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      bio: "Expert in healthcare logistics and camp management",
      expertise: ["Logistics", "Supply Chain", "Emergency Response"],
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Priya Sharma",
      role: "Community Manager",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      bio: "Dedicated to building donor relationships and awareness",
      expertise: ["Community Outreach", "Donor Relations", "Awareness"],
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "David Kim",
      role: "Technology Lead",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      bio: "Ensuring seamless digital experience for donors and recipients",
      expertise: ["Full Stack", "Security", "UX Design"],
      social: { linkedin: "#", twitter: "#" },
    },
  ];

  const testimonials = [
    {
      name: "Rahul Mehta",
      role: "Regular Donor",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      quote:
        "I've been donating blood for 5 years now. BloodConnect made it so easy to find camps and track my impact. Knowing I've helped save over 15 lives keeps me motivated.",
      rating: 5,
      donations: 15,
    },
    {
      name: "Dr. Anjali Desai",
      role: "Hospital Administrator",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
      quote:
        "The real-time inventory and emergency request system has been a game-changer for our hospital. We can now get blood units within hours instead of days.",
      rating: 5,
      hospital: "City General Hospital",
    },
    {
      name: "Kavita Singh",
      role: "Recipient",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      quote:
        "When I needed blood for my surgery, BloodConnect connected me with donors within hours. I'm forever grateful to the donors and this platform.",
      rating: 5,
      experience: "Life-saving support",
    },
  ];

  const milestones = [
    { year: 2018, event: "BloodConnect Founded", icon: Heart },
    { year: 2019, event: "First 10,000 Donations", icon: Droplet },
    { year: 2020, event: "Launched Emergency Response", icon: Clock },
    { year: 2021, event: "100+ Partner Hospitals", icon: Users },
    { year: 2022, event: "50,000 Lives Saved", icon: Award },
    { year: 2023, event: "Nationwide Network", icon: Globe },
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        hover: "hover:bg-red-200",
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        hover: "hover:bg-blue-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        hover: "hover:bg-green-200",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        hover: "hover:bg-purple-200",
      },
    };
    return colors[color] || colors.red;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Hero Section with Video Modal */}
      <section className="relative py-20 mt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Saving Lives, One Drop at a Time
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in-up">
            We are a dedicated platform connecting blood donors with those in
            need, making blood donation accessible, safe, and impactful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link
              to="/register/donor"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Join Our Mission
            </Link>
            <button
              onClick={() => setShowVideo(true)}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Our Story
            </button>
          </div>
        </div>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-black rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="About BloodConnect"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats Section with Animation */}
      <section id="stats-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 animate-count">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision with Interactive Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="group">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To create a world where no one dies waiting for blood. We bridge
                the gap between voluntary blood donors and patients, ensuring
                timely access to safe blood when it's needed most.
              </p>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Clock className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-gray-700">
                    24/7 Emergency Blood Availability
                  </span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Shield className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-gray-700">
                    100% Safe & Verified Donors
                  </span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <MapPin className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-gray-700">
                    Nationwide Network Coverage
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Vision
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We envision a future where blood transfusion becomes a
                hassle-free process for every patient, supported by a robust
                network of committed donors and advanced technology.
              </p>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                <Award className="w-12 h-12 text-red-600 mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Quality Promise
                </h4>
                <p className="text-gray-700">
                  Every unit of blood goes through 12 rigorous quality checks to
                  ensure maximum safety for both donors and recipients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section with Interactive Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and define who we are
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const colors = getColorClasses(value.color);
              return (
                <div key={index} className="group perspective">
                  <div className="relative preserve-3d group-hover:rotate-y-180 transition-all duration-500 cursor-pointer">
                    {/* Front */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 backface-hidden">
                      <div
                        className={`${colors.bg} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                      >
                        <value.icon className={`w-10 h-10 ${colors.text}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-white">
                      <Heart className="w-12 h-12 mb-4" />
                      <p className="text-center text-sm">
                        Join us in making a difference through{" "}
                        {value.title.toLowerCase()}
                      </p>
                      <Link
                        to="/register/donor"
                        className="mt-4 text-sm underline"
                      >
                        Get involved →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key milestones that shaped our mission
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-red-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={index}
                    className={`relative flex items-center ${isEven ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-1/2 ${isEven ? "pr-12 text-right" : "pl-12"}`}
                    >
                      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                        <div
                          className={`flex items-center gap-3 mb-3 ${isEven ? "flex-row-reverse" : ""}`}
                        >
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Icon className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="text-lg font-bold text-red-600">
                            {milestone.year}
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium">
                          {milestone.event}
                        </p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-white"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section with Social Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to making a difference in
              healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Social Links Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <a
                        href={member.social.linkedin}
                        className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href={member.social.twitter}
                        className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.637-12.247c.01-.383.003-.762-.02-1.14A9.93 9.93 0 0024 4.59z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-red-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What People Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from our community of donors, recipients, and
              partners
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {testimonial.name}
                          </h3>
                          <p className="text-red-600 text-sm">
                            {testimonial.role}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic mb-4">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {testimonial.donations && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            {testimonial.donations} donations
                          </span>
                        )}
                        {testimonial.hospital && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {testimonial.hospital}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={() =>
                setActiveTestimonial((prev) => Math.max(0, prev - 1))
              }
              disabled={activeTestimonial === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() =>
                setActiveTestimonial((prev) =>
                  Math.min(testimonials.length - 1, prev + 1),
                )
              }
              disabled={activeTestimonial === testimonials.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? "w-6 bg-red-600"
                      : "bg-gray-300 hover:bg-red-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Who can donate blood?",
                a: "Most healthy individuals aged 18-65 weighing at least 50kg can donate. However, there are some medical conditions and medications that may affect eligibility. We recommend checking our eligibility criteria or consulting with our medical team.",
              },
              {
                q: "How often can I donate?",
                a: "For whole blood donation, the recommended interval is every 56 days (about 8 weeks). Platelet donors can donate more frequently, every 7 days up to 24 times a year.",
              },
              {
                q: "Is blood donation safe?",
                a: "Absolutely! All equipment used is sterile and single-use. Our trained medical staff follow strict protocols to ensure donor safety. You'll receive a mini-physical before donation to check your vitals.",
              },
              {
                q: "How long does donation take?",
                a: "The entire process takes about an hour. The actual blood donation takes only 8-10 minutes, with the remaining time for registration, health screening, and post-donation refreshments.",
              },
            ].map((faq, index) => {
              const [isOpen, setIsOpen] = useState(false);
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.q}</span>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0 L100 100 M100 0 L0 100"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Heart className="w-16 h-16 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of heroes who are saving lives through blood
            donation. Your single donation can save up to 3 lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/donor"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Become a Donor
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Organize a Camp
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Donors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Safe & Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section with Map Integration */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Emergency Helpline
              </h3>
              <p className="text-red-600 font-bold text-xl">
                +1 (555) 123-4357
              </p>
              <p className="text-gray-600">24/7 Available</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email Us
              </h3>
              <p className="text-red-600 font-medium">help@bloodconnect.org</p>
              <p className="text-red-600 font-medium">
                support@bloodconnect.org
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Headquarters
              </h3>
              <p className="text-gray-600">123 Healthcare Ave</p>
              <p className="text-gray-600">Medical District, City 12345</p>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              title="Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1698776543210!5m2!1sen!2sin"
              className="w-full h-64"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
