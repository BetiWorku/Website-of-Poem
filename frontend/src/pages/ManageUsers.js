import React, { useState, useEffect } from 'react';
import API from '../api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get('/auth/users');
                setUsers(data);
            } catch (err) {
                console.error("Fetch users error:", err);
                setError('Failed to load users list.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="p-8 space-y-12 bg-cream min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">Registered Community</h1>
                    <p className="font-sans text-muted">A comprehensive list of poets and readers on the platform.</p>
                </div>
            </header>

            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10"></div>

                {error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-bold">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-muted font-bold tracking-widest uppercase text-xs">Accessing Records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-muted uppercase text-xs tracking-tighter font-bold">
                                    <th className="pb-4 pt-0 pl-4 w-12">#</th>
                                    <th className="pb-4 pt-0">Username</th>
                                    <th className="pb-4 pt-0">Email Address</th>
                                    <th className="pb-4 pt-0">Role</th>
                                    <th className="pb-4 pt-0 text-right pr-4">Admin Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.map((user, idx) => (
                                    <tr key={user._id} className="group hover:bg-parchment/30 transition-colors">
                                        <td className="py-5 pl-4 text-muted font-mono text-sm">{idx + 1}</td>
                                        <td className="py-5 font-bold text-ink">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-xs uppercase">
                                                    {user.username.substring(0, 2)}
                                                </div>
                                                {user.username}
                                            </div>
                                        </td>
                                        <td className="py-5 text-muted font-sans font-medium">{user.email}</td>
                                        <td className="py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-5 text-right pr-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Authorized
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted/50 font-medium">Standard</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="p-12 text-center text-muted italic">
                                No registered users found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
