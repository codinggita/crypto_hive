import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react'; // Import icons
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom toast style with gradient and animations
const customToastStyle = {
  background: 'linear-gradient(135deg, rgba(39, 39, 42, 0.9), rgba(63, 63, 70, 0.9))', // Gradient background
  color: '#ffffff', // White text
  border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
  borderRadius: '12px', // Rounded corners
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // Futuristic shadow
  backdropFilter: 'blur(10px)', // Glassmorphism effect
  padding: '16px', // Increased padding
  display: 'flex', // Flex layout
  alignItems: 'center', // Center items vertically
  gap: '12px', // Space between icon and text
};

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" /> {/* Success icon */}
            <span>Login Successful!</span>
          </div>,
          {
            style: customToastStyle,
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
          }
        );
      } else {
        await signup(email, password, username);
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" /> {/* Success icon */}
            <span>Signup Successful!</span>
          </div>,
          {
            style: customToastStyle,
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
          }
        );
      }
      onClose();
    } catch (error) {
      setError('Authentication failed');
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-400" /> {/* Error icon */}
          <span>Authentication Failed. Please try again.</span>
        </div>,
        {
          style: customToastStyle,
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeButton: false,
        }
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md bg-gray-800 rounded-xl p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-500 rounded-lg hover:opacity-90"
              >
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            {error && <div className="text-red-500 mt-4">{error}</div>}

            <p className="mt-4 text-center text-gray-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                className="text-purple-500 hover:text-purple-400"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  function toggleMode() {
    setMode((prevMode) => (prevMode === 'login' ? 'signup' : 'login'));
    setError(null);
  }
}