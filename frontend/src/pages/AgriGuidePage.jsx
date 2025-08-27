import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, Tractor, ArrowRight, BarChart, Cloud, Leaf, 
  PiggyBank, Check, ChevronDown, Menu, Search, Bell, 
  DollarSign, Droplet, Thermometer, SproutIcon, TreeDeciduous
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AgriGuidePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  
  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // Core features aligned with actual app functionality
  const features = [
    { 
      id: 1, 
      title: 'Financial Resource Management', 
      icon: <PiggyBank className="h-6 w-6" />, 
      description: 'Track expenses, loans, and manage your farm budget efficiently. Access government schemes and financial aid opportunities.',
      path: '/dashboard/financial-resources'
    },
    { 
      id: 2, 
      title: 'Crop Recommendations', 
      icon: <TreeDeciduous className="h-6 w-6" />, 
      description: 'Get personalized crop suggestions based on your soil type, climate, and market conditions to maximize yield and profit.',
      path: '/dashboard/recommendations'
    },
    { 
      id: 3, 
      title: 'Weather Forecasts', 
      icon: <Cloud className="h-6 w-6" />, 
      description: 'Access accurate weather predictions tailored for your farm location to plan activities and protect your crops.',
      path: '/dashboard/weather'
    },
    { 
      id: 4, 
      title: 'Farm Resource Tracking',
      icon: <Tractor className="h-6 w-6" />,
      description: 'Manage your farm equipment, inventory, and resources in one place for better operational efficiency.',
      path: '/dashboard/farm-resources'
    },
    { 
      id: 5, 
      title: 'Soil Monitoring',
      icon: <Leaf className="h-6 w-6" />,
      description: 'Track soil health, moisture levels, and nutrient content to ensure optimal growing conditions.',
      path: '/dashboard/soil-monitoring'
    },
    { 
      id: 6, 
      title: 'Yield Analytics',
      icon: <BarChart className="h-6 w-6" />,
      description: 'Analyze historical data, track performance metrics, and make data-driven decisions to improve farm productivity.',
      path: '/dashboard/analytics'
    }
  ];

  const faqs = [
    { id: 1, question: 'How does CropMate recommend suitable crops for my farm?', answer: 'Our recommendation system analyzes your soil data, local climate patterns, and current market trends to suggest crops with the highest probability of success and profitability for your specific conditions.' },
    { id: 2, question: 'Can I track my farm finances in the application?', answer: 'Yes, our Financial Resource Management module lets you track expenses, manage loans, monitor budgets, and access information about government schemes and subsidies.' },
    { id: 3, question: 'Is my farm data secure in the system?', answer: 'Absolutely. We use industry-standard encryption and secure protocols to protect all your farm data. Your information is never shared with third parties without your explicit permission.' },
    { id: 4, question: 'Can I access AgriGuide on mobile devices?', answer: 'Yes, AgriGuide is fully responsive and works on smartphones and tablets, allowing you to manage your farm operations on the go.' },
    { id: 5, question: 'How accurate are the weather forecasts?', answer: 'Our weather forecasts combine data from multiple meteorological services and are localized to your specific farm location, providing 95% accuracy for 3-day forecasts.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-green-600 font-bold text-xl flex items-center">
                  <TreeDeciduous className="h-6 w-6 mr-2" />
                  AgriGuide
                </span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#features" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-green-500 transition duration-200">Features</a>
                <a href="#benefits" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-green-500 transition duration-200">Benefits</a>
                <a href="#testimonials" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-green-500 transition duration-200">Testimonials</a>
                <a href="#faq" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-green-500 transition duration-200">FAQ</a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2 border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500 rounded-md leading-5 focus:outline-none focus:ring-2 sm:text-sm" 
                  placeholder="Search" 
                  type="search" 
                />
              </div>
              
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200">
                Log in
              </Link>
              
              <Link 
                to="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}>
          <div className="pt-2 pb-3 space-y-1">
            <a href="#features" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-green-500 text-base font-medium transition duration-200">Features</a>
            <a href="#benefits" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-green-500 text-base font-medium transition duration-200">Benefits</a>
            <a href="#testimonials" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-green-500 text-base font-medium transition duration-200">Testimonials</a>
            <a href="#faq" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-green-500 text-base font-medium transition duration-200">FAQ</a>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              <a href="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-green-500 text-base font-medium transition duration-200">
                Log in
              </a>
              <a href="/signup" className="block pl-3 pr-4 py-2 border-l-4 border-green-500 text-green-700 bg-green-50 hover:bg-green-100 text-base font-medium transition duration-200">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Updated with agriculture-focused imagery and messaging */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:py-28 lg:max-w-2xl lg:w-full">
            <div className="px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Smart farming</span>
                <span className="block text-green-200">for better harvests</span>
              </h1>
              <p className="mt-6 text-xl text-green-100 max-w-lg">
                AgriGuide helps farmers make data-driven decisions with integrated financial tracking, crop recommendations, and resource management tools.
              </p>
              <div className="mt-10 flex space-x-4">
                <a href="/dashboard" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-all duration-300 hover:shadow-xl">
                  Get started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a href="#features" className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-600 transition duration-200">
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img 
            src="/assets/farm-field.jpg" 
            alt="Farm field" 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80';
            }}
          />
        </div>
      </div>

      {/* Stats Section - Updated with relevant metrics */}
      <div className="bg-white py-12 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-green-600">28%</p>
              <p className="text-gray-500 mt-2">Average Yield Increase</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-green-600">₹15k+</p>
              <p className="text-gray-500 mt-2">Cost Savings Per Acre</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-green-600">95%</p>
              <p className="text-gray-500 mt-2">Crop Recommendation Accuracy</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-green-600">10K+</p>
              <p className="text-gray-500 mt-2">Indian Farmers Using CropMate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Updated with actual application features */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              All your farming needs in one place
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              AgriGuide offers a comprehensive set of tools to help you manage every aspect of your farm.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link to={feature.path} key={feature.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                  <div className="p-8">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-5">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-4 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-green-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - New section focused on farmer benefits */}
      <div id="benefits" className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Benefits for farmers
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              How AgriGuide transforms your farming operations and increases profitability.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-5">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Financial Optimization</h3>
                <p className="mt-4 text-gray-500">
                  Track expenses, access government schemes, and optimize your farm finances to maximize profitability.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-5">
                  <SproutIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Increased Crop Yields</h3>
                <p className="mt-4 text-gray-500">
                  Get personalized crop recommendations based on your soil type, climate conditions, and market demand.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-5">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Data-Driven Decisions</h3>
                <p className="mt-4 text-gray-500">
                  Access analytics and insights to make informed decisions about planting, harvesting, and selling your crops.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-5">
                  <Thermometer className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Weather Resilience</h3>
                <p className="mt-4 text-gray-500">
                  Plan your farming activities around accurate weather forecasts to protect your crops and optimize resources.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-5">
                  <Droplet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Resource Conservation</h3>
                <p className="mt-4 text-gray-500">
                  Optimize water usage, fertilizer application, and other resources to reduce costs and environmental impact.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-5">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Simplified Planning</h3>
                <p className="mt-4 text-gray-500">
                  Schedule farming activities, track progress, and manage your entire agricultural calendar in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Stories from farmers
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Hear from farmers who have transformed their operations with AgriGuide.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-8 relative border border-gray-100">
              <div className="absolute -top-4 -left-4 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">"</span>
              </div>
              <p className="text-gray-600 italic">
                "AgriGuide's financial tracking helped me identify where I was losing money and optimize my spending. I've already saved over ₹35,000 this season."
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Rajesh Patel</h3>
                  <p className="text-sm text-gray-500">Wheat Farmer, Gujarat</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 relative border border-gray-100">
              <div className="absolute -top-4 -left-4 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">"</span>
              </div>
              <p className="text-gray-600 italic">
                "The crop recommendation system suggested I try growing turmeric based on my soil conditions. It's now my most profitable crop and I wouldn't have considered it otherwise."
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Anita Sharma</h3>
                  <p className="text-sm text-gray-500">Mixed Crop Farmer, Karnataka</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 relative border border-gray-100">
              <div className="absolute -top-4 -left-4 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">"</span>
              </div>
              <p className="text-gray-600 italic">
                "The weather alerts saved my entire mango crop during an unexpected frost. The app notified me 2 days before any other forecast service, giving me time to protect the trees."
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Vikram Singh</h3>
                  <p className="text-sm text-gray-500">Fruit Grower, Maharashtra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Find answers to common questions about AgriGuide.
            </p>
          </div>
          
          <div className="mt-12 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200">
                <button
                  className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                      openFaqId === faq.id ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqId === faq.id ? 'max-h-40 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-500">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-green-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              <span className="block">Ready to transform your farming?</span>
              <span className="block text-green-200">Start your journey with AgriGuide today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a 
                  href="/signup" 
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition duration-200"
                >
                  Get started
                </a>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-500 transition duration-200"
                >
                  Go to dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center">
                <TreeDeciduous className="h-8 w-8 mr-2 text-green-600" />
                <span className="text-xl font-bold text-green-600">AgriGuide</span>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Helping Indian farmers optimize their operations with smart technology and data-driven insights.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-500 transition duration-200">
                  <span>FB</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition duration-200">
                  <span>TW</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500 transition duration-200">
                  <span>IG</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Features
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Financial Management
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Crop Recommendations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Weather Forecasts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Farm Resources
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Company
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="/about" className="text-gray-500 hover:text-green-600 transition duration-200">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Support
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-green-600 transition duration-200">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} AgriGuide Technologies. All rights reserved.
            </p>
            <p className="mt-4 md:mt-0 text-sm text-gray-400">
              Made with care for Indian farmers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgriGuidePage;