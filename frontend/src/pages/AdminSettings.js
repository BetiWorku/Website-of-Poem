import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminSettings = () => {
    const [user, setUser] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/auth/profile');
            setUser({ ...data, password: '' });
        } catch (error) {
            console.error("Profile fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const { data } = await API.put('/auth/profile', user);
            localStorage.setItem('user', JSON.stringify(data));
            setMessage('✅ Profile updated successfully.');
            setUser(prev => ({ ...prev, password: '' }));
        } catch (error) {
            setMessage('❌ Update failed. Please try again.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn">
            <header>
                <h1 className="font-serif text-4xl font-black text-ink dark:text-white tracking-tight mb-2">Account Settings</h1>
                <p className="font-sans text-muted">Manage your administrative identity and security preferences.</p>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border overflow-hidden shadow-2xl p-10">
                {message && (
                    <div className={`mb-8 p-4 rounded-xl font-bold ${message.includes('Error') || message.includes('failed') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-muted uppercase tracking-widest ml-1">Username</label>
                            <input
                                type="text"
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:border-accent transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-muted uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:border-accent transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-muted uppercase tracking-widest ml-1">New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:border-accent transition-all"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-10 py-4 bg-ink dark:bg-accent text-white dark:text-ink font-bold rounded-2xl shadow-lg hover:shadow-accent/20 hover:-translate-y-1 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="p-10 bg-red-50 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/20">
                <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Danger Zone</h3>
                <p className="text-sm text-red-600/70 dark:text-red-400/60 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-6 py-3 border-2 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    Deactivate Account
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
