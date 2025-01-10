// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ContactList from './components/ContactList';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Token in localStorage:', token); // Debugging line
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/contacts"
          element={isLoggedIn ? <ContactList /> : <Navigate to="/" />}
        />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
