import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { UserPlus, LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, X } from 'lucide-react';

const Signup = ({ onClose, onShowLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const handleClose = () => {
        if (onClose) onClose();
        navigate('/');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Password match validation
        if (formData.password1 !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('auth/register/', {
                username: formData.username.trim(),
                email: formData.email.toLowerCase().trim(),
                password1: formData.password1,
                password2: formData.password2
            });

            setSuccess('Account created successfully! 🎉 Please sign in to continue.');

            setTimeout(() => {
                if (onShowLogin) onShowLogin();  // Show Login modal
                else navigate('/login');         // OR go to login page
            }, 1500);
        } catch (err) {
            console.error('Signup error:', err.response?.data);
            setError(
                err.response?.data?.email?.[0] ||
                err.response?.data?.username?.[0] ||
                err.response?.data?.password1?.[0] ||
                err.response?.data?.non_field_errors?.[0] ||
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };
    // Close on Escape key
    useEffect(() => {
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            onClick={handleClose}
        >
            <div
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {/* Back to Home - FIXED */}
                    <button
                        onClick={handleClose}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-all group"
                        aria-label="Close"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Create Account
                        </h2>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-200 rounded-2xl text-emerald-800 font-semibold flex items-center space-x-3 shadow-lg">
                        <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-200 rounded-2xl text-red-800 font-semibold shadow-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <span>👤</span>
                            <span>Username</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                placeholder="yourusername"
                                required
                                autoComplete="username"
                                minLength="3"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <span>📧</span>
                            <span>Email</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                placeholder="yourname@gmail.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <span>🔒</span>
                            <span>Password</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="password1"
                                value={formData.password1}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                minLength="8"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <span>🔄</span>
                            <span>Confirm Password</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || formData.password1 !== formData.password2 || !formData.username || !formData.email}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-6 px-8 rounded-3xl text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-7 h-7" />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>

                    {/* Back to Login */}
                    <div className="pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                if (onShowLogin) onShowLogin();  // Modal toggle
                                else navigate('/login');         // Fallback
                            }}
                            className="w-full text-indigo-600 hover:text-indigo-700 font-semibold text-lg py-4 px-6 rounded-2xl border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 flex items-center justify-center space-x-2 group"
                            disabled={isLoading}
                        >
                            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>Back to Sign In</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
