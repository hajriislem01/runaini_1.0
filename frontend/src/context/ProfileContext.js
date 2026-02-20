import React, { createContext, useContext, useState, useCallback } from 'react';

const ProfileContext = createContext();

const countryStates = {
  'Tunisia': [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
    'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
    'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine',
    'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ],
  'France': [
    'Île-de-France', 'Auvergne-Rhône-Alpes', 'Hauts-de-France',
    'Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine',
    'Grand Est', 'Pays de la Loire', 'Bretagne', 'Normandie',
    'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Corse'
  ],
  'Algeria': [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa',
    'Sétif', 'Sidi Bel Abbès', 'Skikda', 'Tlemcen', 'El Oued', 'Jijel',
    'Mostaganem', 'M\'Sila', 'Ouargla', 'Tébessa', 'Tiaret', 'Tlemcen'
  ],
  'Morocco': [
    'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès',
    'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Nador', 'Mohammedia', 'El Jadida',
    'Béni Mellal', 'Taza', 'Khouribga', 'Settat', 'Larache', 'Ksar El Kébir'
  ],
  'Saudi Arabia': [
    'Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Tabuk', 'Hail',
    'Northern Borders', 'Jazan', 'Najran', 'Al Bahah', 'Al Jawf', 'Al Qassim'
  ],
  'UAE': [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain',
    'Ras Al Khaimah', 'Fujairah'
  ],
  'Qatar': [
    'Doha', 'Al Rayyan', 'Umm Salal', 'Al Khor', 'Al Wakrah', 'Al Shamal',
    'Al Daayen', 'Al Shahaniya'
  ],
  'Kuwait': [
    'Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'
  ],
  'Bahrain': [
    'Capital', 'Muharraq', 'Northern', 'Southern'
  ],
  'Oman': [
    'Muscat', 'Dhofar', 'Musandam', 'Al Buraimi', 'Ad Dakhiliyah',
    'Al Batinah North', 'Al Batinah South', 'Al Wusta', 'Az Zahirah',
    'Ash Sharqiyah North', 'Ash Sharqiyah South'
  ]
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // If storage is full, try to clear some space
      try {
        // Remove old data
        localStorage.removeItem(key);
        // Try again
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.error('Storage is full and could not be cleared:', retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
};

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          profileImage: '',
          role: 'admin',
          status: 'active'
        },
        location: {
          country: '',
          state: '',
          city: '',
          address: '',
          postalCode: ''
        },
        academyInfo: {
          name: '',
          logo: '',
          founded: '',
          country: '',
          state: '',
          city: '',
          postalCode: '',
          address: '',
          achievements: '',
          ageGroups: [],
          tenues: {
            homeKit: '',
            awayKit: ''
          },
          staff: {
            technicalDirector: '',
            headCoach: '',
            fitnessCoach: '',
            medicalStaff: ''
          },
          facilities: {
            stadiumName: '',
            stadiumLocation: '',
            gym: false,
            cafeteria: false,
            dormitory: false
          },
          philosophy: '',
          contact: {
            phone: '',
            email: '',
            facebook: '',
            instagram: '',
            website: ''
          }
        },
        preferences: {
          timezone: 'Africa/Tunis',
          languages: ['en']
        }
      };
    } catch (error) {
      console.error('Error loading profile data:', error);
      return null;
    }
  });

  const updateProfileData = useCallback((newData) => {
    setProfileData(prevData => {
      const updatedData = {
        ...prevData,
        ...newData
      };
      safeSetItem('user', updatedData);
      return updatedData;
    });
  }, []);

  const updatePersonalInfo = useCallback((newInfo) => {
    setProfileData(prevData => {
      const updatedData = {
        ...prevData,
        personalInfo: {
          ...prevData.personalInfo,
          ...newInfo
        }
      };
      safeSetItem('user', updatedData);
      return updatedData;
    });
  }, []);

  const updateAcademyInfo = async (academyInfo) => {
    try {
      const updatedData = {
        ...profileData,
        academyInfo: {
          ...profileData.academyInfo,
          ...academyInfo,
          // Ensure nested objects are properly merged
          tenues: {
            ...profileData.academyInfo.tenues,
            ...academyInfo.tenues
          },
          staff: {
            ...profileData.academyInfo.staff,
            ...academyInfo.staff
          },
          facilities: {
            ...profileData.academyInfo.facilities,
            ...academyInfo.facilities
          },
          contact: {
            ...profileData.academyInfo.contact,
            ...academyInfo.contact
          }
        }
      };
      setProfileData(updatedData);
      await saveProfileData(updatedData);
    } catch (error) {
      console.error('Error updating academy info:', error);
      throw error;
    }
  };

  const updateLocation = useCallback((newLocation) => {
    setProfileData(prevData => {
      const updatedData = {
        ...prevData,
        location: {
          ...prevData.location,
          ...newLocation
        }
      };
      safeSetItem('user', updatedData);
      return updatedData;
    });
  }, []);

  const updatePreferences = useCallback((newPreferences) => {
    setProfileData(prevData => {
      const updatedData = {
        ...prevData,
        preferences: {
          ...prevData.preferences,
          ...newPreferences
        }
      };
      safeSetItem('user', updatedData);
      return updatedData;
    });
  }, []);

  const getStatesForCountry = (country) => {
    return countryStates[country] || [];
  };

  const isValidStateForCountry = (country, state) => {
    const states = getStatesForCountry(country);
    return states.includes(state);
  };

  return (
    <ProfileContext.Provider value={{
      profileData,
      updateProfileData,
      updatePersonalInfo,
      updateAcademyInfo,
      updateLocation,
      updatePreferences,
      getStatesForCountry,
      isValidStateForCountry,
      countryStates
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};