import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">EdTech Task Manager</h1>
            {user && (
              <p className="text-sm text-indigo-200">
                {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                {user.role === 'student' && user.teacher && ` • Teacher: ${user.teacher.email}`}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;