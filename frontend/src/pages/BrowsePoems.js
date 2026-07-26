import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';

const THEMES = ['All', 'Love', 'Nature', 'Life', 'Loss', 'Hope', 'Freedom', 'Books'];

const THEME_ICONS = {
    All: '📚',
    Love: '❤️',
    Nature: '🌿',
    Life: '✨',
    Loss: '🕊️',
    Hope: '🌅',
    Freedom: '🦋',
    Books: '📖',
};

function BrowsePoems() {
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Get parameters from URL
    const activeTheme = searchParams.get('category') || 'All';
    const initialSearch = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [sortBy, setSortBy] = useState('latest');
    const navigate = useNavigate();

    // Effect to sync search term if URL changes elsewhere
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        fetchPoems();
    }, [activeTheme, sortBy]);

    const fetchPoems = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/poems?category=${activeTheme}&sort=${sortBy}`);
            setPoems(data);
        } catch (err) {
            console.error('Error fetching poems:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (theme) => {
        setSearchParams({ category: theme, q: searchTerm });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ category: activeTheme, q: searchTerm });
    };

    const filteredPoems = poems.filter((poem) => {
        const titleMatch = poem.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const authorMatch = poem.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        return (titleMatch || authorMatch);
    });

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-main)' }}>
            {/* Page Header */}
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem 2.5rem' }}>
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.8rem',
                    fontWeight: '900',
                    color: 'var(--text-main)',
                    margin: '0 0 0.6rem',
                    letterSpacing: '-0.02em',
                }}>
                    Browse Poems
                </h1>
                <p style={{ color: 'var(--accent-color)', fontSize: '0.95rem', margin: 0 }}>
                    Explore our curated collection of poetry
                </p>
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 1.5rem 1.75rem' }}>
                <form
                    onSubmit={handleSearchSubmit}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '560px',
                        display: 'flex',
                        gap: '0.75rem'
                    }}
                >
                    <div style={{ position: 'relative', flex: 1 }}>
                        <svg
                            style={{
                                position: 'absolute', left: '1rem', top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)', pointerEvents: 'none',
                            }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by title, author, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.75rem',
                                paddingRight: '1rem',
                                paddingTop: '0.85rem',
                                paddingBottom: '0.85rem',
                                border: '1px solid var(--border)',
                                borderRadius: '14px',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.95rem',
                                color: 'var(--text-main)',
                                background: 'var(--card-bg)',
                                outline: 'none',
                                boxShadow: 'var(--shadow-sm)',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '0 1.5rem',
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 12px rgba(140, 120, 81, 0.2)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Theme Filter Pills */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.6rem',
                padding: '0 1.5rem 2.5rem',
            }}>
                {THEMES.map((theme) => {
                    const isActive = activeTheme === theme;
                    return (
                        <button
                            key={theme}
                            onClick={() => handleThemeChange(theme)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.45rem 1.1rem',
                                borderRadius: '999px',
                                border: isActive ? 'none' : '1px solid var(--border)',
                                background: isActive ? 'var(--accent-color)' : 'var(--card-bg)',
                                color: isActive ? '#fcfaf6' : 'var(--text-main)',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.85rem',
                                fontWeight: isActive ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 2px 8px rgba(140,120,81,0.3)' : 'none',
                            }}
                        >
                            <span>{THEME_ICONS[theme]}</span>
                            {theme}
                        </button>
                    );
                })}
            </div>

            {/* Sort Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '0 1.5rem 3rem' }}>
                {['latest', 'trending', 'most-liked'].map((sort) => (
                    <button
                        key={sort}
                        onClick={() => setSortBy(sort)}
                        style={{
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: sortBy === sort ? 'var(--accent-color)' : 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem',
                            borderBottom: sortBy === sort ? '2px solid var(--accent-color)' : '2px solid transparent',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {sort.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Poem Grid */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem 5rem',
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#6b665c' }}>
                        <p style={{ fontSize: '1.1rem' }}>Loading poems…</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '2rem',
                    }}>
                        {filteredPoems.map((poem) => (
                            <PoemCard key={poem._id} poem={poem} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PoemCard({ poem }) {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

    // Stats
    const totalInitial = (Array.isArray(poem.likes) ? poem.likes.length : (poem.likes || 0))
        + (Array.isArray(poem.guestLikes) ? poem.guestLikes.length : 0);
    const [likeCount, setLikeCount] = useState(totalInitial);

    return (
        <div
            onClick={() => navigate(`/poems/${poem._id}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hovered
                    ? '0 12px 32px rgba(0,0,0,0.2)'
                    : 'var(--shadow-sm)',
                cursor: 'pointer',
                height: '100%',
                minHeight: '320px'
            }}
        >
            {/* Cover Image or Decorative Top Strip */}
            {poem.imagePath ? (
                <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={`http://localhost:5000/${poem.imagePath.replace(/\\/g, '/')}`}
                        alt={poem.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                        className="card-img"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--card-bg), transparent)' }}></div>
                </div>
            ) : (
                <div style={{
                    height: '6px',
                    background: 'linear-gradient(90deg, var(--accent-color), var(--accent-light))',
                }} />
            )}

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Category badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.8rem'
                }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--accent-color)',
                        background: 'rgba(140, 120, 81, 0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {poem.pdfPath ? '📖 MANUSCRIPT' : poem.category}
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.4rem',
                    fontWeight: '900',
                    color: 'var(--text-main)',
                    margin: '0 0 0.4rem',
                    lineHeight: '1.2'
                }}>{poem.title}</h1>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                    by <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{poem.authorName}</span>
                </p>

                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: '0 0 1rem',
                    whiteSpace: 'pre-line'
                }}>
                    {poem.content && poem.content.includes('[Digital Manuscript:')
                        ? "Full-length illustrated manuscript. Open the book to explore the complete collection."
                        : poem.content || "Explore this professional collection of verse."}
                </p>

                <div style={{
                    marginTop: 'auto',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1rem'
                }}>
                    {/* Engagement row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            fontSize: '0.8rem', color: 'var(--text-muted)'
                        }}>
                            ❤️ <span style={{ fontWeight: '600' }}>{likeCount}</span>
                        </span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.85rem', fontWeight: '700',
                            color: 'var(--text-muted)',
                            background: 'rgba(0,0,0,0.04)',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                        }}>
                            💬 <span style={{ fontWeight: '600' }}>{poem.comments?.length || 0}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '500', opacity: 0.7 }}>
                                {poem.comments?.length === 1 ? 'reflection' : 'reflections'}
                            </span>
                        </span>
                    </div>
                    {/* Price + CTA row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)' }}>
                            {poem.pdfPath ? '📖' : `$${poem.price || 0}`}
                        </span>
                        <button style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.55rem 1.1rem',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
                            boxShadow: '0 2px 10px rgba(140,120,81,0.3)',
                            transition: 'all 0.2s'
                        }}>
                            Read Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BrowsePoems;
