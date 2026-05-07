import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import API from '../../../api';
import { useAdminData } from '../../../../context/AdminContext';

export const usePaymentManagement = () => {
  const { adminData } = useAdminData();
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
  }, [currentMonth, selectedGroup, selectedSubgroup]); // eslint-disable-line

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGroup)    params.append('group',    selectedGroup);
      if (selectedSubgroup) params.append('subgroup', selectedSubgroup);

      const monthParam = `month=${currentMonth}`;
      const groupParam = selectedGroup    ? `&group=${selectedGroup}`       : '';
      const subParam   = selectedSubgroup ? `&subgroup=${selectedSubgroup}` : '';

      const [playersRes, groupsRes, paymentsRes, statsRes] = await Promise.all([
        API.get(`players/?${params}`),
        API.get('groups/'),
        API.get(`payments/?${monthParam}${groupParam}${subParam}`),
        API.get(`payments/stats/?${monthParam}${groupParam}${subParam}`)
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
      // The serializer returns subgroup as a nested object {id, name, group}
      // so we must compare against p.subgroup?.id, not p.subgroup directly
      result = result.filter(p => {
        const sgId = typeof p.subgroup === 'object' ? p.subgroup?.id : p.subgroup;
        return String(sgId) === String(selectedSubgroup);
      });
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
          } else if (key === 'amount') {
            formData.append(key, parseFloat(value) || 0);
          } else if (key !== 'receipt') {
            formData.append(key, value);
          }
        }
      });

      // Inject Academy ID if available from context
      if (adminData?.id) {
        formData.append('academy', adminData.id);
      }

      console.log("🚀 Submitting Payment Data:", Object.fromEntries(formData.entries()));

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
      console.error("❌ Payment Error:", error.response?.data);
      if (error.response?.data?.non_field_errors) {
        toast.error('This player already has a payment for this month');
      } else if (error.response?.data) {
        // Show specific field errors if available
        const errorData = error.response.data;
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = Array.isArray(errorData[firstErrorKey]) 
          ? errorData[firstErrorKey][0] 
          : JSON.stringify(errorData);
        toast.error(`${firstErrorKey}: ${errorMessage}`);
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
