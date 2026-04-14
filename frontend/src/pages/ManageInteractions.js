import React, { useState, useEffect } from 'react';
import API from '../api';

const ManageInteractions = () => {
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInteractions = async () => {
            try {
                // Fetch all poems including full likes and comments (protected route)
                const { data } = await API.get('/poems/admin/all');
                setPoems(data);
            } catch (error) {
                console.error("Interactions fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInteractions();
    }, []);

    return (
        <div className="p-8 space-y-12">
            <header>
                <h1 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">Engagement Dashboard</h1>
                <p className="font-sans text-muted">A comprehensive view of reader responses and interactions.</p>
            </header>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="space-y-10">
                    {/* Interaction Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-border">
                            <p className="text-sm font-bold text-muted mb-1">Total Comments</p>
                            <h3 className="text-3xl font-black text-ink">
                                {poems.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-border">
                            <p className="text-sm font-bold text-muted mb-1">Total Appreciation (Likes)</p>
                            <h3 className="text-3xl font-black text-ink">
                                {poems.reduce((sum, p) => sum + (p.likes?.length || 0) + (p.guestLikes?.length || 0), 0)}
                            </h3>
                        </div>
                    </div>

                    {/* Detailed interactions by poem */}
                    <div className="grid grid-cols-1 gap-8">
                        {poems.map(poem => (
                            <div key={poem._id} className="bg-white rounded-2xl border border-border p-8 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="font-serif text-2xl font-black text-ink mb-1">{poem.title}</h2>
                                        <p className="text-xs text-muted font-bold uppercase tracking-widest">{poem.category}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-parchment rounded-lg font-bold text-sm">
                                            ❤️ {(poem.likes?.length || 0) + (poem.guestLikes?.length || 0)}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-parchment rounded-lg font-bold text-sm">
                                            💬 {poem.comments?.length || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Comments list */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-ink border-b pb-2">Recent Reflections</h4>
                                    {poem.comments && poem.comments.length > 0 ? (
                                        poem.comments.slice().reverse().map((comment, idx) => (
                                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent uppercase text-xs">
                                                    {comment.username.substring(0, 2)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-ink">{comment.username}</span>
                                                            {comment.email && <span className="text-[11px] text-muted">{comment.email}</span>}
                                                        </div>
                                                        <span className="text-[10px] text-muted font-bold">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted italic">"{comment.text}"</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted/50 italic py-4">Waiting for the first reader response...</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageInteractions;
