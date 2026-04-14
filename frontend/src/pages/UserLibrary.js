import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const UserLibrary = () => {
    const [likedPoems, setLikedPoems] = useState([]);
    const [purchasedPoems, setPurchasedPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('liked');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const { data } = await API.get('/poems/library/my-poems');
                setLikedPoems(data.liked || []);
                setPurchasedPoems(data.purchased || []);
            } catch (err) {
                console.error('Error fetching library:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, []);

    const displayedPoems = activeTab === 'liked' ? likedPoems : purchasedPoems;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-6xl mx-auto pt-20">
                <header className="mb-12">
                    <h1 className="font-serif text-5xl font-black text-ink dark:text-white mb-4">My Library</h1>
                    <p className="text-muted dark:text-slate-400">Your curated collection of reflections and purchased scrolls.</p>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-10 border-b border-border dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`pb-4 px-4 text-sm font-bold transition-all ${activeTab === 'liked' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
                    >
                        ❤️ Liked Verses ({likedPoems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('purchased')}
                        className={`pb-4 px-4 text-sm font-bold transition-all ${activeTab === 'purchased' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
                    >
                        📜 Purchased Scrolls ({purchasedPoems.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 italic text-muted">Opening your scrolls...</div>
                ) : displayedPoems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedPoems.map(poem => (
                            <article
                                key={poem._id}
                                onClick={() => navigate(`/poems/${poem._id}`)}
                                className="group bg-white dark:bg-slate-900 rounded-3xl border border-border dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    {activeTab === 'liked' ? '❤️' : '📜'}
                                </div>
                                <div className="mb-4">
                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest px-3 py-1 bg-accent/5 rounded-full border border-accent/10">
                                        {poem.category}
                                    </span>
                                </div>
                                <h3 className="font-serif text-2xl font-black text-ink dark:text-white mb-2 line-clamp-1">{poem.title}</h3>
                                <p className="text-sm font-bold text-muted dark:text-slate-500 mb-6">by {poem.authorName}</p>
                                <p className="text-muted dark:text-slate-400 italic line-clamp-3 text-sm leading-loose">
                                    {poem.content}
                                </p>
                                <div className="mt-8 pt-6 border-t border-border dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-xs font-bold text-muted uppercase">Added {new Date(poem.createdAt).toLocaleDateString()}</span>
                                    <span className="text-accent font-black text-sm group-hover:translate-x-1 transition-transform">Read Verse →</span>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-border dark:border-slate-800">
                        <div className="text-6xl mb-6 grayscale opacity-20">🪶</div>
                        <h3 className="text-2xl font-serif text-muted italic">Your library is waiting for its first verse.</h3>
                        <p className="text-muted/60 mt-2 mb-8">Start exploring and saving poems that speak to your soul.</p>
                        <button
                            onClick={() => navigate('/browse')}
                            className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:scale-105 transition-all"
                        >
                            Browse Masterpieces
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserLibrary;
