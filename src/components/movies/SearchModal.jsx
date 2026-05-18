import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMedia } from '../../api/media.api';

const POSTER_FALLBACK = 'https://images.placeholders.dev/?width=185&height=278&text=No+Poster&bgColor=%231a1a2e';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);
    const navigate = useNavigate();

    // Auto-focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
            setPage(1);
            setHasMore(false);
            setSelectedIndex(0);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, isOpen]);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setPage(1);
            setHasMore(false);
            setSelectedIndex(0);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const { data } = await searchMedia(query);
                const items = data.results || [];
                setResults(items);
                setPage(1);
                setHasMore(items.length >= 20);
                setSelectedIndex(0);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen || results.length === 0) return;

        const handleKeyNav = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                handleSelect(results[selectedIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyNav);
        return () => window.removeEventListener('keydown', handleKeyNav);
    }, [isOpen, results, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current) {
            const selected = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (selected) selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    // Load more
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const { data } = await searchMedia(`${query}&page=${nextPage}`);
            const items = data.results || [];
            setResults(prev => {
                const ids = new Set(prev.map(r => r.id || r._id));
                return [...prev, ...items.filter(r => !ids.has(r.id || r._id))];
            });
            setPage(nextPage);
            setHasMore(items.length >= 20);
        } catch (err) {
            console.error('Load more error:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [query, page, loadingMore, hasMore]);

    const handleSelect = useCallback((item) => {
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const id = item.id || item._id;
        onClose();
        navigate(`/watch/${type}/${id}`);
    }, [navigate, onClose]);

    const getPoster = (item) => {
        if (item.isAdmin) return item.poster_path || POSTER_FALLBACK;
        if (item.poster_path) return `https://image.tmdb.org/t/p/w185${item.poster_path}`;
        return POSTER_FALLBACK;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm search-backdrop-enter"
                onClick={onClose}
            />

            {/* Modal — Centered Spotlight Style */}
            <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[12vh] sm:pt-[15vh] px-4 pointer-events-none">
                <div className="w-full max-w-2xl pointer-events-auto search-modal-enter">
                    <div className="bg-[#12121f] rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[70vh]">

                        {/* ── Search Input Area ── */}
                        <div className="relative flex items-center border-b border-white/[0.06]">
                            {/* Search icon */}
                            <div className="pl-5 flex-shrink-0">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="11" cy="11" r="8" />
                                        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                                    </svg>
                                )}
                            </div>

                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies, TV shows, anime..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 px-4 py-3.5 sm:py-4.5 bg-transparent text-white text-sm sm:text-base placeholder-white/25 focus:outline-none"
                            />

                            {/* Right side controls */}
                            <div className="flex items-center gap-2 pr-4 flex-shrink-0">
                                {query && (
                                    <button
                                        onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.08] hover:bg-white/15 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="text-[10px] text-white/20 bg-white/[0.06] px-2 py-1 rounded-md font-mono hover:bg-white/[0.1] transition"
                                >
                                    ESC
                                </button>
                            </div>
                        </div>

                        {/* ── Results Area ── */}
                        <div ref={resultsRef} className="flex-1 overflow-y-auto overscroll-contain">

                            {/* Initial state — Quick actions */}
                            {!loading && query.length < 2 && (
                                <div className="px-5 py-6">
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-3">Quick Links</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        {[
                                            { label: 'Trending', emoji: '🔥', action: () => { onClose(); navigate('/category/trending-movies'); } },
                                            { label: 'Anime', emoji: '🎌', action: () => { onClose(); navigate('/discover?genres=16&type=tv'); } },
                                            { label: 'Action', emoji: '💥', action: () => { onClose(); navigate('/discover?genres=28&type=movie'); } },
                                            { label: 'Horror', emoji: '👻', action: () => { onClose(); navigate('/discover?genres=27&type=movie'); } },
                                            { label: 'Comedy', emoji: '😂', action: () => { onClose(); navigate('/discover?genres=35&type=movie'); } },
                                            { label: 'Sci-Fi', emoji: '🚀', action: () => { onClose(); navigate('/discover?genres=878&type=movie'); } },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={item.action}
                                                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 text-left group"
                                            >
                                                <span className="text-lg">{item.emoji}</span>
                                                <span className="text-xs text-white/50 font-medium group-hover:text-white/70 transition">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4 mt-5 pt-4 border-t border-white/[0.04]">
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/15">
                                            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↑↓</kbd>
                                            <span>Navigate</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/15">
                                            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd>
                                            <span>Select</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/15">
                                            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">Esc</kbd>
                                            <span>Close</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No results */}
                            {!loading && query.length >= 2 && results.length === 0 && (
                                <div className="flex flex-col items-center py-12 text-center px-6">
                                    <span className="text-4xl mb-3">🔍</span>
                                    <p className="text-white/40 text-sm font-medium">No results found for "{query}"</p>
                                    <p className="text-white/15 text-xs mt-1">Try a different spelling or search term</p>
                                </div>
                            )}

                            {/* Results list */}
                            {results.length > 0 && (
                                <div className="py-2">
                                    <p className="text-[10px] text-white/15 font-bold uppercase tracking-widest mb-1 px-5">
                                        {results.length} Result{results.length !== 1 ? 's' : ''}
                                    </p>
                                    {results.map((item, i) => {
                                        const title = item.title || item.name || 'Untitled';
                                        const year = (item.release_date || item.first_air_date || '').split('-')[0];
                                        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                                        const poster = getPoster(item);
                                        const rating = item.vote_average;
                                        const isSelected = selectedIndex === i;

                                        return (
                                            <button
                                                key={`${item.id || item._id}-${i}`}
                                                data-index={i}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(i)}
                                                className={`w-full flex items-center gap-3.5 px-5 py-2.5 text-left transition-all duration-150 group ${
                                                    isSelected
                                                        ? 'bg-brand/10 border-l-2 border-brand'
                                                        : 'border-l-2 border-transparent hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                {/* Poster */}
                                                <div className="w-11 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04]">
                                                    <img
                                                        src={poster}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        onError={(e) => { if (e.target.src !== POSTER_FALLBACK) e.target.src = POSTER_FALLBACK; }}
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate transition-colors ${
                                                        isSelected ? 'text-white' : 'text-white/80'
                                                    }`}>
                                                        {title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                            type === 'tv'
                                                                ? 'bg-blue-500/15 text-blue-400'
                                                                : type === 'person'
                                                                    ? 'bg-purple-500/15 text-purple-400'
                                                                    : 'bg-brand/15 text-brand'
                                                        }`}>
                                                            {type === 'tv' ? 'TV' : type === 'person' ? 'Person' : 'Movie'}
                                                        </span>
                                                        {year && <span className="text-white/25 text-xs">{year}</span>}
                                                        {rating > 0 && (
                                                            <span className="text-gold/60 text-xs flex items-center gap-0.5">
                                                                ★ {rating.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.overview && (
                                                        <p className="text-[11px] text-white/20 line-clamp-1 mt-0.5">
                                                            {item.overview}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Arrow indicator */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-4 h-4 flex-shrink-0 transition-all ${
                                                        isSelected ? 'text-brand translate-x-0.5' : 'text-white/10'
                                                    }`}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        );
                                    })}

                                    {/* Load More */}
                                    {hasMore && (
                                        <div className="flex justify-center py-4 px-5">
                                            <button
                                                onClick={loadMore}
                                                disabled={loadingMore}
                                                className="px-8 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white/40 text-sm font-medium hover:bg-white/[0.08] hover:text-white/60 hover:border-white/[0.1] transition-all disabled:opacity-40"
                                            >
                                                {loadingMore ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                                        Loading...
                                                    </span>
                                                ) : 'Load More Results'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalScaleIn {
                    from { opacity: 0; transform: scale(0.96) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .search-modal-enter {
                    animation: modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .search-backdrop-enter {
                    animation: backdropFadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default SearchModal;
