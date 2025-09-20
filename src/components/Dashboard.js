import { Link } from "react-router-dom";
// import { useState } from "react";

const Dashboard = () => {
  
  // Feature cards data
  const features = [
    {
      title: "Mock Interview",
      description: "Practice with AI-powered interviews and get instant feedback",
      icon: "🎤",
      path: "/mock-interview",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Resume Builder",
      description: "Create a professional resume with our easy-to-use builder",
      icon: "📝",
      path: "/resume-builder",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Resume Scorer",
      description: "Get your resume scored and receive improvement suggestions",
      icon: "⭐",
      path: "/resume-scorer",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    {
      title: "Job Suggestions",
      description: "Discover personalized job recommendations based on your profile",
      icon: "🔍",
      path: "/job-suggestions",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Roadmaps",
      description: "Browse Roadmaps for your target roles",
      icon: "❓",
      path: "/Roadmap",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Progress Tracker",
      description: "Monitor your job search progress and applications",
      icon: "📊",
      path: "/progress-tracker",
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Welcome Header */}
        <section className="text-center mb-12 pt-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to WorkWise
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your all-in-one solution for job search preparation
          </p>
        </section>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className={`${feature.color} text-white rounded-xl shadow-lg transform transition-all hover:scale-105 overflow-hidden`}
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
                <p className="opacity-90">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tips Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Update your resume with your latest experience</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Practice at least one mock interview this week</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Check out new job recommendations</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;