import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

const DepartmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ departmentName: '', description: '' });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/departments/${id}`).then((res) => {
        const dept = res?.data || res;
        if (dept) setForm({ departmentName: dept.departmentName || '', description: dept.description || '' });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { departmentName: form.departmentName, description: form.description };
      if (isEdit) {
        await api.put(`/departments/${id}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      navigate('/departments');
    } catch (err) {
      alert(err.error || err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12"><Spinner /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Department' : 'Add Department'} subtitle={isEdit ? 'Update department details' : 'Create a new department'} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input type="text" required value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => navigate('/departments')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={saving} type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DepartmentFormPage;
