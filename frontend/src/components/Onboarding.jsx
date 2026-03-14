import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { ArrowRight, Check, User, Loader2 } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✅ Fetch avatars from Django backend
    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await api.get('profile/avatars/');
                console.log('API Response:', response.data);

                const avatarList = response.data.avatars || response.data || [];
                setAvatars(Array.isArray(avatarList) ? avatarList : []);
            } catch (err) {
                console.error('Error fetching avatars:', err);
                setError('Failed to load avatars. Using fallback.');
                setAvatars([
                    { id: 'avatar1', image: 'http://127.0.0.1:8000/static/avatars/avatar1.jpg', name: 'Developer' },
                    { id: 'avatar2', image: 'http://127.0.0.1:8000/static/avatars/avatar2.jpg', name: 'Designer' },
                    { id: 'avatar3', image: 'http://127.0.0.1:8000/static/avatars/avatar3.jpg', name: 'Founder' },
                    { id: 'avatar4', image: 'http://127.0.0.1:8000/static/avatars/avatar4.jpg', name: 'Builder' },
                    { id: 'avatar5', image: 'http://127.0.0.1:8000/static/avatars/avatar5.jpg', name: 'Fullstack' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAvatars();
    }, []);

    // ✅ FIXED: Send CORRECT data format
    const completeOnboarding = async () => {
        if (!selectedAvatar) return;

        try {
            // 🚨 FIXED: avatar_id instead of avatar + use selectedAvatar (which is already the ID)
            await api.post('profile/select_avatar/', {
                avatar_id: selectedAvatar  // ← THIS WAS THE PROBLEM!
            });

            localStorage.setItem('userProfile', JSON.stringify({
                avatar: selectedAvatar,
                completed: true
            }));

            navigate('/app');
        } catch (err) {
            console.error('Error saving avatar:', err);
            console.log('Error details:', err.response?.data); // Better debugging
            localStorage.setItem('userProfile', JSON.stringify({
                avatar: selectedAvatar,
                completed: true
            }));
            navigate('/app');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-4" />
                    <p className="text-xl text-gray-300">Loading your avatars...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-4xl w-full border border-white/20 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-28 h-28 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-white/30">
                        <User className="w-14 h-14 text-white" />
                    </div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6">
                        Choose Your Avatar
                    </h1>
                    <p className="text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed">
                        Pick your favorite avatar from our collection. You can change it anytime!
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-red-200 font-medium flex items-center space-x-3">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Avatar Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
                    {Array.isArray(avatars) && avatars.length > 0 ? (
                        avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.id)}
                                className={`group relative p-4 rounded-3xl h-40 flex flex-col items-center justify-center transition-all duration-500 border-4 shadow-2xl hover:shadow-3xl ${selectedAvatar === avatar.id
                                        ? 'border-emerald-400 bg-emerald-500/30 ring-8 ring-emerald-400/40 scale-110'
                                        : 'border-white/20 bg-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:scale-105'
                                    }`}
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 mb-4 shadow-xl group-hover:shadow-2xl transition-all">
                                    <img
                                        src={avatar.image}
                                        alt={avatar.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="w-full h-full flex items-center justify-center text-3xl hidden bg-gradient-to-br from-gray-700 to-gray-800">
                                        👤
                                    </div>
                                </div>
                                <span className="font-bold text-lg text-white text-center px-2 truncate">
                                    {avatar.name || `Avatar ${avatar.id}`}
                                </span>
                                {selectedAvatar === avatar.id && (
                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/90 animate-bounce">
                                        <Check className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-xl text-gray-300">No avatars available</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-12">
                    <button
                        onClick={() => navigate('/app')}
                        className="flex-1 bg-gray-600/40 backdrop-blur-sm text-white font-black py-6 px-8 rounded-3xl border-2 border-white/30 hover:bg-gray-700/60 hover:border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 text-lg"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={completeOnboarding}
                        disabled={!selectedAvatar || loading}
                        className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black py-6 px-8 rounded-3xl shadow-3xl hover:shadow-4xl hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 text-xl"
                    >
                        <ArrowRight className="w-7 h-7" />
                        <span>Continue to Tasks</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
