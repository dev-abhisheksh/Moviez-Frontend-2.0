import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API } from '../api/media.api';
import MovieCard from '../components/movies/MovieCard';

const CATEGORY_CONFIG = {
    'trending-movies': {
        title: 'Trending Movies',
        subtitle: 'The most popular movies right now',
        endpoint: '/media/trending/movie',
        defaultType: 'movie',
        icon: '🔥',
    },
    'action': {
        title: 'Action Packed',
        subtitle: 'Explosive action movies & series',
        endpoint: '/media/search?q=action',
        defaultType: 'movie',
        icon: '💥',
    },
    'anime': {
        title: 'Latest Anime',
        subtitle: 'Currently running & popular anime series',
        endpoint: '/media/search?q=anime',
        defaultType: 'tv',
        icon: '🎌',
    },
    'tv-shows': {
        title: 'Trending TV Shows',
        subtitle: 'Binge-worthy series everyone is watching',
        endpoint: '/media/trending/tv',
        defaultType: 'tv',
        icon: '📺',
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.03, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const CategoryPage = () => {
    const { slug } = useParams();
    const config = CATEGORY_CONFIG[slug];

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchMovies = useCallback(async (pageNum = 1, append = false) => {
        if (!config) return;
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const separator = config.endpoint.includes('?') ? '&' : '?';
            const { data } = await API.get(`${config.endpoint}${separator}page=${pageNum}`);
            let results = data.results || [];

            // Inject media_type if missing
            results = results.map(item => ({
                ...item,
                media_type: item.media_type || config.defaultType,
            }));

            // For anime, sort by most recent first
            if (slug === 'anime') {
                results = results.sort((a, b) => {
                    const dateA = new Date(a.first_air_date || a.release_date || '1970');
                    const dateB = new Date(b.first_air_date || b.release_date || '1970');
                    return dateB - dateA;
                });
            }

            if (append) {
                setMovies(prev => {
                    const existingIds = new Set(prev.map(m => m.id || m._id));
                    const newMovies = results.filter(m => !existingIds.has(m.id || m._id));
                    return [...prev, ...newMovies];
                });
            } else {
                setMovies(results);
            }

            setHasMore(results.length >= 10);
        } catch (err) {
            console.error('Category fetch error:', err);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [config, slug]);

    useEffect(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
        fetchMovies(1);
    }, [slug, fetchMovies]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMovies(nextPage, true);
    };

    if (!config) {
        return (
            <div className="bg-surfaceDark min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <p className="text-6xl mb-4">🎬</p>
                    <h1 className="text-2xl font-bold text-white mb-2">Category Not Found</h1>
                    <p className="text-white/50 mb-6">The category you're looking for doesn't exist.</p>
                    <Link to="/" className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surfaceDark min-h-screen pt-20 sm:pt-24 pb-20">
            {/* Header */}
            <div className="px-6 sm:px-10 lg:px-16 mb-8 sm:mb-10">
                <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition mb-4 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>

                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-3xl sm:text-4xl">{config.icon}</span>
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                            {config.title}
                        </h1>
                        <p className="text-white/40 text-sm sm:text-base mt-1">{config.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Loading Grid */}
            {loading && (
                <div className="px-6 sm:px-10 lg:px-16">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[2/3] rounded-xl bg-white/10 skeleton-shimmer" />
                                <div className="h-4 rounded w-3/4 bg-white/10 skeleton-shimmer" />
                                <div className="h-3 rounded w-1/2 bg-white/6 skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Movie Grid */}
            {!loading && movies.length > 0 && (
                <div className="px-6 sm:px-10 lg:px-16">
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
                        initial="hidden"
                        animate="visible"
                    >
                        {movies.map((movie, i) => (
                            <motion.div key={movie.id || movie._id} variants={fadeUp} custom={i}>
                                <MovieCard movie={movie} dark />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center mt-10 sm:mt-12">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Loading...
                                    </span>
                                ) : 'Load More'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && movies.length === 0 && (
                <div className="px-6 sm:px-10 lg:px-16 flex flex-col items-center justify-center py-20">
                    <p className="text-5xl mb-4">🎬</p>
                    <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                    <p className="text-white/40 text-sm">Try browsing a different category.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
