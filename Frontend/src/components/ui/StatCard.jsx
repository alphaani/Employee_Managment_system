import { motion } from 'framer-motion';
import { HiOutlineArrowSmUp, HiOutlineArrowSmDown } from 'react-icons/hi';

const gradients = {
  primary: 'from-blue-500 to-indigo-600',
  green: 'from-emerald-400 to-teal-500',
  yellow: 'from-amber-400 to-orange-500',
  red: 'from-rose-400 to-red-500',
  purple: 'from-violet-400 to-purple-500',
  blue: 'from-cyan-400 to-blue-500',
};

const lightBg = {
  primary: 'bg-blue-50',
  green: 'bg-emerald-50',
  yellow: 'bg-amber-50',
  red: 'bg-rose-50',
  purple: 'bg-violet-50',
  blue: 'bg-cyan-50',
};

const iconColors = {
  primary: 'text-blue-600',
  green: 'text-emerald-600',
  yellow: 'text-amber-600',
  red: 'text-rose-600',
  purple: 'text-violet-600',
  blue: 'text-cyan-600',
};

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, onClick, variant = 'default', subtitle }) => {
  if (variant === 'gradient') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl p-5 text-white cursor-pointer bg-gradient-to-br ${gradients[color] || gradients.primary}`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-6 translate-y-6 bg-white/10 rounded-full" />
        <div className="relative flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/80">{title}</span>
          {Icon && <Icon className="w-5 h-5 text-white/70" />}
        </div>
        <div className="relative flex items-end justify-between">
          <span className="text-3xl font-bold">{value}</span>
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-sm font-medium ${trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend >= 0 ? <HiOutlineArrowSmUp className="w-4 h-4" /> : <HiOutlineArrowSmDown className="w-4 h-4" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && <p className="relative mt-1 text-xs text-white/60">{subtitle}</p>}
      </motion.div>
    );
  }

  if (variant === 'glass') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`backdrop-blur-xl bg-white/70 border border-white/30 rounded-2xl p-5 shadow-lg shadow-black/5 ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          {Icon && (
            <div className={`p-2.5 rounded-xl ${lightBg[color] || lightBg.primary}`}>
              <Icon className={`w-5 h-5 ${iconColors[color] || iconColors.primary}`} />
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <HiOutlineArrowSmUp className="w-4 h-4" /> : <HiOutlineArrowSmDown className="w-4 h-4" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${lightBg[color] || lightBg.primary}`}>
            <Icon className={`w-5 h-5 ${iconColors[color] || iconColors.primary}`} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <HiOutlineArrowSmUp className="w-4 h-4" /> : <HiOutlineArrowSmDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </motion.div>
  );
};

export default StatCard;
