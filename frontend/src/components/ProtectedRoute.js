import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Usage dans App.jsx :
//   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
//     <Route path="dashboard" element={<Dashboard />} />
//   </Route>
// ─────────────────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  // ── 1. Vérifier token ─────────────────────────────────────────────────────
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace/>;
  }

  // ── 2. Vérifier rôle ──────────────────────────────────────────────────────
  if (allowedRoles.length > 0) {
    let userRole = null;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      userRole = user.role;
    } catch {
      return <Navigate to="/login" replace/>;
    }

    if (!allowedRoles.includes(userRole)) {
      // Rediriger vers la bonne page selon le rôle réel
      if (userRole === 'admin')  return <Navigate to="/administration/Dashboard" replace/>;
      if (userRole === 'coach')  return <Navigate to="/coach/Dashboard"          replace/>;
      if (userRole === 'player') return <Navigate to="/players"                  replace/>;
      return <Navigate to="/login" replace/>;
    }
  }

  // ── 3. Autorisé → render les routes enfants via Outlet ────────────────────
  return <Outlet />;
};

export default ProtectedRoute;