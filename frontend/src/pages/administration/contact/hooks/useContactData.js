import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../../api';

export const useContactData = () => {
  const [academies, setAcademies] = useState([]);
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    searchQuery: ''
  });

  useEffect(() => {
    const fetchAcademies = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('academies/');
        setAcademies(response.data);
        setFilteredAcademies(response.data);
      } catch (error) {
        toast.error('Failed to load academies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAcademies();
  }, []);

  useEffect(() => {
    let filtered = [...academies];

    if (filters.country) {
      filtered = filtered.filter(a => a.country === filters.country);
    }
    if (filters.city) {
      filtered = filtered.filter(a =>
        a.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.philosophy?.toLowerCase().includes(q)
      );
    }

    setFilteredAcademies(filtered);
  }, [filters, academies]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ country: '', city: '', searchQuery: '' });
  };

  const stats = {
    total: academies.length,
    countries: [...new Set(academies.map(a => a.country).filter(Boolean))].length,
    withContact: academies.filter(a => a.email || a.phone).length,
  };

  return {
    academies, filteredAcademies, isLoading,
    selectedAcademy, setSelectedAcademy,
    filters, handleFilterChange, clearFilters,
    stats
  };
};
