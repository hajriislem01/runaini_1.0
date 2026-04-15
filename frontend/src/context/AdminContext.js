import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../pages/administration/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdminData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.get('academy/');
      setAdminData(response.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      if (error.response?.status === 404) {
        setAdminData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const updateAdminData = useCallback((newData) => {
    setAdminData(newData);
  }, []);

  return (
    <AdminContext.Provider value={{ adminData, isLoading, updateAdminData, refreshAdminData }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminProvider');
  }
  return context;
};
