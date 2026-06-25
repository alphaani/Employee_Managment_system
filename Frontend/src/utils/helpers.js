export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    present: 'green',
    absent: 'red',
    late: 'yellow',
    'half-day': 'orange',
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    paid: 'green',
    unpaid: 'red',
  };
  return colors[status] || 'gray';
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
