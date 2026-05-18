import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { discoverByGenre } from '../api/media.api';
import MovieCard from '../components/movies/MovieCard';
import EmptyState from '../components/common/EmptyState';

// Combined and simplified genres for both Movies and TV Shows
const GENRES = [
    { id: 28, name: 'Action', emoji: '💥' },
    { id: 12, name: 'Adventure', emoji: '🗺️' },
    { id: 16, name: 'Animation (Anime)', emoji: '🎌' },
    { id: 35, name: 'Comedy', emoji: '😂' },
    { id: 80, name: 'Crime', emoji: '🕵️' },
    { id: 99, name: 'Documentary', emoji: '📹' },
    { id: 18, name: 'Drama', emoji: '🎭' },
    { id: 10751, name: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 14, name: 'Fantasy', emoji: '✨' },
    { id: 36, name: 'History', emoji: '🏛️' },
    { id: 27, name: 'Horror', emoji: '👻' },
    { id: 10402, name: 'Music', emoji: '🎵' },
    { id: 9648, name: 'Mystery', emoji: '🔍' },
    { id: 10749, name: 'Romance', emoji: '❤️' },
    { id: 878, name: 'Sci-Fi', emoji: '🚀' },
    { id: 53, name: 'Thriller', emoji: '🔪' },
    { id: 10752, name: 'War', emoji: '🪖' },
    { id: 37, name: 'Western', emoji: '🤠' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.03, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const DiscoverPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse initial query params if available
    const queryParams = new URLSearchParams(location.search);
    const initialGenres = queryParams.get('genres') ? queryParams.get('genres').split(',').map(Number) : [];
    const initialType = queryParams.get('type') || 'movie';

    const [selectedGenres, setSelectedGenres] = useState(initialGenres);
    const [mediaType, setMediaType] = useState(initialType);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Update URL when filters change to make it shareable
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
        params.set('type', mediaType);
        navigate({ search: params.toString() }, { replace: true });
    }, [selectedGenres, mediaType, navigate]);

    const fetchResults = useCallback(async (pageNum = 1, append = false) => {
        if (selectedGenres.length === 0) {
            setResults([]);
            setHasMore(false);
            return;
        }

        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);
            setError(null);

            const genresString = selectedGenres.join(',');
            const { data } = await discoverByGenre(genresString, mediaType, pageNum);
            
            const fetchedResults = data.results || [];

            if (append) {
                setResults(prev => {
                    const existingIds = new Set(prev.map(m => m.id || m._id));
                    const newItems = fetchedResults.filter(m => !existingIds.has(m.id || m._id));
                    return [...prev, ...newItems];
                });
            } else {
                setResults(fetchedResults);
            }

            setHasMore(data.page < data.total_pages);
        } catch (err) {
            console.error('Discover fetch error:', err);
            setError('Failed to load results. Please try again.');
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedGenres, mediaType]);

    // Initial fetch and on filter change
    useEffect(() => {
        setPage(1);
        fetchResults(1);
    }, [selectedGenres, mediaType, fetchResults]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(nextPage, true);
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres(prev => {
            if (prev.includes(genreId)) {
                return prev.filter(id => id !== genreId);
            } else {
                if (prev.length >= 3) {
                    // Replace the oldest selection if max 3
                    return [...prev.slice(1), genreId];
                }
                return [...prev, genreId];
            }
        });
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setPage(1);
        setResults([]);
    };

    return (
        <div className="bg-surfaceDark min-h-screen pt-20 sm:pt-24 pb-20">
            <div className="px-6 sm:px-10 lg:px-16 mb-8">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight border-l-4 border-brand pl-3 mb-6">
                    Discover
                </h1>

                {/* Filters Section */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                        
                        {/* Media Type Toggle */}
                        <div className="flex-shrink-0">
                            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Media Type</h3>
                            <div className="flex bg-white/[0.04] p-1 rounded-xl w-max border border-white/[0.06]">
                                <button
                                    onClick={() => setMediaType('movie')}
                                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        mediaType === 'movie' ? 'bg-brand text-white shadow-md' : 'text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    Movies
                                </button>
                                <button
                                    onClick={() => setMediaType('tv')}
                                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        mediaType === 'tv' ? 'bg-brand text-white shadow-md' : 'text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    TV Shows
                                </button>
                            </div>
                        </div>

                        {/* Genre Selection */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">
                                    Select Genres (Max 3)
                                </h3>
                                {selectedGenres.length > 0 && (
                                    <button 
                                        onClick={clearFilters}
                                        className="text-[10px] text-brand hover:text-red-400 uppercase font-bold tracking-wider"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map(genre => {
                                    const isSelected = selectedGenres.includes(genre.id);
                                    return (
                                        <button
                                            key={genre.id}
                                            onClick={() => toggleGenre(genre.id)}
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                                isSelected
                                                    ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-black/20'
                                                    : 'bg-white/[0.03] border-white/[0.05] text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                                            }`}
                                        >
                                            <span>{genre.emoji}</span>
                                            {genre.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Initial State / Prompt */}
                {selectedGenres.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-5xl mb-4">✨</span>
                        <h2 className="text-xl font-bold text-white mb-2">Discover New Favorites</h2>
                        <p className="text-white/40 text-sm">Select up to 3 genres above to start exploring.</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <EmptyState
                        icon="⚠️"
                        title="Oops!"
                        message={error}
                        actionText="Try Again"
                        onAction={() => fetchResults(1)}
                    />
                )}

                {/* Loading Grid */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[2/3] rounded-xl bg-white/10 skeleton-shimmer" />
                                <div className="h-4 rounded w-3/4 bg-white/10 skeleton-shimmer" />
                                <div className="h-3 rounded w-1/2 bg-white/6 skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Results Grid */}
                {!loading && results.length > 0 && (
                    <>
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
                            initial="hidden"
                            animate="visible"
                        >
                            {results.map((item, i) => (
                                <motion.div key={`${item.id || item._id}-${i}`} variants={fadeUp} custom={i}>
                                    <MovieCard movie={item} dark />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center mt-10 sm:mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-white/[0.06] backdrop-blur-md text-white border border-white/10 rounded-xl font-semibold hover:bg-white/[0.1] hover:border-white/20 transition-all duration-200 disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Loading...
                                        </span>
                                    ) : 'Load More Results'}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* No Results found */}
                {!loading && selectedGenres.length > 0 && results.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-5xl mb-4">🏜️</span>
                        <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                        <p className="text-white/40 text-sm">Try selecting different genres or media type.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoverPage;
