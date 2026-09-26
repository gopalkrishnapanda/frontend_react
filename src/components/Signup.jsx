import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from '../config';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user: {
            email,
            password,
            password_confirmation: passwordConfirmation
          }
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const messages = data?.errors || data?.status?.message || data?.message;
        throw new Error(Array.isArray(messages) ? messages.join(', ') : messages || 'Unable to create account.');
      }

      navigate('/', { state: { signupSuccess: 'Account created. Please sign in.' } });
    } catch (signupError) {
      setError(signupError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="col-11 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header">
            <h1 className="h3 text-center mb-0">Create account</h1>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="signup-email" className="form-label">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="signup-password" className="form-label">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  minLength="6"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="signup-password-confirmation" className="form-label">Confirm password</label>
                <input
                  id="signup-password-confirmation"
                  type="password"
                  className="form-control"
                  value={passwordConfirmation}
                  onChange={event => setPasswordConfirmation(event.target.value)}
                  minLength="6"
                  required
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
            <p className="text-center mt-3 mb-0">
              Already have an account? <Link to="/">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
