import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogIn, UserPlus, Plus, LogOut, LayoutDashboard } from 'lucide-react';
import Login from './Login.jsx';
import Signup from './Signup.jsx';

const Home = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [user, setUser] = useState(null);

    // ✅ Check login status on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            try {
                const profile = localStorage.getItem('userProfile');
                if (profile) {
                    setUser(JSON.parse(profile));
                }
            } catch (e) {
                console.error('Error parsing user profile:', e);
            }
        }
    }, []);

    const handleLoginSuccess = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('access', token);
        setUser(userData);
        setIsLoggedIn(true);
        setIsLoginOpen(false);
        // ✅ FIXED: Go to /app instead of /dashboard
        navigate('/app');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('access');
        localStorage.removeItem('userProfile');
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                TodoMaster
                            </h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    {!isLoggedIn ? (
                        <div className="hidden md:flex items-center space-x-4">
                            <button className="flex items-center space-x-2 px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100">
                                <User className="w-5 h-5" />
                                <span>About</span>
                            </button>
                            <button onClick={() => setIsLoginOpen(true)} className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all">
                                <LogIn className="w-5 h-5" />
                                <span>Login</span>
                            </button>
                            <button onClick={() => setIsSignupOpen(true)} className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all">
                                <UserPlus className="w-5 h-5" />
                                <span>Sign Up</span>
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome back, {user?.username || 'User'}!</span>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span>Dashboard</span>
                            </button>
                            <button onClick={handleLogout} className="flex items-center space-x-2 px-6 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-md hover:shadow-lg transition-all">
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
                        <button className="w-full text-left p-3 rounded-xl hover:bg-gray-100">About</button>
                        {!isLoggedIn ? (
                            <>
                                <button onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 flex items-center space-x-3">
                                    <LogIn className="w-5 h-5" />
                                    <span>Login</span>
                                </button>
                                <button onClick={() => { setIsSignupOpen(true); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 flex items-center space-x-3 bg-emerald-50 border-r-4 border-emerald-500">
                                    <UserPlus className="w-5 h-5" />
                                    <span>Sign Up</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 flex items-center space-x-3 bg-indigo-50 border-r-4 border-indigo-500">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </button>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 flex items-center space-x-3 bg-red-50 border-r-4 border-red-500">
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Welcome Content */}
            <main className="max-w-4xl mx-auto px-6 py-24 text-center">
                <div className="space-y-8">
                    <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
                        Master Your <span className="text-8xl block">Tasks</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Build better habits with TodoMaster. Organize your day, track progress,
                        and achieve your goals with our clean, powerful task manager.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12">
                        <button onClick={() => setIsSignupOpen(true)} className="group flex items-center justify-center space-x-3 px-10 py-6 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 min-w-[200px]">
                            <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" />
                            <span>🚀 Start Free</span>
                        </button>
                        <button onClick={() => setIsLoginOpen(true)} className="group flex items-center justify-center space-x-3 px-10 py-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 min-w-[200px]">
                            <LogIn className="w-7 h-7 group-hover:scale-110 transition-transform" />
                            <span>Login</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
                        <div className="p-8 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                            <div className="text-4xl font-black text-indigo-600 mb-3 group-hover:scale-110 transition-transform">10K+</div>
                            <div className="text-gray-700 font-bold text-lg">Happy Users</div>
                        </div>
                        <div className="p-8 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                            <div className="text-4xl font-black text-purple-600 mb-3 group-hover:scale-110 transition-transform">50K+</div>
                            <div className="text-gray-700 font-bold text-lg">Tasks Completed</div>
                        </div>
                        <div className="p-8 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                            <div className="text-4xl font-black text-blue-600 mb-3 group-hover:scale-110 transition-transform">99.9%</div>
                            <div className="text-gray-700 font-bold text-lg">Uptime</div>
                        </div>
                    </div>
                </div>
            </main>

            {isLoginOpen && (
                <Login onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
            )}
            {isSignupOpen && (  // ✅ ADD THIS BLOCK
                <Signup
                    onClose={() => setIsSignupOpen(false)}
                    onShowLogin={() => {
                        setIsSignupOpen(false);
                        setIsLoginOpen(true);
                    }}
                />
            )}
        
        </div>
    );
};

export default Home;
