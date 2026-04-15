import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import API from '../../../api';

export const usePaymentManagement = () => {
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_players: 0,
    paid_count: 0,
    unpaid_count: 0,
    total_collected: 0,
    paid_player_ids: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [form, setForm] = useState({
    player: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    month: format(new Date(), 'yyyy-MM'),
    method: 'cash',
    status: 'Completed',
    notes: '',
    receipt: null
  });
  const [errors, setErrors] = useState({});

  const [historyFilters, setHistoryFilters] = useState({
    method: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [currentMonth, selectedGroup]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroup) params.append('group', selectedGroup);

      const [playersRes, groupsRes, paymentsRes, statsRes] = await Promise.all([
        API.get(`players/?${params}`),
        API.get('groups/'),
        API.get(`payments/?month=${currentMonth}${selectedGroup ? `&group=${selectedGroup}` : ''}`),
        API.get(`payments/stats/?month=${currentMonth}${selectedGroup ? `&group=${selectedGroup}` : ''}`)
      ]);

      setPlayers(playersRes.data);
      setGroups(groupsRes.data);
      setPayments(paymentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const subgroups = useMemo(() => {
    if (!selectedGroup) return [];
    const group = groups.find(g => g.id === parseInt(selectedGroup));
    return group?.subgroups || [];
  }, [selectedGroup, groups]);

  const filteredPlayers = useMemo(() => {
    let result = players;
    if (selectedSubgroup) {
      result = result.filter(p => p.subgroup === parseInt(selectedSubgroup));
    }
    return result;
  }, [players, selectedSubgroup]);

  const paidPlayers = filteredPlayers.filter(p => stats.paid_player_ids.includes(p.id));
  const unpaidPlayers = filteredPlayers.filter(p => !stats.paid_player_ids.includes(p.id));

  const filteredPayments = useMemo(() => {
    let result = [...payments];
    if (historyFilters.method !== 'all') result = result.filter(p => p.method === historyFilters.method);
    if (historyFilters.status !== 'all') result = result.filter(p => p.status === historyFilters.status);
    if (historyFilters.startDate) result = result.filter(p => p.payment_date >= historyFilters.startDate);
    if (historyFilters.endDate) result = result.filter(p => p.payment_date <= historyFilters.endDate);
    return result;
  }, [payments, historyFilters]);

  const prevMonth = () => {
    const d = new Date(currentMonth + '-01');
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  };
  const nextMonth = () => {
    const d = new Date(currentMonth + '-01');
    setCurrentMonth(format(addMonths(d, 1), 'yyyy-MM'));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.player) newErrors.player = 'Please select a player';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!form.payment_date) newErrors.payment_date = 'Please select a payment date';
    if (!form.month) newErrors.month = 'Please select a month';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'receipt' && value instanceof File) {
            formData.append(key, value);
          } else if (key !== 'receipt') {
            formData.append(key, value);
          }
        }
      });

      const response = await API.post('payments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPayments(prev => [response.data, ...prev]);
      toast.success(`Payment recorded for ${response.data.player_name} ✅`);

      setForm({
        player: '',
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        month: currentMonth,
        method: 'cash',
        status: 'Completed',
        notes: '',
        receipt: null
      });
      setErrors({});
      fetchAll();
      setActiveTab('overview');
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
        toast.error('This player already has a payment for this month');
      } else {
        toast.error('Failed to record payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await API.delete(`payments/${paymentId}/`);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      toast.success('Payment deleted');
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  return {
    players, groups, payments, stats, isLoading, isSubmitting,
    currentMonth, setCurrentMonth, selectedGroup, setSelectedGroup,
    selectedSubgroup, setSelectedSubgroup, activeTab, setActiveTab,
    form, setForm, errors, setErrors, historyFilters, setHistoryFilters,
    selectedPayment, setSelectedPayment, showModal, setShowModal,
    subgroups, filteredPlayers, paidPlayers, unpaidPlayers, filteredPayments,
    prevMonth, nextMonth, handleSubmit, handleDelete
  };
};
