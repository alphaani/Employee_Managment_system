const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
    'half-day': 'bg-orange-100 text-orange-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-red-100 text-red-700',
  };

  const labels = {
    'half-day': 'Half Day',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
