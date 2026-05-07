import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../pages/administration/api';

const AcademyContext = createContext();

export const AdminProvider = ({ children }) => {
  const [academyData, setAcademyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAcademyData = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // Allow all logged-in users to fetch academy branding
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.get('academy/');
      setAcademyData(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to load academy data:', error);
      }
      setAcademyData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAcademyData();
  }, [refreshAcademyData]);

  useEffect(() => {
    if (academyData) {
      const {
        primary_color, secondary_color, color_3, color_4,
        secondary_color_active, color_3_active, color_4_active,
        header_text_color, gradient_angle, border_radius_style
      } = academyData;

      const root = document.documentElement;
      
      // Colors Variables
      root.style.setProperty('--primary-color', primary_color || '#902bd1');
      root.style.setProperty('--secondary-color', secondary_color || '#4fb0ff');
      root.style.setProperty('--color-3', color_3 || '#00d0cb');
      root.style.setProperty('--color-4', color_4 || '#180033');
      root.style.setProperty('--header-text-color', header_text_color || '#ffffff');
      
      // Radius
      root.style.setProperty('--dashboard-radius', '12px');
      
      // Dynamic Gradient/Solid Logic
      const activeColors = [primary_color || '#902bd1'];
      if (secondary_color_active) activeColors.push(secondary_color || '#4fb0ff');
      if (color_3_active) activeColors.push(color_3 || '#00d0cb');
      if (color_4_active) activeColors.push(color_4 || '#180033');

      const angle = gradient_angle || 135;
      root.style.setProperty('--gradient-angle', `${angle}deg`);

      if (activeColors.length === 1) {
        root.style.setProperty('--main-gradient', activeColors[0]);
      } else {
        root.style.setProperty('--main-gradient', `linear-gradient(${angle}deg, ${activeColors.join(', ')})`);
      }
    }
  }, [academyData]);

  const updateAcademyData = useCallback((newData) => {
    setAcademyData(newData);
  }, []);

  return (
    <AcademyContext.Provider value={{ 
      academyData, 
      isLoading, 
      updateAcademyData, 
      refreshAcademyData,
      adminData: academyData,       // for backward compatibility
      refreshAdminData: refreshAcademyData, // for backward compatibility
      updateAdminData: updateAcademyData    // for backward compatibility
    }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademyData = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademyData must be used within an AdminProvider');
  }
  return context;
};

// Aliases for backward compatibility
export const useAdminData = useAcademyData;
