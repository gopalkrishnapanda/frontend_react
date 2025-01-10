// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('user7@user.com');
  const [password, setPassword] = useState('password@123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:3001/users/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: { email, password } }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', typeof(data));
        // Store the token
        localStorage.setItem('authToken', data.status.token);

        onLogin();
        navigate('/contacts');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(errorData.status.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
