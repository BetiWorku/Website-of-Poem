import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [showPassword, setShowPassword] = useState(false);


    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await API.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || '❌ Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-20 bg-cream relative overflow-hidden">
            {/* Background elements for depth */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-accent opacity-30"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-10 relative z-10 transition-all duration-500 hover:shadow-2xl">

                {/* Logo section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-parchment flex items-center justify-center text-accent mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>
                    <h1 className="font-serif text-3xl font-black text-ink tracking-tight">
                        Create Account
                    </h1>
                    <p className="font-sans text-sm text-muted mt-2">
                        Start your poetic journey today
                    </p>
                </div>

                {error && (
                    <div className="mb-8 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-600 text-sm text-center font-sans animate-shake">
                        <span className="flex items-center justify-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-semibold text-ink ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Poet Name"
                            className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink placeholder-muted/60 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-semibold text-ink ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="name@example.com"
                            className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink placeholder-muted/60 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-semibold text-ink ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full bg-cream/50 border border-border rounded-xl pl-4 pr-12 py-3 font-sans text-sm text-ink placeholder-muted/60 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all duration-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 1.24-2.34m6-6a11.09 11.09 0 0 1 3.76-.66c7 0 11 8 11 8a18.5 18.5 0 0 1-2.18 3.57M3 3l18 18"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-semibold text-ink ml-1">
                            Identity
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all duration-300 appearance-none"
                        >
                            <option value="user">Poetry Reader</option>
                            <option value="admin">Poem Uploader (Admin)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-ink text-cream font-sans font-bold text-sm py-3.5 rounded-xl hover:bg-accent hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/5 hover:shadow-accent/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating Account…' : '✨ Create Account'}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-4">
                    <p className="font-sans text-sm text-muted">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-accent font-bold hover:text-ink transition-colors duration-200"
                        >
                            Sign In
                        </button>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="font-sans text-xs text-muted hover:text-accent flex items-center gap-1.5 transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
