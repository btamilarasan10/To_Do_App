import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react';

const Login = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Clear previous tokens
    localStorage.removeItem('token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userProfile'); // ✅ NUKE onboarding data

    try {
      const response = await api.post('auth/login/', {
        email: email.toLowerCase().trim(),
        password: password
      });

      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      setSuccess('Login successful! 🎉');
      setTimeout(() => {
        if (onSuccess) onSuccess(access, { email });

        // ✅ FORCE /app - NO ONBOARDING CHECK EVER
        navigate('/app', { replace: true });

        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your functions stay EXACTLY the same ...

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('✅ Password reset link sent to your Gmail!');
      setTimeout(() => {
        setShowForgot(false);
        setForgotEmail('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignup = () => {
    if (onClose) onClose();
    navigate('/signup');
  };

  // ... JSX stays IDENTICAL - no changes needed ...
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      {/* Your entire JSX stays EXACTLY the same */}
      <div
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-all group"
            aria-label="Close"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {showForgot ? 'Reset Password' : 'Welcome Back'}
            </h2>
          </div>

          <div className="w-12 h-12" />
        </div>

        {/* Success */}
        {success && (
          <div className="mb-8 p-5 bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-200 rounded-2xl text-emerald-800 font-semibold flex items-center space-x-3 shadow-lg">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-200 rounded-2xl text-red-800 font-semibold shadow-lg">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {!showForgot ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📧</span>
                <span>Gmail Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all shadow-sm hover:shadow-md"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>🔒</span>
                <span>Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all shadow-sm hover:shadow-md"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100/50 rounded-xl transition-all group"
                >
                  {showPassword ?
                    <EyeOff className="w-5 h-5 text-gray-500 group-hover:text-gray-700" /> :
                    <Eye className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-6 px-8 rounded-3xl text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-7 h-7" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="text-center pt-8 space-y-3">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="w-full text-indigo-600 hover:text-indigo-700 font-semibold py-3 px-6 rounded-2xl border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-center space-x-2 group"
                disabled={isLoading}
              >
                <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Forgot Password?</span>
              </button>

              <button
                type="button"
                onClick={goToSignup}
                className="w-full text-emerald-600 hover:text-emerald-700 font-semibold py-3 px-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all flex items-center justify-center space-x-2 group"
                disabled={isLoading}
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Don't have an account? Create one</span>
              </button>
            </div>
          </form>
        ) : (
          // Forgot password form (unchanged)
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <p className="text-gray-600 text-center text-lg font-medium leading-relaxed">
              Enter your Gmail and we'll send you a reset link.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📧</span>
                <span>Gmail Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 bg-white/80 text-lg font-medium transition-all shadow-sm hover:shadow-md"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading || !forgotEmail}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 px-8 rounded-3xl text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-6 h-6" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotEmail('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-gray-700 hover:text-gray-900 font-semibold py-4 px-8 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center space-x-3"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
