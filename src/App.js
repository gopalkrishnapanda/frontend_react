import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import ContactList from './components/ContactList';

const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setIsLoggedIn(false);
      }
    }
    setIsLoading(false);
  }, [authToken]);

  const handleLogin = () => {
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/contacts" element={isLoggedIn ? <ContactList /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
