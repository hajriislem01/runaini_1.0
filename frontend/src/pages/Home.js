import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { FiArrowRight, FiPlay, FiUsers, FiClipboard, FiTarget, FiActivity, FiCloud, FiLock } from 'react-icons/fi';

const FootballMarquee = () => {
  const teams = [
    { id: 1, name: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg' },
    { id: 2, name: 'Barcelona', logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' },
    { id: 3, name: 'Manchester United', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg' },
    { id: 4, name: 'Liverpool', logo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg' },
    { id: 5, name: 'Esperance Sportive', logo: 'https://images.seeklogo.com/logo-png/4/2/esperance-sportive-de-tunis-logo-png_seeklogo-49164.png' },
  ];

  // Duplicate for seamless loop
  const duplicatedTeams = [...teams, ...teams, ...teams];

  return (
    <div className="relative overflow-hidden py-6 md:py-8">
      <div className="flex animate-marquee whitespace-nowrap">
        {duplicatedTeams.map((team, index) => (
          <motion.div
            key={`${team.id}-${index}`}
            className="inline-flex flex-col items-center mx-4 md:mx-8 lg:mx-12"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
              <img
                src={team.logo}
                alt={team.name}
                className="w-full h-full object-contain filter drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <h3 className="mt-2 text-xs md:text-sm font-medium text-blue-400">
              {team.name}
            </h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
};      

      
const Home = () => {
  const ref = useRef(null);
      const {scrollYProgress} = useScroll({target: ref, offset: ["start start", "end start"] });
      const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

      return (
      <div className="bg-gradient-to-br from-gray-950 to-blue-950 text-gray-100 overflow-hidden">
        {/* Parallax Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            style={{ y }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          />

          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Football Intelligence
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-12"
              >
                AI-powered platform combining advanced analytics, team management, and player development tools for modern football organizations
              </motion.p>

              <div className="flex flex-col md:flex-row justify-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 hover:shadow-2xl transition-all"
                  >
                    <FiArrowRight className="text-xl" />
                    Start Free Trial
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/demo"
                    className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <FiPlay className="text-xl" />
                    Interactive Demo
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="relative py-24" ref={ref}>
          <div className="max-w-7xl mx-auto px-4">
            {/* Marquee Section */}
            <div className="relative mb-24">
              
              <FootballMarquee />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="text-4xl font-bold text-center mb-20"
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Comprehensive Platform
              </span>
              <br />
              <span className="text-2xl text-gray-400">Three Pillars of Success</span>
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Administration Suite",
                  icon: <FiUsers className="w-12 h-12" />,
                  color: "from-blue-600 to-blue-400",
                  features: [
                    "Player Database Management",
                    "Financial Tracking & Reporting",
                    "Advanced Access Controls",
                    "Team Scheduling & Logistics"
                  ],
                  stats: "250+ Clubs Managed"
                },
                {
                  title: "Coaching Intelligence",
                  icon: <FiClipboard className="w-12 h-12" />,
                  color: "from-purple-600 to-purple-400",
                  features: [
                    "AI Training Recommendations",
                    "Video Analysis Suite",
                    "Real-time Performance Dashboards",
                    "Player Development Tracking"
                  ],
                  stats: "10k+ Sessions Analyzed"
                },
                {
                  title: "Player Portal",
                  icon: <FiTarget className="w-12 h-12" />,
                  color: "from-green-600 to-green-400",
                  features: [
                    "Personal Performance Metrics",
                    "Custom Training Programs",
                    "Video Feedback System",
                    "Biometric Progress Tracking"
                  ],
                  stats: "45% Average Improvement"
                }
              ].map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className={`bg-gradient-to-r ${role.color} p-4 rounded-2xl w-fit mb-6`}>
                    {role.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{role.title}</h3>
                  <ul className="space-y-4 mb-8">
                    {role.features.map((feature) => (
                      <motion.li
                        key={feature}
                        whileHover={{ x: 10 }}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <div className="h-2 w-2 bg-blue-400 rounded-full" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="text-sm text-blue-400 font-semibold">
                    {role.stats}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Analytics Section */}
        <section className="py-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="grid lg:grid-cols-2 gap-16 items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                <h2 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AI-Powered Insights
                  </span>
                </h2>

                <div className="space-y-8">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <FiActivity className="w-8 h-8 text-purple-400" />
                      <h3 className="text-xl font-semibold">Real-time Match Analysis</h3>
                    </div>
                    <p className="text-gray-400">
                      Live tracking of 25+ performance metrics including passes, shots, tackles,
                      and positioning with automatic heatmap generation.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <FiCloud className="w-8 h-8 text-blue-400" />
                      <h3 className="text-xl font-semibold">Cloud Video Library</h3>
                    </div>
                    <p className="text-gray-400">
                      Secure storage and analysis of match footage with AI-powered highlight
                      detection and collaborative annotation tools.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <FiLock className="w-8 h-8 text-green-400" />
                      <h3 className="text-xl font-semibold">Military-grade Security</h3>
                    </div>
                    <p className="text-gray-400">
                      End-to-end encryption, GDPR compliance, and role-based access controls
                      to protect sensitive team data.
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="relative aspect-video bg-gray-800 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="p-8 bg-white/10 backdrop-blur-sm rounded-full"
                  >
                    <FiPlay className="w-16 h-16 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="grid md:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {[
                { metric: "Player Progress", value: "↑62%", desc: "Average performance improvement" },
                { metric: "Analysis Speed", value: "10x", desc: "Faster than traditional methods" },
                { metric: "Data Points", value: "1M+", desc: "Collected per match" },
                { metric: "Accuracy", value: "98.7%", desc: "AI prediction rate" }
              ].map((stat) => (
                <motion.div
                  key={stat.metric}
                  whileHover={{ y: -10 }}
                  className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="text-4xl font-bold mb-2 text-blue-400">{stat.value}</div>
                  <div className="text-xl font-semibold mb-2">{stat.metric}</div>
                  <div className="text-gray-400 text-sm">{stat.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

      </div>
      );
};

      export default Home;