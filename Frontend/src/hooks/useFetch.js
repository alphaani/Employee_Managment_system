import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFetch = (urlOrFn, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const { immediate = true, params = {}, deps = [] } = options;
  const isFn = typeof urlOrFn === 'function';

  const fetchData = useCallback(async (queryParams) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isFn) {
        response = await urlOrFn();
      } else {
        response = await api.get(urlOrFn, { params: queryParams || params });
      }
      setPagination(response?.pagination || null);
      setData(response?.data ?? response);
    } catch (err) {
      setError(err?.response?.data?.message || err.error || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, isFn ? deps : [urlOrFn]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, pagination, refetch: fetchData };
};
