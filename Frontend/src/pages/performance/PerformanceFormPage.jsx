import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

const PerformanceFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', employeeName: '', rating: '3', evaluationDate: '', feedback: '',
  });

  useEffect(() => {
    api.get('/employees', { params: { limit: 200 } }).then((res) => {
      setEmployees(res?.data || res || []);
    });
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/performance/${id}`).then((res) => {
        const perf = res?.data || res;
        if (perf) setForm({
          employeeId: perf.employeeId?._id || perf.employeeId || '',
          employeeName: perf.employeeId?.fullName || '',
          rating: String(perf.rating || 3),
          evaluationDate: perf.evaluationDate ? perf.evaluationDate.slice(0, 10) : '',
          feedback: perf.feedback || '',
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const filteredEmployees = employees.filter((e) =>
    e.fullName?.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.email?.toLowerCase().includes(empSearch.toLowerCase())
  );

  const selectEmployee = (emp) => {
    setForm({ ...form, employeeId: emp._id, employeeName: emp.fullName });
    setEmpSearch(emp.fullName);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { employeeId: form.employeeId, rating: Number(form.rating), evaluationDate: form.evaluationDate, feedback: form.feedback };
      if (isEdit) await api.put(`/performance/${id}`, payload);
      else await api.post('/performance', payload);
      navigate('/performance');
    } catch (err) {
      alert(err.error || err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12"><Spinner /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Evaluation' : 'New Evaluation'} subtitle="Performance review form" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={isEdit ? form.employeeName : empSearch}
                onChange={(e) => { setEmpSearch(e.target.value); setShowDropdown(true); setForm({ ...form, employeeId: '', employeeName: '' }); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="Search employee by name..."
                disabled={isEdit}
              />
            </div>
            {showDropdown && !isEdit && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No employees found</div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp._id}
                      type="button"
                      onMouseDown={() => selectEmployee(emp)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-medium">
                        {emp.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{emp.fullName}</span>
                        <span className="text-gray-400 ml-2 text-xs">{emp.email}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Date</label>
              <input type="date" required value={form.evaluationDate} onChange={(e) => setForm({ ...form, evaluationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea rows={4} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => navigate('/performance')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={saving || !form.employeeId} type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PerformanceFormPage;
