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
    <nav className="topbar">
      <div className="brand">
        <div className="dot" style={{width:36,height:36,borderRadius:8,background:'linear-gradient(135deg,#2f6ef0,#7c3aed)'}}></div>
        <div>
          <h1>ED TECH TASK MANAGER</h1>
          {user && (
            <div style={{fontSize:12,color:'#6b7280'}}>
              {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{user.role === 'student' && user.teacher && ` • Teacher: ${user.teacher.email}`}
            </div>
          )}
        </div>
      </div>

      <div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;