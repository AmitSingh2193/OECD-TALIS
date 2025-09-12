import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { login } from '../state/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const dispatch = useAppDispatch();
  const { error: authError } = useAppSelector((state) => state.auth);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setLoginError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(password)) {
      setLoginError('Password must be at least 6 characters long');
      return;
    }
    setLoginError('');
    
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/home'); 
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 bg-gray-100">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="mb-6 text-center dark:text-white text-gray-800 font-semibold">Log In</h2>
        
        {(loginError ?? authError) && (
          <p className="text-red-500 dark:text-red-400 mb-4 text-center">{loginError ?? authError}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-gray-200"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-gray-200"
        />

        <button
          onClick={handleLogin}
          className="w-full p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg cursor-pointer font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
