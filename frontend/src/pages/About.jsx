import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-transparent px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center">
          <a href="/" className="text-green-400 text-2xl font-bold">AgriGuide</a>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <a href="/" className="text-white hover:text-green-400">Home</a>
          <a href="/about" className="text-green-400 border-b-2 border-green-400">About</a>
          <a href="/login" className="text-white hover:text-green-400">Log in</a>
          <a href="/signup" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md">Sign up</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About AgriGuide</h1>
          <p className="text-xl text-green-300">Empowering farmers with smart technology</p>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-green-400">Our Mission</h2>
          <p className="text-lg mb-4">
            At AgriGuide, we're on a mission to revolutionize farming through technology. 
            We believe that by combining traditional agricultural knowledge with modern 
            data science and AI, we can help farmers increase yields, reduce waste, and 
            practice more sustainable farming.
          </p>
          <p className="text-lg">
            Our platform provides farmers with actionable insights, personalized recommendations, 
            and a community of support to navigate the challenges of modern agriculture in a 
            changing climate.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-400 text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-3">Crop Management</h3>
            <p>Track your crops from planting to harvest with detailed insights on growth stages, health indicators, and yield predictions.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-400 text-4xl mb-4">🌦️</div>
            <h3 className="text-xl font-bold mb-3">Weather Integration</h3>
            <p>Access hyperlocal weather forecasts and receive alerts about conditions that might affect your crops.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-400 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Data-Driven Insights</h3>
            <p>Make informed decisions with AI-powered recommendations based on soil conditions, weather patterns, and crop performance.</p>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-green-400">Our Team</h2>
          <p className="text-lg mb-4">
            AgriGuide was founded by a team of agricultural experts, data scientists, and 
            software engineers who share a passion for sustainable farming and technology.
          </p>
          <p className="text-lg">
            We work closely with farmers and agricultural researchers to ensure our platform 
            addresses real-world challenges and delivers practical solutions.
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-green-400">Get in Touch</h2>
          <p className="text-xl mb-8">
            Have questions or want to learn more about AgriGuide?
          </p>
          <a 
            href="mailto:contact@agriguide.com" 
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-green-300 mb-2">© 2023 AgriGuide. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="#" className="text-white hover:text-green-400">Privacy Policy</a>
            <a href="#" className="text-white hover:text-green-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;