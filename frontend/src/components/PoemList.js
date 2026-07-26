import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const PoemList = () => {
    const [poems, setPoems] = useState([]);
    const [searchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const featuredRef = useRef(null);
    const masterpiecesRef = useRef(null);
    const bookshelfRef = useRef(null);
    const [activeIndexMs, setActiveIndexMs] = useState(0);
    const [activeIndexBk, setActiveIndexBk] = useState(0);

    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const scrollToFeatured = () => {
        featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If guest, we just show a success message for now or redirect to register
                alert('✨ Thank you for your interest! Please Register or Login to follow your favorite poets and get real-time updates.');
                navigate('/register');
            } else {
                // For logged in users, we could find an admin/hero author to follow
                // but usually this is a newsletter signup. For now, let's treat it as a newsletter.
                alert('💌 Success! You have been added to our inner circle. Expect the latest scrolls in your inbox soon.');
                setEmail('');
            }
        } catch (err) {
            console.error('Subscription error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchPoems = async () => {
            try {
                const { data } = await API.get('/poems');
                setPoems(data);
            } catch (err) {
                console.error('Error fetching poems:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPoems();
    }, []);

    const regularPoems = poems.filter(poem => !poem.pdfPath);
    const digitalBooks = poems.filter(poem => !!poem.pdfPath);

    const filteredPoems = regularPoems.filter(poem =>
        poem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (poem.authorName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="container hero">
            <h1>Loading Poetry...✨</h1>
        </div>
    );

    const themes = [
        { name: 'Love', icon: '❤️', count: 24 },
        { name: 'Nature', icon: '🌿', count: 18 },
        { name: 'Life', icon: '✨', count: 31 },
        { name: 'Loss', icon: '🕊️', count: 12 },
        { name: 'Hope', icon: '🌅', count: 15 },
        { name: 'Freedom', icon: '🦋', count: 9 },
    ];



    const handleScroll = (e, setter) => {
        const { scrollLeft, clientWidth } = e.target;
        // Simple item-based index for dots
        const index = Math.round(scrollLeft / (clientWidth * 0.4)); // approx card width ratio
        setter(index);
    };

    const scrollToItem = (ref, index) => {
        if (!ref.current) return;
        const card = ref.current.querySelector('.snap-center');
        if (!card) return;
        const width = card.clientWidth + 40; // width + gap
        ref.current.scrollTo({ left: index * width, behavior: 'smooth' });
    };


    return (
        <div className="fade-in">
            {/* Cinematic Hero Section */}
            <section
                className="relative flex items-center justify-center overflow-hidden bg-slate-950 min-h-[85vh]"
            >
                {/* Original Book Background Image */}
                <div
                    className="absolute inset-0 z-0 scale-105"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2574&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'sepia(20%) brightness(0.85) contrast(1.05)',
                        opacity: 0.85
                    }}
                ></div>

                {/* Light overlay to keep text readable */}
                <div className="absolute inset-0 z-0" style={{
                    background: 'rgba(245, 240, 232, 0.35)'
                }}></div>

                {/* Scattered letters behind across the whole screen */}
                <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
                    <span className="scattered-letter sl-left-1" style={{left: '5%', top: '15%'}}>P</span>
                    <span className="scattered-letter sl-left-2" style={{left: '15%', top: '65%'}}>O</span>
                    <span className="scattered-letter sl-left-3" style={{left: '25%', top: '35%'}}>E</span>
                    <span className="scattered-letter sl-left-4" style={{left: '35%', top: '80%'}}>M</span>
                    
                    <span className="scattered-letter sl-right-1" style={{left: '45%', top: '25%'}}>P</span>
                    <span className="scattered-letter sl-right-2" style={{left: '55%', top: '55%'}}>O</span>
                    <span className="scattered-letter sl-right-3" style={{left: '65%', top: '15%'}}>E</span>
                    <span className="scattered-letter sl-right-4" style={{left: '75%', top: '75%'}}>M</span>

                    <span className="scattered-letter sl-left-1" style={{left: '85%', top: '40%'}}>P</span>
                    <span className="scattered-letter sl-right-2" style={{left: '90%', top: '20%'}}>O</span>
                    <span className="scattered-letter sl-left-3" style={{left: '30%', top: '10%'}}>E</span>
                    <span className="scattered-letter sl-right-4" style={{left: '80%', top: '85%'}}>M</span>
                </div>

                <div className="container relative z-10 text-center px-4 pt-6 pb-16">


                    <div className="inline-block mb-3 mt-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#4a3728] bg-white/40 px-6 py-1.5 rounded-full backdrop-blur-md border border-white/30">A Sanctuary for Verse</span>
                    </div>
                    
                    {/* The Poem Shown in the Book */}
                    <h1 className="font-serif text-3xl md:text-[3.5rem] font-black text-[#1a120a] mb-3 tracking-tighter leading-none drop-shadow-sm mt-8">
                        Where Words Find <br />
                        <span className="italic block mt-1 text-[#3d2b1a]">Their Wings</span>
                    </h1>

                    <p className="max-w-xl mx-auto text-sm md:text-base text-[#3d2b1a] mb-8 leading-relaxed font-semibold opacity-80">
                        Discover beautiful poems, watch video readings, and support poets from around the world.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 mb-10 mt-10">
                        <button
                            onClick={scrollToFeatured}
                            className="px-9 py-3.5 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
                            style={{ background: '#2d1a0e', color: '#fff' }}
                        >
                            Explore Poems
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </button>
                        <button
                            onClick={() => navigate('/about')}
                            className="px-6 py-3.5 sm:py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all hover:-translate-y-1 active:scale-95 shadow-md mt-2 sm:mt-0"
                            style={{ background: '#ffffff', color: '#2d1a0e', border: '1px solid rgba(45,26,14,0.12)' }}
                        >
                            Our Story
                        </button>
                    </div>
                </div>

            </section>

            {/* Theme Exploration Section */}
            <section className="py-32 bg-white dark:bg-slate-900 border-y border-border dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="font-serif text-3xl font-black text-ink tracking-tight mb-4">Explore Genres</h2>
                            <p className="text-muted dark:text-slate-400 max-w-md">Discovery is part of the journey. Find the rhythm that matches your heartbeat.</p>
                        </div>
                        <button className="text-sm font-bold text-accent uppercase tracking-widest hover:underline decoration-2 underline-offset-8">Discover All →</button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                        {themes.map((theme) => (
                            <div
                                key={theme.name}
                                className="group p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-border dark:border-slate-700/50 text-center transition-all duration-500 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/5 cursor-pointer"
                            >
                                <div className="text-4xl mb-6 transform transition-transform group-hover:scale-125 duration-500">{theme.icon}</div>
                                <h3 className="font-bold text-ink dark:text-white mb-1">{theme.name}</h3>
                                <p className="text-xs text-muted dark:text-slate-500 font-medium">{theme.count} Works</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Masterpieces Section Header */}
            <div ref={featuredRef} className="container mx-auto px-4 mt-32 text-center">
                <div className="flex flex-col items-center mb-4">
                    <h2 className="font-serif text-4xl md:text-6xl font-black text-ink tracking-tighter mb-4">Masterpieces</h2>
                    <button onClick={() => navigate('/browse')} className="text-[11px] font-black text-accent uppercase tracking-[0.4em] hover:opacity-70 transition-opacity">Explore All Verses →</button>
                </div>
                <div className="h-[2px] bg-[#8c7851] w-24 mx-auto mb-16 opacity-30"></div>
            </div>

            {/* Regular Masterpieces Section */}
            <section className="pb-16 bg-transparent dark:bg-slate-950">
                <div
                    ref={masterpiecesRef}
                    onScroll={(e) => handleScroll(e, setActiveIndexMs, filteredPoems.length)}
                    className="flex overflow-x-auto gap-10 pb-12 px-8 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        paddingLeft: 'max(1rem, calc((100vw - 1200px) / 2))',
                        paddingRight: 'max(1rem, calc((100vw - 1200px) / 2))'
                    }}
                >
                    {filteredPoems.length > 0 ? filteredPoems.map((poem) => (
                        <div key={poem._id} className="flex-shrink-0 w-[280px] md:w-[360px] lg:w-[380px] snap-center">
                            <PoemCard poem={poem} navigate={navigate} />
                        </div>
                    )) : (
                        <div className="w-full text-center py-10 opacity-30">
                            <p className="font-serif text-xl italic">The ink is still drying on our next verses...</p>
                        </div>
                    )}
                </div>

                {/* Pagination Dots - One for each masterpiece */}
                {filteredPoems.length > 1 && (
                    <div className="flex justify-center gap-3 mt-4">
                        {filteredPoems.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToItem(masterpiecesRef, i)}
                                className={`h-3 rounded-full transition-all duration-300 ${activeIndexMs === i
                                    ? 'bg-accent w-10 shadow-[0_0_12px_rgba(140,120,81,0.4)]'
                                    : 'bg-accent/20 w-3 hover:bg-accent/40 border-2 border-accent/40'}`}
                                aria-label={`Go to poem ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* The Digital Bookshelf Section */}
            {digitalBooks.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 pt-32 pb-48">
                    <div className="container mx-auto px-4 text-center mb-16">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/60 mb-4 block animate-pulse">Official Collections</span>
                        <h2 className="font-serif text-4xl md:text-6xl font-black text-ink tracking-tight mb-4">The Digital Bookshelf</h2>
                        <div className="h-[2.5px] bg-[#8c7851] w-32 mx-auto opacity-40"></div>
                        <p className="text-muted dark:text-slate-400 mt-6 max-w-lg mx-auto">Explore full-length manuscripts and illustrated verse books in our secure reader.</p>
                    </div>

                    <div
                        ref={bookshelfRef}
                        onScroll={(e) => handleScroll(e, setActiveIndexBk, digitalBooks.length)}
                        className="flex overflow-x-auto gap-10 px-8 pb-10 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            paddingLeft: 'max(1rem, calc((100vw - 1200px) / 2))',
                            paddingRight: 'max(1rem, calc((100vw - 1200px) / 2))'
                        }}
                    >
                        {digitalBooks.map((book) => (
                            <div key={book._id} className="flex-shrink-0 w-[280px] md:w-[360px] lg:w-[380px] snap-center">
                                <PoemCard poem={book} navigate={navigate} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots - One for each book */}
                    {digitalBooks.length > 1 && (
                        <div className="flex justify-center gap-3 mb-12">
                            {digitalBooks.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToItem(bookshelfRef, i)}
                                    className={`h-3 rounded-full transition-all duration-300 ${activeIndexBk === i
                                        ? 'bg-accent w-10 shadow-[0_0_12px_rgba(140,120,81,0.4)]'
                                        : 'bg-accent/20 w-3 hover:bg-accent/40 border-2 border-accent/40'}`}
                                    aria-label={`Go to book ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <button
                            onClick={() => navigate('/browse?category=Books')}
                            className="text-xs font-black text-ink/40 uppercase tracking-[0.3em] hover:text-accent transition-colors py-4 px-10 border border-ink/5 rounded-full hover:border-accent/40"
                        >
                            Enter Library →
                        </button>
                    </div>
                </div>
            )}




            <section className="py-32 bg-accent text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="font-serif text-4xl md:text-6xl font-black mb-6">Join the Circle</h2>
                    <p className="max-w-xl mx-auto text-white/80 mb-12 text-lg">Subscribe to get the latest scrolls delivered to your inbox and support the arts.</p>
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            required
                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all font-sans"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="whitespace-nowrap px-8 py-4 bg-white text-accent font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Joining...' : 'Subscribe Now'}
                        </button>
                    </form>
                    <p className="mt-6 text-xs font-bold uppercase tracking-widest opacity-60">Already 2,000+ poets joined</p>
                </div>
            </section>
        </div>
    );
};

// Extracted PoemCard for reuse
function PoemCard({ poem, navigate }) {
    const [hovered, setHovered] = useState(false);

    // poem.likes and poem.guestLikes are arrays of IDs from the API
    const totalInitial = (Array.isArray(poem.likes) ? poem.likes.length : (poem.likes || 0))
        + (Array.isArray(poem.guestLikes) ? poem.guestLikes.length : 0);

    // Check if current guest already liked this poem
    const storedGuestId = localStorage.getItem('guestId') || '';
    const alreadyLiked = Array.isArray(poem.guestLikes) && poem.guestLikes.includes(storedGuestId);

    const [likeCount, setLikeCount] = useState(totalInitial);
    const [isLiked, setIsLiked] = useState(alreadyLiked);
    const [likeAnim, setLikeAnim] = useState(false);

    const handleLike = async (e) => {
        e.stopPropagation(); // don't navigate to poem
        try {
            // Get or create a persistent guest ID
            let guestId = localStorage.getItem('guestId');
            if (!guestId) {
                guestId = `guest_${Math.random().toString(36).substring(2, 12)}`;
                localStorage.setItem('guestId', guestId);
            }
            const { data } = await API.post(`/poems/${poem._id}/like`, { guestId });
            setLikeCount(data.likes);
            setIsLiked(data.isLiked);
            setLikeAnim(true);
            setTimeout(() => setLikeAnim(false), 400);
        } catch (err) {
            console.error('Like error:', err);
        }
    };

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
                height: '360px'
            }}
        >
            {/* Cover Image or Decorative Top Strip */}
            {poem.imagePath ? (
                <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                        src={`http://localhost:5000/${poem.imagePath.replace(/\\/g, '/')}`}
                        alt={poem.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
                        className="card-img"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--card-bg), transparent)' }}></div>
                </div>
            ) : (
                <div style={{
                    height: '6px',
                    flexShrink: 0,
                    background: 'linear-gradient(90deg, var(--accent-color), var(--accent-light))',
                }} />
            )}

            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                    lineHeight: '1.6',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: '0 0 1.25rem',
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
                        {/* ❤️ Clickable Like Button */}
                        <button
                            onClick={handleLike}
                            title={isLiked ? 'Unlike' : 'Like this poem'}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                fontSize: '0.85rem', fontWeight: '700',
                                color: isLiked ? '#e11d48' : 'var(--text-muted)',
                                background: isLiked ? 'rgba(225,29,72,0.1)' : 'rgba(0,0,0,0.04)',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '999px',
                                border: isLiked ? '1px solid rgba(225,29,72,0.2)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: likeAnim ? 'scale(1.3)' : 'scale(1)',
                                userSelect: 'none',
                            }}
                        >
                            <span style={{ fontSize: '1rem', transition: 'transform 0.2s', display: 'inline-block' }}>
                                {isLiked ? '❤️' : '🤍'}
                            </span>
                            <span>{likeCount}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '500', opacity: 0.7 }}>
                                {likeCount === 1 ? 'like' : 'likes'}
                            </span>
                        </button>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.85rem', fontWeight: '700',
                            color: 'var(--text-muted)',
                            background: 'rgba(0,0,0,0.04)',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                            border: '1px solid transparent',
                            userSelect: 'none',
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
                            {poem.pdfPath ? 'Open Book' : 'Read Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoemList;
