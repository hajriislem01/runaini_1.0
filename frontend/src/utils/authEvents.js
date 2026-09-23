/**
 * authEvents.js
 *
 * A tiny pub/sub bridge so that context providers can react to login/logout
 * actions without a full page reload.
 *
 * Usage
 * ─────
 * After writing auth data to localStorage:
 *   dispatchAuthChange();           // e.g. in LoginForm after successful login
 *   dispatchAuthChange('logout');   // e.g. in sidebar handleLogout
 *
 * Inside a provider:
 *   useEffect(() => {
 *     window.addEventListener('auth-change', handleAuthChange);
 *     return () => window.removeEventListener('auth-change', handleAuthChange);
 *   }, [handleAuthChange]);
 */

export const AUTH_CHANGE_EVENT = 'auth-change';

/**
 * Dispatches a custom window event that all context providers listen to.
 * @param {'login'|'logout'} type - optional sub-type for the event detail
 */
export const dispatchAuthChange = (type = 'login') => {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: { type } }));
};
