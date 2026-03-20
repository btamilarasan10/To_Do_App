import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { Plus, ChevronLeft, LogOut, Edit, Trash2, Check, Clock, Search, Star, User, Mail, Lock, Shield, Calendar, CheckCircle, Upload, X, Loader2 } from 'lucide-react';


const MainApp = () => {
    const navigate = useNavigate();
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [userName, setUserName] = useState('Loading...');
    const [selectedList, setSelectedList] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [newTask, setNewTask] = useState({
        title: '', description: '', due_datetime: '', priority: 'medium'
    });
    const [showNewTask, setShowNewTask] = useState(false);
    const [showNewList, setShowNewList] = useState(false);
    const [newList, setNewList] = useState({ name: '', color: '#3B82F6' });
    const [editingListId, setEditingListId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0 });
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState('avatar');
    const [oldPassword, setOldPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // ✅ NEW: Onboarding-style avatar states
    const [avatars, setAvatars] = useState([]);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(null);


    useEffect(() => {
        fetchAllData();
    }, []);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        fullname: '',      // ✅ Backend field name
        bio: '',
        email: '',
        oldpassword: '',   // ✅ Frontend state
        newpassword: '',
        newpasswordconfirm: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    // ✅ FIXED: Onboarding-style avatar fetching
    const fetchAvatars = async () => {
        try {
            setAvatarLoading(true);
            setAvatarError('');
            const response = await api.get('profile/avatars/');
            console.log('API Response:', response.data);

            const avatarList = response.data.avatars || response.data || [];
            setAvatars(Array.isArray(avatarList) ? avatarList : []);
        } catch (err) {
            console.error('Error fetching avatars:', err);
            setAvatarError('Failed to load avatars. Using fallback.');
            setAvatars([
                { id: 'avatar1', image: 'http://127.0.0.1:8000/static/avatars/avatar1.jpg', name: 'Developer' },
                { id: 'avatar2', image: 'http://127.0.0.1:8000/static/avatars/avatar2.jpg', name: 'Designer' },
                { id: 'avatar3', image: 'http://127.0.0.1:8000/static/avatars/avatar3.jpg', name: 'Founder' },
                { id: 'avatar4', image: 'http://127.0.0.1:8000/static/avatars/avatar4.jpg', name: 'Builder' },
                { id: 'avatar5', image: 'http://127.0.0.1:8000/static/avatars/avatar5.jpg', name: 'Fullstack' },
            ]);
        } finally {
            setAvatarLoading(false);
        }
    };

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.clear();  // ✅ Clear everything
                navigate('/');
                return;
            }

            // ✅ VALIDATE TOKEN FIRST
            try {
                await api.get('profile/me/');
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.clear();
                    navigate('/');
                    return;
                }
                throw error;  // Other errors continue
            }

            const [profileRes, statsRes, listsRes, tasksRes] = await Promise.all([
                api.get('profile/me/'),
                api.get('tasks/stats/').catch(() => ({ data: { today: 0, pending: 0, completed: 0 } })),
                api.get('lists/').catch(() => ({ data: [] })),
                api.get('tasks/').catch(() => ({ data: [] }))
            ]);

            const profileData = profileRes.data.profile || profileRes.data;
            setProfile(profileData);
            setUserName(profileData.user?.username || profileData.username || 'User');
            localStorage.setItem('userProfile', JSON.stringify(profileData));

            setStats(statsRes.data);
            setLists(listsRes.data);
            setTasks(tasksRes.data);

            if (listsRes.data.length > 0) {
                setSelectedList(listsRes.data[0]);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate('/');
            }
        }
    };

    // ✅ FIXED: No params, no circular refs!
    const uploadAvatarFile = async () => {
        if (!avatarFile) return;

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            setUploadingAvatar(true);
            await api.post('profile/avatar/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchAllData();
            setShowAvatarModal(false);
            setAvatarFile(null);
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // ✅ FIXED: Select avatar from gallery (no circular refs)
    const selectAvatar = async (avatarId) => {
        try {
            await api.post('profile/select_avatar/', {
                avatar_id: avatarId
            });
            fetchAllData();
            setShowAvatarModal(false);
        } catch (error) {
            console.error('Avatar selection failed:', error);
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/');
    };

    const createList = async (e) => {
        e.preventDefault();
        if (!newList.name.trim()) return;
        try {
            if (editingListId) {
                await api.patch(`lists/${editingListId}/`, newList);
                setEditingListId(null);
            } else {
                await api.post('lists/', newList);
            }
            setNewList({ name: '', color: '#3B82F6' });
            setShowNewList(false);
            fetchAllData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createTask = async (e) => {
        e.preventDefault();
        if (!selectedList || !newTask.title.trim()) return;
        try {
            if (editingTaskId) {
                await api.patch(`tasks/${editingTaskId}/`, {
                    list: selectedList.id,
                    title: newTask.title,
                    description: newTask.description,
                    due_datetime: newTask.due_datetime,
                    priority: newTask.priority
                });
                setEditingTaskId(null);
            } else {
                await api.post('tasks/', {
                    list: selectedList.id,
                    title: newTask.title,
                    description: newTask.description,
                    due_datetime: newTask.due_datetime,
                    priority: newTask.priority
                });
            }
            setNewTask({ title: '', description: '', due_datetime: '', priority: 'medium' });
            setShowNewTask(false);
            fetchAllData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const finishTask = async (taskId) => {
        try {
            await api.post(`tasks/${taskId}/finish/`, {});
            fetchAllData();
        } catch (error) {
            console.error('Error finishing task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await api.delete(`tasks/${taskId}/delete/`);
            fetchAllData();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const deleteList = async (listId) => {
        try {
            await api.delete(`lists/${listId}/`);
            fetchAllData();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    const editList = (list) => {
        setEditingListId(list.id);
        setNewList({ name: list.name, color: list.color });
        setShowNewList(true);
    };

    const editTask = (task) => {
        setEditingTaskId(task.id);
        setNewTask({
            title: task.title,
            description: task.description,
            due_datetime: task.due_datetime,
            priority: task.priority
        });
        setShowNewTask(true);
    };

    const getAvatarDisplay = () => {
        if (!profile) return userName.charAt(0).toUpperCase();

        if (profile.avatar_url) {
            return (
                <img
                    src={`http://127.0.0.1:8000${profile.avatar_url}`}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `http://127.0.0.1:8000/static/avatars/default.jpg`;
                    }}
                />
            );
        }

        if (profile.avatar_id) {
            const avatarUrl = `http://127.0.0.1:8000/static/avatars/avatar${profile.avatar_id}.jpg`;
            return (
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `http://127.0.0.1:8000/static/avatars/default.jpg`;
                    }}
                />
            );
        }

        return profile.user?.username?.charAt(0).toUpperCase() || 'U';
    };

    // ✅ NEW: Open avatar modal with avatars loaded
    const openAvatarModal = () => {
        setSelectedAvatar(null);
        fetchAvatars();
        setShowAvatarModal(true);
    };

    const getListProgress = (listId) => {
        const listTasks = tasks.filter(t => t.list === listId);
        if (!listTasks.length) return 0;
        const completed = listTasks.filter(t => t.status === 'done').length;
        return Math.round((completed / listTasks.length) * 100);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-300 border-red-400/50';
            case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
            case 'low': return 'bg-green-500/20 text-green-300 border-green-400/50';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
        }
    };

    const todayTasks = tasks.filter(task =>
        new Date(task.due_datetime).toDateString() === new Date().toDateString() &&
        task.status !== 'done'
    );
    const pendingTasks = tasks.filter(task => task.status !== 'done' && task.status !== 'deleted');
    const completedTasks = tasks.filter(task => task.status === 'done').slice(0, 5);
    const upcomingTasks = tasks
        .filter(task => task.status !== 'done' && task.status !== 'deleted')
        .filter(task => new Date(task.due_datetime) > new Date())
        .sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime))
        .slice(0, 5);
    // ✅ ADD THIS ENTIRE FUNCTION

    const handleEditProfile = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');

        try {
            // 1. PROFILE INFO (always try - safe if empty)
            if (editForm.fullname?.trim() || editForm.bio?.trim()) {
                await api.put('/profile/me/', {
                    full_name: editForm.fullname?.trim() || '',  // ✅ Backend field name
                    bio: editForm.bio?.trim() || ''
                });
            }

            // 2. EMAIL CHANGE (Email tab active)
            if (newEmail?.trim() && oldPassword?.trim() && activeTab === 'email') {
                await api.patch('/profile/update_email/', {
                    new_email: newEmail.trim(),
                    password: oldPassword.trim()
                });
                setNewEmail('');  // Clear immediately
            }

            // 3. PASSWORD CHANGE (Password tab active)  
            if (newPassword?.trim() && confirmPassword?.trim() && oldPassword?.trim() && activeTab === 'password') {
                if (newPassword !== confirmPassword) {
                    setEditError('New passwords do not match!');
                    return;
                }
                if (newPassword.length < 8) {
                    setEditError('Password must be 8+ characters!');
                    return;
                }
                await api.patch('/profile/change_password/', {
                    old_password: oldPassword.trim(),
                    new_password: newPassword.trim(),
                    new_password_confirm: confirmPassword.trim()
                });
                setNewPassword('');
                setConfirmPassword('');
            }

            // ✅ SUCCESS - Refresh everything
            await fetchAllData();
            setShowEditProfile(false);
            setEditError('✅ Profile updated successfully!');

            // Reset ALL forms
            setNewEmail('');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setEditForm({ fullname: '', bio: '', email: '', oldpassword: '', newpassword: '', newpasswordconfirm: '' });

        } catch (error) {
            console.error('Update failed:', error.response?.data);
            const errorMsg = error.response?.data;

            // Better error messages
            if (errorMsg?.old_password) setEditError('Old password incorrect!');
            else if (errorMsg?.new_email) setEditError('Email already exists or invalid!');
            else if (errorMsg?.new_password) setEditError('Password too weak! Use 8+ chars.');
            else setEditError(errorMsg?.detail || 'Update failed. Try again.');

        } finally {
            setEditLoading(false);
        }
    };

    // 👇 ADD THIS RIGHT AFTER
    const handleTabSubmit = handleEditProfile;







    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            {/* ✅ FIXED AVATAR MODAL - File Upload + Gallery */}
            {/* 🔥 AVATAR SELECTION MODAL */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
                    <div className="bg-gradient-to-b from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl border border-white/20 w-full max-w-4xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                Choose Your Avatar
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAvatarModal(false);
                                    setAvatarFile(null);
                                    setSelectedAvatar(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-xl"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* FILE UPLOAD */}
                        <div className="mb-12">
                            <h4 className="text-xl font-bold mb-6 text-center">Upload Custom Avatar</h4>
                            <div className="w-48 h-48 mx-auto rounded-3xl border-4 border-dashed border-white/30 bg-white/5 flex flex-col items-center justify-center p-8 group hover:border-emerald-400/50 cursor-pointer mb-6"
                                onClick={() => document.getElementById('avatar-upload')?.click()}>
                                {avatarFile ? (
                                    <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full rounded-2xl object-cover" />
                                ) : (
                                    <>
                                        <Upload className="w-16 h-16 text-gray-400 group-hover:text-emerald-400 mb-4" />
                                        <p className="text-gray-400 text-lg font-semibold">Click to upload image</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                            <button
                                onClick={uploadAvatarFile}
                                disabled={!avatarFile || uploadingAvatar}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-black py-3 px-8 rounded-2xl shadow-2xl mx-auto block"
                            >
                                {uploadingAvatar ? 'Uploading...' : 'Upload Custom Avatar'}
                            </button>
                        </div>

                        {/* AVATAR GALLERY */}
                        <div className="border-t border-white/20 pt-8">
                            <h4 className="text-xl font-bold mb-6 text-center">Or Choose from Gallery</h4>
                            {avatarLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                                    <p className="text-xl text-gray-300">Loading avatars...</p>
                                </div>
                            ) : avatarError ? (
                                <div className="p-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-red-200 font-medium flex items-center space-x-3 mb-8">
                                    <span>⚠️</span>
                                    <span>{avatarError}</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {avatars.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => selectAvatar(avatar.id)}
                                            className={`group relative p-4 rounded-3xl h-32 flex flex-col items-center justify-center transition-all duration-500 border-4 shadow-2xl hover:shadow-3xl ${profile?.avatar_id === avatar.id
                                                ? 'border-emerald-400 bg-emerald-500/30 ring-4 ring-emerald-400/40 scale-105'
                                                : 'border-white/20 bg-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:scale-105'
                                                }`}
                                        >
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 mb-3 shadow-xl group-hover:shadow-2xl transition-all">
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
                                            <span className="font-bold text-sm text-white text-center px-1 truncate">
                                                {avatar.name || `Avatar ${avatar.id}`}
                                            </span>
                                            {profile?.avatar_id === avatar.id && (
                                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl border-3 border-white animate-pulse">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showEditProfile && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-start pt-20 px-4 sm:pt-24 justify-center p-4">
                    <div className="bg-gradient-to-b from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl border border-white/20 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-3xl mx-4">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/50 backdrop-blur-xl pt-4 z-10 border-b border-white/10 pb-6">
                            <h3 className="text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                Edit Profile
                            </h3>
                            <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-white/10 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* ERROR */}
                        {editError && (
                            <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-red-200 mb-6 flex items-center space-x-3">
                                <span>⚠️</span><span>{editError}</span>
                            </div>
                        )}

                        {/* 🔥 TAB BUTTONS */}
                        <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20 mb-8">
                            <button
                                onClick={() => {
                                    // Reset tab states first
                                    setActiveTab('avatar');
                                    setOldPassword('');
                                    setNewEmail('');
                                    setNewPassword('');
                                    setConfirmPassword('');

                                    setEditForm({
                                        fullname: profile?.fullname || '',
                                        bio: profile?.bio || '',
                                        email: profile?.user?.email || '',
                                        oldpassword: '',
                                        newpassword: '',
                                        newpasswordconfirm: ''
                                    });
                                    setShowEditProfile(true);
                                }}
                            >
                                <User className="w-5 h-5 inline mr-2" /> Avatar
                            </button>
                            <button
                                onClick={() => setActiveTab('email')}
                                className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all ${activeTab === 'email'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'text-white hover:bg-white/20'
                                    }`}
                            >
                                <Mail className="w-5 h-5 inline mr-2" /> Gmail
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all ${activeTab === 'password'
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'text-white hover:bg-white/20'
                                    }`}
                            >
                                <Lock className="w-5 h-5 inline mr-2" /> Password
                            </button>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => handleTabSubmit(e)}>
                            {/* 🔥 TAB 1: AVATAR */}
                            {activeTab === 'avatar' && (
                                <div className="text-center space-y-6">
                                    <h4 className="text-2xl font-black text-emerald-400 mb-8 flex items-center justify-center gap-3">
                                        <User className="w-7 h-7" />
                                        Profile Picture
                                    </h4>
                                    <div className="max-w-sm mx-auto">
                                        <div className="w-36 h-36 mx-auto p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full shadow-2xl border-4 border-white/20 group hover:border-emerald-400/50 hover:shadow-emerald-500/25 transition-all duration-300"
                                            onClick={openAvatarModal}>
                                            <div className="w-full h-full rounded-full overflow-hidden shadow-xl relative">
                                                {getAvatarDisplay()}
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full">
                                                    <Upload className="w-10 h-10 text-emerald-300 animate-bounce" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 mt-4 text-sm font-medium">Click to change your avatar</p>
                                        <p className="text-xs text-gray-500 mt-1">Supports custom uploads & gallery</p>
                                    </div>
                                </div>
                            )}


                            {/* 🔥 TAB 2: EMAIL */}
                            {activeTab === 'email' && (
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                                        <Mail className="w-5 h-5" /> Change Email
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="email"
                                            placeholder="New Email Address"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-lg focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-lg focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 🔥 TAB 3: PASSWORD */}
                            {activeTab === 'password' && (
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-orange-400 mb-6 flex items-center gap-2">
                                        <Lock className="w-5 h-5" /> Change Password
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="password"
                                            placeholder="Old Password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-lg focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-400/30 transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-lg focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-400/30 transition-all"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="md:col-span-2 w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-lg focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-400/30 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SAVE BUTTON */}
                            <div className="flex gap-4 pt-8 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setShowEditProfile(false)}
                                    className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-2xl border border-white/30 transition-all hover:scale-102"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-black py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center space-x-3"
                                >
                                    {editLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LEFT DASHBOARD OVERLAY */}
            {showDashboard && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
                        onClick={() => setShowDashboard(false)}
                    />
                    <div className="fixed left-0 top-0 h-full w-[420px] max-w-[90vw] bg-gradient-to-b from-slate-900/95 via-indigo-900/90 to-purple-900/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl z-50 translate-x-0 transition-transform duration-300 ease-in-out">
                        <div className="p-8 border-b border-white/10 sticky top-0 bg-black/20 backdrop-blur-xl z-10">
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    onClick={() => setShowDashboard(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Dashboard
                                </h1>
                                <div className="w-8" />
                            </div>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto h-full">
                            {/* ✅ AVATAR - Click to change */}
                            <div className="text-center space-y-4 pt-4">
                                <div className="w-24 h-24 mx-auto rounded-3xl shadow-2xl border-4 border-white/20 hover:border-emerald-400/50 transition-all overflow-hidden">
                                    {getAvatarDisplay()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                                        {userName}
                                    </h2>
                                    <p className="text-gray-400 text-sm font-medium">{profile?.user?.email || 'user@example.com'}</p>
                                </div>
                            </div>

                            {/* Profile actions */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setEditForm({
                                            fullname: profile?.fullname || '',     // ✅
                                            bio: profile?.bio || '',
                                            email: profile?.user?.email || '',
                                            oldpassword: '',
                                            newpassword: '',
                                            newpasswordconfirm: ''
                                        });
                                        setShowEditProfile(true);
                                    }}
                                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:to-blue-500/30 backdrop-blur-sm rounded-2xl border border-emerald-400/30 hover:border-emerald-400/50 transition-all hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                                >
                                    <User className="w-5 h-5 text-emerald-400" />
                                    <span className="font-semibold text-left flex-1">Edit Profile</span>
                                    <Edit className="w-4 h-4 text-emerald-300" />
                                </button>


                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 p-2">
                                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                                    <div className="text-2xl font-black text-emerald-400">{stats.today || todayTasks.length}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Today</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                                    <div className="text-2xl font-black text-yellow-400">{stats.pending || pendingTasks.length}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Pending</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                                    <div className="text-2xl font-black text-gray-400">{stats.completed || completedTasks.length}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Completed</div>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 border border-red-500/30 mt-6"
                            >
                                <LogOut className="w-5 h-5 inline mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* NAVBAR */}
            <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* ✅ NAVBAR AVATAR */}
                    <button
                        onClick={() => setShowDashboard(true)}
                        className="relative w-14 h-14 p-1 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-white/20 hover:border-emerald-400/60 hover:bg-white/20 hover:shadow-emerald-500/25 hover:scale-105 hover:rotate-3 transition-all duration-300 group overflow-hidden"
                        title="Open Dashboard"
                    >
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900/50 to-purple-900/50 backdrop-blur-xl border border-white/30 shadow-xl p-0.5 group-hover:shadow-2xl">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-white/5 shadow-2xl relative group-hover:bg-white/10 transition-all">
                                {getAvatarDisplay()}
                                {/* ✨ Premium Hover Effects */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -skew-x-12 animate-pulse" />
                                {/* Status Ring */}
                                {profile?.avatar_id && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl animate-ping" />
                                )}
                                {/* Click Indicator */}
                                <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300" />
                            </div>
                        </div>
                    </button>


                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden lg:block">
                            <p className="text-xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                {userName}
                            </p>
                            <p className="text-sm text-gray-400">Welcome back!</p>
                        </div>

                        <div className="relative flex-1 max-w-md">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 transition-all text-white placeholder-gray-400"
                            />
                        </div>

                        <button
                            onClick={logout}
                            className="p-4 hover:bg-red-500/30 rounded-3xl transition-all group hover:scale-105 shadow-xl"
                            title="Logout"
                        >
                            <LogOut className="w-7 h-7 text-white group-hover:text-red-200" />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            Your Lists ({lists.length})
                        </h2>
                        <button
                            onClick={() => {
                                setEditingListId(null);
                                setNewList({ name: '', color: '#3B82F6' });
                                setShowNewList(!showNewList);
                            }}
                            className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center space-x-3 font-bold"
                        >
                            <Plus className="w-6 h-6" />
                            <span>{showNewList ? 'Cancel' : 'New List'}</span>
                        </button>
                    </div>

                    {showNewList && (
                        <form onSubmit={createList} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 mb-8 shadow-2xl">
                            <div className="flex gap-4 items-end">
                                <input
                                    type="text"
                                    placeholder="List name..."
                                    value={newList.name}
                                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                                    className="flex-1 p-5 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-lg font-semibold focus:border-emerald-400 focus:outline-none"
                                    required
                                />
                                <input
                                    type="color"
                                    value={newList.color}
                                    onChange={(e) => setNewList({ ...newList, color: e.target.value })}
                                    className="w-20 h-12 rounded-2xl border-2 border-white/30 bg-white/20 p-1"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg rounded-3xl shadow-2xl hover:shadow-3xl"
                                >
                                    {editingListId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {lists.map(list => {
                            const progress = getListProgress(list.id);
                            const listTasks = tasks.filter(t => t.list === list.id);
                            return (
                                <div
                                    key={list.id}
                                    className={`group p-6 rounded-3xl cursor-pointer transition-all border-2 relative overflow-hidden ${selectedList?.id === list.id
                                        ? 'border-white/50 bg-white/20 ring-4 ring-white/30 shadow-2xl scale-105'
                                        : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20 hover:scale-105 hover:shadow-2xl'
                                        }`}
                                    onClick={() => setSelectedList(list)}
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all space-x-1 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                editList(list);
                                            }}
                                            className="p-2 bg-white/20 hover:bg-white/40 rounded-xl transition-all"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteList(list.id);
                                            }}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div
                                        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform"
                                        style={{ backgroundColor: list.color }}
                                    >
                                        <span className="font-black text-lg">{listTasks.length}</span>
                                    </div>
                                    <h3 className="font-black text-xl text-white text-center mb-3 truncate">{list.name}</h3>
                                    <div className="w-full bg-white/30 rounded-full h-3 mb-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 h-3 rounded-full shadow-lg transition-all duration-700"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-center text-emerald-400">
                                        {progress}% completed
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {selectedList && (
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-4xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                                        {selectedList.name}
                                    </h2>
                                    <div
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-semibold"
                                        style={{ backgroundColor: selectedList.color + '20' }}
                                    >
                                        <span>{tasks.filter(t => t.list === selectedList.id).length}</span>
                                        <span>tasks</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingTaskId(null);
                                        setNewTask({ title: '', description: '', due_datetime: '', priority: 'medium' });
                                        setShowNewTask(!showNewTask);
                                    }}
                                    className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl flex items-center space-x-3 font-bold"
                                >
                                    <Plus className="w-6 h-6" />
                                    <span>{showNewTask ? 'Cancel' : 'Add Task'}</span>
                                </button>
                            </div>

                            {showNewTask && (
                                <form onSubmit={createTask} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 mb-8 shadow-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input
                                            type="text"
                                            placeholder="Task title..."
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            className="w-full p-5 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-lg font-semibold focus:border-emerald-400 focus:outline-none"
                                            required
                                        />
                                        <input
                                            type="datetime-local"
                                            value={newTask.due_datetime}
                                            onChange={(e) => setNewTask({ ...newTask, due_datetime: e.target.value })}
                                            className="w-full p-5                                             rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-lg focus:border-emerald-400 focus:outline-none"
                                        />
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            className="w-full p-5 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-lg focus:border-emerald-400 focus:outline-none"
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                        <textarea
                                            placeholder="Task description (optional)..."
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            rows={4}
                                            className="w-full md:col-span-2 p-5 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-lg focus:border-emerald-400 focus:outline-none resize-vertical"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="md:col-span-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg py-5 px-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all"
                                    >
                                        {editingTaskId ? 'Update Task' : 'Create Task'}
                                    </button>
                                </form>
                            )}

                            {/* TASKS LIST */}
                            <div className="space-y-4">
                                {tasks
                                    .filter(task => task.list === selectedList.id)
                                    .filter(task => !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .sort((a, b) => new Date(b.due_datetime) - new Date(a.due_datetime))
                                    .map(task => (
                                        <div
                                            key={task.id}
                                            className={`group p-6 rounded-3xl border transition-all shadow-xl hover:shadow-2xl ${task.status === 'done'
                                                ? 'border-emerald-400/50 bg-emerald-500/10'
                                                : task.status === 'deleted'
                                                    ? 'border-gray-500/30 bg-gray-500/10 opacity-60'
                                                    : 'border-white/20 bg-white/10 hover:border-white/40'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <button
                                                            onClick={() => finishTask(task.id)}
                                                            disabled={task.status === 'done' || task.status === 'deleted'}
                                                            className={`p-2 rounded-2xl transition-all ${task.status === 'done'
                                                                ? 'bg-emerald-500/30 text-emerald-200 cursor-default'
                                                                : 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300'
                                                                }`}
                                                        >
                                                            {task.status === 'done' ? (
                                                                <Check className="w-5 h-5" />
                                                            ) : (
                                                                <CheckCircle className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                        <h3
                                                            className={`font-black text-xl flex-1 ${task.status === 'done' ? 'line-through opacity-70' : ''
                                                                }`}
                                                        >
                                                            {task.title}
                                                        </h3>
                                                        <div
                                                            className={`px-3 py-1 rounded-xl text-xs font-bold ${getPriorityColor(task.priority)}`}
                                                        >
                                                            {task.priority.toUpperCase()}
                                                        </div>
                                                    </div>
                                                    {task.description && (
                                                        <p className={`text-gray-300 mb-4 ${task.status === 'done' ? 'opacity-70' : ''}`}>
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(task.due_datetime).toLocaleString()}
                                                        </div>
                                                        {task.status === 'done' && (
                                                            <span className="px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded-xl text-xs">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => editTask(task)}
                                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {!selectedList && lists.length > 0 && (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                Select a list to view tasks
                            </h3>
                            <p className="text-gray-400 mb-8">Click on any list above to get started</p>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="space-y-8">
                    {/* Today's Tasks */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                        <h3 className="text-xl font-black mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center gap-2">
                            <Calendar className="w-6 h-6" />
                            Today
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {todayTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`} />
                                    <span className="font-semibold flex-1 truncate">{task.title}</span>
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                            ))}
                            {todayTasks.length === 0 && (
                                <p className="text-gray-400 text-center py-8">No tasks for today 🎉</p>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                        <h3 className="text-xl font-black mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center gap-2">
                            <Clock className="w-6 h-6" />
                            Upcoming
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {upcomingTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`} />
                                    <span className="font-semibold flex-1 truncate">{task.title}</span>
                                    <span className="text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                                        {new Date(task.due_datetime).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {upcomingTasks.length === 0 && (
                                <p className="text-gray-400 text-center py-8">No upcoming tasks</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-b from-emerald-500/20 to-teal-600/20 backdrop-blur-xl rounded-3xl p-6 border border-emerald-400/30 shadow-2xl">
                        <h3 className="text-lg font-black mb-4 text-emerald-300">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span>Pending</span>
                                <span className="font-black text-yellow-400">{pendingTasks.length}</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full shadow-lg"
                                    style={{ width: `${Math.min((pendingTasks.length / 10) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainApp;

