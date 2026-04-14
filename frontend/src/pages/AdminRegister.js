import React, { useState } from 'react';
import API from '../api';

const AdminRegister = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await API.post('/auth/register-admin', { username, email, password });
            setMessage({ text: 'New administrative account created successfully!', type: 'success' });
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Error creating admin.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-12 max-w-2xl mx-auto">
            <header>
                <h1 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">Internal Registration</h1>
                <p className="font-sans text-muted">Create a new administrative account for a trusted team member.</p>
            </header>

            <div className="bg-white rounded-2xl border border-border p-10 shadow-sm relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                </div>

                {message.text && (
                    <div className={`mb-8 px-6 py-4 rounded-xl border text-sm flex items-center justify-center gap-3 animate-slide-up ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-ink ml-1">Member Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Full Name"
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-ink focus:border-accent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-ink ml-1">Register Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="team@poetverse.com"
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-ink focus:border-accent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-ink ml-1">Temporary Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-border rounded-xl pl-4 pr-12 py-3 text-ink focus:border-accent outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 1.24-2.34m6-6a11.09 11.09 0 0 1 3.76-.66c7 0 11 8 11 8a18.5 18.5 0 0 1-2.18 3.57M3 3l18 18"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-ink text-parchment font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        {loading ? 'Creating Account...' : 'Initialize Administrative Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
