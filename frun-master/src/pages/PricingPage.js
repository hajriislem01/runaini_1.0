// src/pages/PricingPage.jsx
import React, { useState } from 'react';
import { FiCheck, FiArrowRight, FiStar, FiZap, FiGlobe, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PricingPage = () => {
  const [activeTab, setActiveTab] = useState('monthly');

  const plans = [
    {
      name: "Starter",
      icon: <FiStar className="text-amber-400" />,
      monthlyPrice: "67.75",
      annualPrice: "610.00",
      features: [
        "Full-time Analytics",
        "Full Interactive Dashboard",
        "Search Theory Features",
        "Community Advisor Access"
      ],
      popular: false
    },
    {
      name: "Professional",
      icon: <FiZap className="text-blue-500" />,
      monthlyPrice: "169.38",
      annualPrice: "1,525.00",
      features: [
        "Full-time Analytics",
        "Advanced Search Theory",
        "Priority Community Advisor",
        "Custom Reporting",
        "API Access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      icon: <FiGlobe className="text-purple-500" />,
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      features: [
        "All Professional Features",
        "Dedicated Account Manager",
        "White-label Solutions",
        "On-premise Deployment",
        "24/7 Premium Support",
        "Custom Integrations"
      ],
      popular: false
    }
  ];

  const faqs = [
    "How do I create an account?",
    "Which product is right for me? (Digitize or Write a Nexus?)",
    "How can I contact the support team?",
    "Can I integrate with Windows software and workflows?",
    "Where can I find the Working Center?",
    "Where can I download PlayStore and/or Vehicle Nexus?"
  ];

  const testimonials = [
    {
      quote: "In 12 months, our team has seen practical improvements in game analysis accuracy and player performance tracking.",
      author: "Amen",
      company: "Active Media Ltd.",
      rating: 5
    },
    {
      quote: "RUNAINI helps improve service delivery and manage resources with high quality analytics, helping us navigate complex game strategies.",
      author: "Chemical",
      company: "Sports Analytics Group",
      rating: 4
    },
    {
      quote: "The platform offers comprehensive tools for all our coaching activities. We're able to work with players effectively as they develop.",
      author: "Environmental Services",
      company: "Carbon Protection Agency",
      rating: 5
    },
    {
      quote: "RUNAINI is driving analytics across our organization and has significantly impacted our scouting and player development capabilities.",
      author: "Development",
      company: "Health & Performance Institute",
      rating: 5
    }
  ];

  const insights = [
    {
      title: "Customer Manager",
      items: ["Customer Analytics", "Client Marketing", "Product Performance"]
    },
    {
      title: "Health Service",
      items: ["Medical Analytics", "Environmental Services", "Financial & Social Insights"]
    },
    {
      title: "Regulatory",
      items: ["Healthcare Compliance", "ICT Telefonservices", "Regulatory Frameworks"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            RUNAINI Pricing
          </motion.h1>
          <motion.p
            className="text-xl text-blue-100 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Advanced analytics solutions designed for teams of all sizes.
            Choose the perfect plan to elevate your performance analysis.
          </motion.p>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-16 px-4 -mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">

            {/* Pricing Toggle */}
            <motion.div
              className="mt-8 inline-flex bg-gray-200 rounded-full p-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'monthly'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly Billing
              </button>
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'annual'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => setActiveTab('annual')}
              >
                Annual Billing <span className="text-green-500">(Save 15%)</span>
              </button>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${plan.popular ? "ring-2 ring-blue-500 ring-offset-4" : "border border-gray-200"
                  }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 font-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.name === "Enterprise" ? plan.monthlyPrice : (
                        <>
                          <span className="text-3xl align-top">$</span>
                          {activeTab === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                        </>
                      )}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {plan.name !== "Enterprise" && `/${activeTab === 'monthly' ? 'mo' : 'yr'}`}
                    </span>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about RUNAINI plans and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((question, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  {question}
                </h3>
                <div className="ml-9">
                  <p className="text-gray-600">
                    {question.includes("account")
                      ? "Signing up is quick and easy. Click 'Get Started' on any plan to begin your registration."
                      : question.includes("right for me")
                        ? "Our solutions team can help determine the best option based on your team size, sport, and analytics needs."
                        : question.includes("support")
                          ? "Our support team is available 24/7 through chat, email, or scheduled video consultations."
                          : question.includes("Windows")
                            ? "RUNAINI integrates seamlessly with Windows workflows through our comprehensive API."
                            : question.includes("Working Center")
                              ? "The Working Center is accessible through our web portal under the 'Resources' section."
                              : "Our mobile apps are available on both iOS App Store and Google Play Store."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Elite Teams
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from sports organizations transforming their performance with RUNAINI
            </p>
          </div>

          <div className="relative overflow-hidden py-12">
            {/* Gradient fade overlays */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Marquee Container */}
            <div className="animate-marquee whitespace-nowrap flex">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={`${testimonial.author}-${index}`}
                  className="flex-shrink-0 mx-10 transition-all duration-500 hover:scale-[1.02] group"
                >
                  <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-200 w-[500px] max-w-[90vw] relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-bl-full opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-tr-full opacity-40"></div>

                    <div className="relative z-10">
                      <div className="flex items-start mb-6">
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            {testimonial.author.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-5 flex-1 min-w-0">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xl text-gray-900">{testimonial.author}</h4>
                              <p className="text-blue-600 text-sm font-medium mt-1">{testimonial.company}</p>
                            </div>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  size={18}
                                  className={`flex-shrink-0 ${i < testimonial.rating ? "fill-current" : "text-amber-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b from-blue-500 to-purple-500 before:rounded-full">
                        <p className="text-gray-700 text-base leading-relaxed italic transition-all group-hover:text-gray-900">
                          "{testimonial.quote}"
                        </p>
                      </div>

                      {/* Platform badge */}
                      <div className="mt-6 flex justify-end">
                        <span className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-full text-sm font-semibold text-blue-700 border border-blue-200">
                          <FiActivity className="mr-1.5 text-blue-500" />
                          RUNAINI Platform
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Insights */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Insight</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Discover the latest research, trends, and innovations in sports analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FiArrowRight className="mr-2 text-blue-300" />
                  {insight.title}
                </h3>
                <ul className="space-y-3 pl-8">
                  {insight.items.map((item, idx) => (
                    <li key={idx} className="flex items-center opacity-90 hover:opacity-100 transition-opacity">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-3"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default PricingPage;