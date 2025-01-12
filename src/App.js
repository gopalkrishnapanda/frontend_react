import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import ContactList from './components/ContactList';
import Navbar from './components/Navbar'; // Import Navbar

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
          localStorage.removeItem('userId'); // Remove user ID as well
          setAuthToken(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId'); // Remove user ID as well
        setAuthToken(null);
        setIsLoggedIn(false);
      }
    }
    setIsLoading(false);
  }, [authToken]);

  const handleLogin = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // Retrieve user ID
    setAuthToken(token);
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <NavbarWithConditionalRendering /> {/* Conditionally render Navbar */}
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/contacts" element={isLoggedIn ? <ContactList /> : <Navigate to="/" />} />
        {/* Add an About page route if needed */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

// Component to conditionally render Navbar
const NavbarWithConditionalRendering = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return showNavbar ? <Navbar /> : null;
};

// About Component (Add a simple About component for demonstration)
const About = () => (
  <div className="container mt-5">
    <h1>About</h1>
    <p>This is the About page for MyApp.</p>
  </div>
);

export default App;
