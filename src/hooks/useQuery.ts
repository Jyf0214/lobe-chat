import qs from 'query-string';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to get query parameters as an object
 */
export const useQuery = () => {
  const [rawQuery] = useSearchParams();
  return useMemo(() => qs.parse(rawQuery.toString()), [rawQuery]);
};
