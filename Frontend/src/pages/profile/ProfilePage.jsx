import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (isAdmin) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        const payload = { fullName: form.fullName };
        if (form.phoneNumber) payload.phoneNumber = form.phoneNumber;
        await api.put('/employees/profile', payload);
      }
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your profile information" />

      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.fullName || 'User'}</h2>
              <p className="text-sm text-gray-500 capitalize">{isAdmin ? 'Administrator' : 'Employee'}</p>
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm p-3 rounded-xl mb-4 ${message.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={form.email} disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={saving}
              type="submit"
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
