import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBell, HiOutlineGlobe, HiOutlineColorSwatch,
  HiOutlineSave, HiOutlineCheckCircle,
} from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';

const STORAGE_KEY = 'ems_settings';

const defaults = {
  companyName: 'My Company',
  timezone: 'UTC (Coordinated Universal Time)',
  currency: 'USD ($)',
  theme: 'Light',
  notifyLeave: true,
  notifyAttendance: true,
  notifyPayroll: false,
  notifyReview: true,
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...defaults, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage system preferences" />

      <div className="max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-50">
              <HiOutlineGlobe className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={settings.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
              <select value={settings.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                <option>UTC (Coordinated Universal Time)</option>
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>America/Denver</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={settings.currency}
                onChange={(e) => update('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>JPY (¥)</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-50">
              <HiOutlineBell className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: 'notifyLeave', label: 'Email notifications for leave requests' },
              { key: 'notifyAttendance', label: 'Attendance reminders' },
              { key: 'notifyPayroll', label: 'Payroll processing alerts' },
              { key: 'notifyReview', label: 'Performance review reminders' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings[item.key]}
                  onChange={(e) => update(item.key, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <HiOutlineColorSwatch className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-3">
              {['Light', 'Dark', 'System'].map((theme) => (
                <label key={theme} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="theme" checked={settings.theme === theme}
                    onChange={() => update('theme', theme)}
                    className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">{theme}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            {saved ? <HiOutlineCheckCircle className="w-4 h-4" /> : <HiOutlineSave className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
