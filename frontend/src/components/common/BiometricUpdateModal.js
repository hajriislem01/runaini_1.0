import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiActivity } from 'react-icons/fi';
import { LuRuler, LuScale } from 'react-icons/lu';
import API from '../../pages/api';
import toast from 'react-hot-toast';
import { usePlayer } from '../../context/PlayerContext';

const BiometricUpdateModal = ({ isOpen, onClose, player }) => {
  const { refreshPlayer } = usePlayer();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (isOpen && player) {
      setWeight(player.weight || '');
      setHeight(player.height || '');
      setApiError(null);
    }
  }, [isOpen, player]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    try {
      const payload = {
        weight: parseFloat(weight),
        height: parseFloat(height),
      };

      const oldWeight = parseFloat(player?.weight || 0);
      const newWeight = payload.weight;
      const delta = newWeight - oldWeight;

      const endpoint = player?.id ? `players/${player.id}/` : 'players/me/';
      await API.patch(endpoint, payload);

      if (refreshPlayer) await refreshPlayer();

      let msg = 'Metrics updated successfully!';
      if (oldWeight > 0) {
        if (delta > 0) {
          msg = `Weight increased healthily +${delta.toFixed(1)}kg`;
        } else if (delta < 0) {
          msg = `Weight dropped ${Math.abs(delta).toFixed(1)}kg`;
        } else {
          msg = 'Stable athletic progress, weight unchanged.';
        }
      }

      toast.success(msg);
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || err.response?.data?.error || 'Failed to update metrics.';
      setApiError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700/50 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiActivity className="text-blue-400" /> Update Biometrics
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6">

                {apiError && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                    <FiX className="flex-shrink-0" />
                    {apiError}
                  </div>
                )}

                <p className="text-gray-400 text-sm mb-6">
                  Log your latest measurements to track your physical growth and athletic development.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                      <LuRuler className="text-blue-400" /> Height (cm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-black/30 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g. 175"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">cm</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                      <LuScale className="text-emerald-400" /> Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-black/30 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g. 68.5"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiCheck size={18} /> Save Update
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BiometricUpdateModal;
