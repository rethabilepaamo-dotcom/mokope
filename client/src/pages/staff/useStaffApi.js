import { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Wraps a staff API call: supplies the token and signs the user out if the
 * session has expired (HTTP 401).
 */
export function useStaffCall() {
  const { token, logout } = useAuth();
  const toast = useToast();
  return useCallback(
    async (fn) => {
      try {
        return await fn(token);
      } catch (err) {
        if (err.status === 401) {
          toast.error('Your session has expired. Please sign in again.');
          logout();
        }
        throw err;
      }
    },
    [token, logout, toast]
  );
}
