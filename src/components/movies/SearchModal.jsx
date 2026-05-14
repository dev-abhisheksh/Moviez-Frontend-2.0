import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMedia } from '../../api/media.api';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Auto-focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
            setPage(1);
            setHasMore(false);
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
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

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
        if (item.isAdmin) return item.poster_path || '';
        if (item.poster_path) return `https://image.tmdb.org/t/p/w92${item.poster_path}`;
        return '';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop — simple dark overlay, no blur for performance */}
            <div
                className="fixed inset-0 z-[200] bg-black/85"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 z-[201] flex flex-col max-h-[85vh] search-modal-enter">
                <div className="bg-[#0d0d1a] rounded-t-3xl border-t border-white/[0.08] shadow-2xl flex flex-col max-h-[85vh]">

                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-white/15" />
                    </div>

                    {/* Search Input */}
                    <div className="px-5 sm:px-8 pt-2 pb-3">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="11" cy="11" r="8" />
                                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies, TV shows, anime..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-brand/40 transition-colors"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-8 overscroll-contain">

                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-7 h-7 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Initial empty */}
                        {!loading && query.length < 2 && (
                            <div className="flex flex-col items-center py-10 text-center">
                                <p className="text-white/15 text-sm">Type to search</p>
                            </div>
                        )}

                        {/* No results */}
                        {!loading && query.length >= 2 && results.length === 0 && (
                            <div className="flex flex-col items-center py-10 text-center">
                                <p className="text-white/25 text-sm">No results for "{query}"</p>
                            </div>
                        )}

                        {/* Results list */}
                        {results.length > 0 && (
                            <>
                                <p className="text-[10px] text-white/15 font-bold uppercase tracking-widest mb-2 px-1">
                                    {results.length} Result{results.length !== 1 ? 's' : ''}
                                </p>
                                {results.map((item, i) => {
                                    const title = item.title || item.name || 'Untitled';
                                    const year = (item.release_date || item.first_air_date || '').split('-')[0];
                                    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                                    const poster = getPoster(item);
                                    const rating = item.vote_average;

                                    return (
                                        <button
                                            key={`${item.id || item._id}-${i}`}
                                            onClick={() => handleSelect(item)}
                                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors text-left group"
                                        >
                                            {/* Poster */}
                                            <div className="w-10 h-[3.75rem] rounded-lg bg-white/[0.05] overflow-hidden flex-shrink-0">
                                                {poster ? (
                                                    <img src={poster} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/10 text-sm">🎬</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate group-hover:text-brand transition-colors">
                                                    {title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                        type === 'tv' ? 'bg-blue-500/15 text-blue-400' : 'bg-brand/15 text-brand'
                                                    }`}>
                                                        {type === 'tv' ? 'TV' : 'Movie'}
                                                    </span>
                                                    {year && <span className="text-white/20 text-xs">{year}</span>}
                                                    {rating > 0 && <span className="text-yellow-500/60 text-xs">★ {rating.toFixed(1)}</span>}
                                                </div>
                                            </div>

                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/10 group-hover:text-white/25 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    );
                                })}

                                {/* Load More */}
                                {hasMore && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="px-6 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/50 text-sm font-medium hover:bg-white/[0.1] hover:text-white/70 transition disabled:opacity-40"
                                        >
                                            {loadingMore ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                                    Loading...
                                                </span>
                                            ) : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .search-modal-enter {
                    animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    );
};

export default SearchModal;
