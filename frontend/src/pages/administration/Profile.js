import React, { useEffect, useState } from 'react';
import { useProfileContext } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiTarget, 
  FiUsers, FiHome, FiAward, FiStar, FiClock, FiEdit2, 
  FiShield, FiCalendar, FiFlag, FiActivity, FiLayers, FiLink,
  FiEye, FiSettings, FiFacebook, FiInstagram,
  FiGlobe as FiWeb
} from 'react-icons/fi';
import { FaTshirt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Profile = () => {
  const { profileData, getStatesForCountry } = useProfileContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!profileData) {
      toast.error('Please login to access your profile');
      navigate('/login');
    } else {
      setIsLoading(false);
    }
  }, [profileData, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00d0cb]"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const { personalInfo = {}, location = {}, academyInfo = {} } = profileData || {};


  const getCountryName = (code) => {
    return code || 'Not specified';
  };

  const getStateName = (country, state) => {
    if (!country || !state) return 'Not specified';
    const states = getStatesForCountry(country);
    return states.includes(state) ? state : 'Not specified';
  };

  const InfoItem = ({ icon, label, value, verified = false, isLink = false, children }) => {
    if (!value && !children) return null;

    return (
      <div className="flex gap-3 md:gap-4 py-3 border-b border-gray-700/50 last:border-0">
        <div className="text-[#4fb0ff] mt-1">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-400 font-medium">{label}</div>
          {value && (
            <div className="flex items-center gap-2 mt-1">
              {isLink ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#80a8ff] hover:text-white font-medium truncate transition-colors"
                >
                  {value}
                </a>
              ) : (
                <div className="text-white font-medium truncate">{value}</div>
              )}
              {verified && (
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full flex-shrink-0">
                  Verified
                </span>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    );
  };

  const SectionCard = ({ children, title, icon, delay = 0, className = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50 hover:border-gray-600 transition-all ${className}`}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700/50">
        <div className="p-2 rounded-lg bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );

  const TabButton = ({ name, icon, isActive }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(name.toLowerCase())}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
        isActive 
          ? 'bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white shadow-lg' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
    >
      {icon}
      {name}
    </motion.button>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <SectionCard 
                title="Academy Information" 
                icon={<FiTarget size={20} />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <InfoItem
                    icon={<FiStar size={20} />}
                    label="Academy Name"
                    value={academyInfo.name}
                  />
                  <InfoItem
                    icon={<FiCalendar size={20} />}
                    label="Founded"
                    value={academyInfo.founded || 'N/A'}
                  />
                  <InfoItem
                    icon={<FiFlag size={20} />}
                    label="Country"
                    value={getCountryName(academyInfo.country)}
                  />
                  <InfoItem
                    icon={<FiMapPin size={20} />}
                    label="City"
                    value={academyInfo.city || 'N/A'}
                  />
                  <InfoItem
                    icon={<FiActivity size={20} />}
                    label="Colors"
                    value={academyInfo.colors || 'N/A'}
                  />

                  {academyInfo.ageGroups?.length > 0 && (
                    <div className="md:col-span-2">
                      <InfoItem
                        icon={<FiLayers size={20} />}
                        label="Age Groups"
                      >
                        <div className="flex flex-wrap gap-2 mt-2">
                          {academyInfo.ageGroups.map(group => (
                            <span 
                              key={group} 
                              className="px-3 py-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-full text-sm font-medium border border-[#00d0cb]/50"
                            >
                              {group}
                            </span>
                          ))}
                        </div>
                      </InfoItem>
                    </div>
                  )}

                  {academyInfo.achievements && (
                    <div className="md:col-span-2">
                      <div className="bg-gray-800/30 rounded-xl p-4 mt-3 border border-gray-700/50">
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                          <FiAward className="text-yellow-400" />
                          <h3 className="font-semibold">Achievements</h3>
                        </div>
                        <p className="text-gray-300">{academyInfo.achievements}</p>
                      </div>
                    </div>
                  )}

                  {academyInfo.philosophy && (
                    <div className="md:col-span-2">
                      <div className="bg-gray-800/30 rounded-xl p-4 mt-3 border border-gray-700/50">
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                          <FiShield className="text-[#00d0cb]" />
                          <h3 className="font-semibold">Academy Philosophy</h3>
                        </div>
                        <p className="text-gray-300">{academyInfo.philosophy}</p>
                      </div>
                    </div>
                  )}

                  {/* Kit Images */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FaTshirt className="text-[#902bd1]" />
                      Team Kits
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {academyInfo.tenues?.homeKit ? (
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-300 mb-2">Home Kit</div>
                          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-[#902bd1] to-[#4fb0ff] border-4 border-white/20 shadow-xl">
                            <img
                              src={academyInfo.tenues.homeKit}
                              alt="Home Kit"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 md:h-64 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600">
                          <FaTshirt className="text-4xl text-gray-500 mb-3" />
                          <p className="text-gray-400 text-sm">No home kit uploaded</p>
                        </div>
                      )}
                      
                      {academyInfo.tenues?.awayKit ? (
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-300 mb-2">Away Kit</div>
                          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-[#902bd1] to-[#7c3aed] border-4 border-white/20 shadow-xl">
                            <img
                              src={academyInfo.tenues.awayKit}
                              alt="Away Kit"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 md:h-64 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600">
                          <FaTshirt className="text-4xl text-gray-500 mb-3" />
                          <p className="text-gray-400 text-sm">No away kit uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Staff & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Staff Information */}
                {academyInfo.staff && (
                  <SectionCard 
                    title="Staff Information" 
                    icon={<FiUsers size={20} />}
                    delay={0.1}
                  >
                    <div className="space-y-4">
                      <InfoItem
                        icon={<FiUser size={18} />}
                        label="Technical Director"
                        value={academyInfo.staff.technicalDirector || 'N/A'}
                      />
                      <InfoItem
                        icon={<FiUser size={18} />}
                        label="Head Coach"
                        value={academyInfo.staff.headCoach || 'N/A'}
                      />
                      <InfoItem
                        icon={<FiUser size={18} />}
                        label="Fitness Coach"
                        value={academyInfo.staff.fitnessCoach || 'N/A'}
                      />
                      <InfoItem
                        icon={<FiUser size={18} />}
                        label="Medical Staff"
                        value={academyInfo.staff.medicalStaff || 'N/A'}
                      />
                    </div>
                  </SectionCard>
                )}

                {/* Facilities */}
                {academyInfo.facilities && (
                  <SectionCard 
                    title="Facilities" 
                    icon={<FiHome size={20} />}
                    delay={0.2}
                  >
                    <div className="space-y-4">
                      <InfoItem
                        icon={<FiHome size={18} />}
                        label="Stadium Name"
                        value={academyInfo.facilities.stadiumName || 'N/A'}
                      />
                      <InfoItem
                        icon={<FiMapPin size={18} />}
                        label="Stadium Location"
                        value={academyInfo.facilities.stadiumLocation || 'N/A'}
                      />
                      <InfoItem
                        icon={<FiHome size={18} />}
                        label="Gym"
                        value={academyInfo.facilities.gym ? 'Available' : 'Not available'}
                      />
                      <InfoItem
                        icon={<FiHome size={18} />}
                        label="Cafeteria"
                        value={academyInfo.facilities.cafeteria ? 'Available' : 'Not available'}
                      />
                      <InfoItem
                        icon={<FiHome size={18} />}
                        label="Dormitory"
                        value={academyInfo.facilities.dormitory ? 'Available' : 'Not available'}
                      />
                    </div>
                  </SectionCard>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <SectionCard 
                title="Administration" 
                icon={<FiUser size={20} />}
                delay={0.3}
              >
                <div className="flex flex-col items-center mb-4 md:mb-6">
                  <div className="relative mb-3 md:mb-4">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-[#00d0cb]/60 shadow-lg bg-gray-800">
                      {personalInfo.profileImage ? (
                        <img
                          src={personalInfo.profileImage}
                          alt={personalInfo.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-[#902bd1] to-[#4fb0ff]">
                          <FiUser className="h-12 w-12 md:h-16 md:w-16 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">{personalInfo.fullName}</h3>
                  <p className="text-gray-400">Administrator</p>
                </div>

                <div className="space-y-3">
                  <InfoItem
                    icon={<FiMail size={16} />}
                    label="Email"
                    value={personalInfo.email}
                    verified={personalInfo.isEmailVerified}
                  />
                  <InfoItem
                    icon={<FiPhone size={16} />}
                    label="Phone"
                    value={personalInfo.phone}
                    verified={personalInfo.isPhoneVerified}
                  />
                  
                  {personalInfo.responsibilities && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <FiShield className="text-[#00d0cb]" />
                        <h3 className="font-semibold">Responsibilities</h3>
                      </div>
                      <p className="text-gray-300 text-sm">{personalInfo.responsibilities}</p>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Location & Preferences */}
              <SectionCard 
                title="Location & Preferences" 
                icon={<FiMapPin size={20} />}
                delay={0.4}
              >
                <div className="space-y-3">
                  <InfoItem
                    icon={<FiGlobe size={16} />}
                    label="Country"
                    value={getCountryName(location.country)}
                  />
                  <InfoItem
                    icon={<FiMapPin size={16} />}
                    label="State/Region"
                    value={getStateName(location.country, location.state)}
                  />
                  <InfoItem
                    icon={<FiMapPin size={16} />}
                    label="City"
                    value={location.city || 'N/A'}
                  />
                  <InfoItem
                    icon={<FiClock size={16} />}
                    label="Time Zone"
                    value={profileData.preferences?.timezone || 'N/A'}
                  />
                  <InfoItem
                    icon={<FiGlobe size={16} />}
                    label="Languages"
                  >
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.preferences?.languages?.length > 0 ? (
                        profileData.preferences.languages.map(lang => (
                          <span key={lang} className="px-3 py-1 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] text-white rounded-full text-sm font-medium">
                            {lang === 'en' ? 'English' : lang === 'fr' ? 'French' : 'Arabic'}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No languages specified</span>
                      )}
                    </div>
                  </InfoItem>
                </div>
              </SectionCard>
            </div>
          </div>
        );
      
      case 'social':
        return (
          <SectionCard title="Social Media" icon={<FiLink size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {academyInfo.contact?.website && (
                <InfoItem
                  icon={<FiWeb className="text-[#10B981]" size={20} />}
                  label="Website"
                  value={academyInfo.contact.website}
                  isLink={true}
                />
              )}
              {academyInfo.contact?.facebook && (
                <InfoItem
                  icon={<FiFacebook className="text-[#4fb0ff]" size={20} />}
                  label="Facebook"
                  value={academyInfo.contact.facebook}
                  isLink={true}
                />
              )}
              {academyInfo.contact?.instagram && (
                <InfoItem
                  icon={<FiInstagram className="text-[#902bd1]" size={20} />}
                  label="Instagram"
                  value={academyInfo.contact.instagram}
                  isLink={true}
                />
              )}
            </div>
          </SectionCard>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#902bd1] to-[#00d0cb] rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden border border-gray-700/50"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -m-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -m-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl bg-gradient-to-br from-[#902bd1] to-[#4fb0ff]">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white font-bold text-lg md:text-xl px-4">
                    {academyInfo?.name || "Academy"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{academyInfo.name}</h1>
                  <p className="text-gray-300 mt-1 md:mt-2">
                    {academyInfo.city || 'City'}, {getCountryName(academyInfo.country) || 'Country'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/administration/settings')}
                  className="px-4 py-2.5 md:px-5 md:py-3 bg-gradient-to-r from-[#902bd1] to-[#4fb0ff] hover:from-[#00d0cb] hover:to-[#4fb0ff] text-white rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 self-center"
                >
                  <FiEdit2 className="mr-1 md:mr-2" />
                  Edit Profile
                </motion.button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mt-4 md:mt-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-white">
                  <FiMail />
                  <span className="text-sm md:text-base">{academyInfo.contact?.email || 'email@example.com'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-white">
                  <FiPhone />
                  <span className="text-sm md:text-base">{academyInfo.contact?.phone || '+216 00 000 000'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
          <TabButton 
            name="Overview" 
            icon={<FiTarget size={18} />} 
            isActive={activeTab === 'overview'} 
          />
          <TabButton 
            name="Social" 
            icon={<FiLink size={18} />} 
            isActive={activeTab === 'social'} 
          />
          <TabButton 
            name="Settings" 
            icon={<FiSettings size={18} />} 
            isActive={activeTab === 'settings'} 
          />
        </div>

        {/* Main Content */}
        {renderContent()}

        {/* Contact Footer */}
        {academyInfo?.contact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 md:mt-8 bg-gray-900/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-gray-700/50"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <FiEye className="text-[#00d0cb]" />
                Need help? Contact us
              </div>
              
              <div className="flex gap-3 md:gap-4">
                {academyInfo.contact.email && (
                  <a 
                    href={`mailto:${academyInfo.contact.email}`} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiMail size={18} />
                    <span>Email</span>
                  </a>
                )}
                
                {academyInfo.contact.phone && (
                  <a 
                    href={`tel:${academyInfo.contact.phone}`} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiPhone size={18} />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;