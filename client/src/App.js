import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import { configAPI } from './services/api';

function App() {
  useEffect(() => {
    // fetch runtime config (e.g., enabled AI model) and store for clients
    configAPI.getConfig().then(res => {
      if (res.data?.success) {
        localStorage.setItem('enableGpt5Mini', String(res.data.enableGpt5Mini ?? true));
        localStorage.setItem('aiModel', res.data.aiModel || 'gpt-5-mini');
      }
    }).catch(() => {
      // fail silently
    });
  }, []);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;