import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineX, HiOutlineCurrencyDollar } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/helpers';
import api from '../../services/api';

const PayrollFormPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [form, setForm] = useState({
    employeeId: '', generateAll: false, basicSalary: '', bonus: '0',
    overtimeHours: '0', overtimeRate: '0',
    deduction: '0', tax: '0',
    otherDeductions: [],
    paymentMethod: 'bank', bankName: '', bankAccount: '',
    month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    status: 'pending',
  });

  useEffect(() => {
    api.get('/employees', { params: { limit: 100 } }).then((res) => {
      setEmployees(res?.data || res || []);
    }).catch(() => {}).finally(() => setLoadingEmps(false));
  }, []);

  const calculations = useMemo(() => {
    const basic = Number(form.basicSalary) || 0;
    const bonus = Number(form.bonus) || 0;
    const otHours = Number(form.overtimeHours) || 0;
    const otRate = Number(form.overtimeRate) || 0;
    const deduct = Number(form.deduction) || 0;
    const tax = Number(form.tax) || 0;
    const other = (form.otherDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const overtimePay = otHours * otRate;
    const gross = basic + bonus + overtimePay;
    const totalDed = deduct + tax + other;
    const net = gross - totalDed;
    return { overtimePay, gross, totalDed, net };
  }, [form]);

  const addOtherDeduction = () => {
    setForm({ ...form, otherDeductions: [...(form.otherDeductions || []), { label: '', amount: '' }] });
  };

  const updateOtherDeduction = (index, field, value) => {
    const list = [...(form.otherDeductions || [])];
    list[index] = { ...list[index], [field]: value };
    setForm({ ...form, otherDeductions: list });
  };

  const removeOtherDeduction = (index) => {
    const list = [...(form.otherDeductions || [])];
    list.splice(index, 1);
    setForm({ ...form, otherDeductions: list });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/payroll', {
        ...form,
        basicSalary: Number(form.basicSalary),
        bonus: Number(form.bonus),
        overtimeHours: Number(form.overtimeHours),
        overtimeRate: Number(form.overtimeRate),
        deduction: Number(form.deduction),
        tax: Number(form.tax),
        otherDeductions: (form.otherDeductions || []).map((d) => ({ label: d.label, amount: Number(d.amount) || 0 })),
        month: Number(form.month),
        year: Number(form.year),
        generateAll: form.generateAll || undefined,
        employeeId: form.generateAll ? undefined : form.employeeId || undefined,
      });
      navigate('/payroll');
    } catch (err) {
      alert(err.error || err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Generate Payroll" subtitle="Create payroll records with full breakdown" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.generateAll}
                onChange={(e) => setForm({ ...form, generateAll: e.target.checked, employeeId: '' })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Generate for all active employees</span>
            </label>
          </div>

          {!form.generateAll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              {loadingEmps ? (
                <Spinner />
              ) : (
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    required
                    value={form.employeeId}
                    onChange={(e) => {
                      const emp = employees.find((em) => em._id === e.target.value);
                      setForm({ ...form, employeeId: e.target.value, basicSalary: emp?.salary || form.basicSalary });
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm appearance-none bg-white"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullName} — {emp.position || 'No position'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" required min="2020" max="2100" value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Earnings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary ($)</label>
                <input type="number" required value={form.basicSalary}
                  onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonus ($)</label>
                <input type="number" value={form.bonus}
                  onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                <input type="number" min="0" value={form.overtimeHours}
                  onChange={(e) => setForm({ ...form, overtimeHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" placeholder="e.g. 10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate ($/hr)</label>
                <input type="number" min="0" value={form.overtimeRate}
                  onChange={(e) => setForm({ ...form, overtimeRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" placeholder="e.g. 25" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Deductions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions ($)</label>
                <input type="number" value={form.deduction}
                  onChange={(e) => setForm({ ...form, deduction: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ($)</label>
                <input type="number" min="0" value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Additional Deductions</label>
                <button type="button" onClick={addOtherDeduction}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                  <HiOutlinePlus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {(form.otherDeductions || []).map((d, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input type="text" placeholder="Label" value={d.label}
                    onChange={(e) => updateOtherDeduction(i, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                  <input type="number" placeholder="Amount" min="0" value={d.amount}
                    onChange={(e) => updateOtherDeduction(i, 'amount', e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                  <button type="button" onClick={() => removeOtherDeduction(i)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              {form.paymentMethod === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" value={form.bankAccount}
                      onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overtime Pay</span>
              <span className="font-medium text-gray-900">{formatCurrency(calculations.overtimePay)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gross Pay</span>
              <span className="font-medium text-gray-900">{formatCurrency(calculations.gross)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Deductions</span>
              <span className="font-medium text-red-600">-{formatCurrency(calculations.totalDed)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="text-base font-semibold text-gray-900">Net Pay</span>
              <span className="text-base font-bold text-primary-600">{formatCurrency(calculations.net)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Absence deductions (from attendance) and employee salary will be applied on server.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => navigate('/payroll')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={saving} type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
              {saving ? 'Generating...' : 'Generate Payroll'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PayrollFormPage;
