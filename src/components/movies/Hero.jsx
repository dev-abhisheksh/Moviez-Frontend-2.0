import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMediaTrailer, getTrendingMedia } from '../../api/media.api';
import { addToHistory } from '../../api/history.api';
import TrailerModal from '../common/Modal';

const FALLBACK_BACKDROP = 'https://images.placeholders.dev/?width=1920&height=1080&text=MovieHub&bgColor=%231a1a2e';

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const Hero = () => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [youtubeKey, setYoutubeKey] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHeroMovie = async () => {
            try {
                const { data } = await getTrendingMedia('movie');
                const results = data.results;

                if (results && results.length > 0) {
                    // Pick from top 5 for quality
                    const topResults = results.filter(m => m.backdrop_path).slice(0, 5);
                    const randomIdx = Math.floor(Math.random() * topResults.length);
                    setMovie(topResults[randomIdx] || results[0]);
                }
            } catch (err) {
                console.error("Hero fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroMovie();
    }, []);

    const handlePlayTrailer = async () => {
        if (!movie) return;
        try {
            const type = movie.media_type || 'movie';
            const id = movie.id || movie._id;
            const { data } = await getMediaTrailer(type, id);
            setYoutubeKey(data.key);
            setIsModalOpen(true);

            try {
                await addToHistory(id, type);
            } catch (histErr) {
                console.error("History record error:", histErr);
            }
        } catch (err) {
            alert("Trailer not available for this title");
        }
    };

    /* ── Loading Skeleton ── */
    if (loading) return (
        <div className="relative w-full h-[60vh] sm:h-[65vh] lg:h-[85vh] bg-surfaceDark overflow-hidden">
            <div className="absolute inset-0 skeleton-shimmer" />
            <div className="absolute bottom-12 left-0 px-6 sm:px-10 lg:px-16 w-full max-w-3xl space-y-4">
                <div className="h-4 w-24 rounded-full bg-white/10 skeleton-shimmer" />
                <div className="h-10 lg:h-14 w-3/4 rounded-lg bg-white/10 skeleton-shimmer" />
                <div className="h-4 w-full rounded-md bg-white/8 skeleton-shimmer" />
                <div className="h-4 w-2/3 rounded-md bg-white/8 skeleton-shimmer" />
                <div className="flex gap-3 pt-4">
                    <div className="h-12 w-36 rounded-xl bg-white/10 skeleton-shimmer" />
                    <div className="h-12 w-32 rounded-xl bg-white/8 skeleton-shimmer" />
                </div>
            </div>
        </div>
    );

    if (!movie) return null;

    const isAdmin = movie?.isAdmin;

    const getBackdropUrl = () => {
        if (!movie?.backdrop_path) return FALLBACK_BACKDROP;
        if (isAdmin) return movie.backdrop_path;
        return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    };

    const handleImgError = (e) => {
        if (e.target.src !== FALLBACK_BACKDROP) {
            e.target.src = FALLBACK_BACKDROP;
        }
    };

    const genres = movie?.genre_ids
        ? movie.genre_ids.slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean)
        : [];

    return (
        <>
            <motion.div
                className="relative w-full h-[60vh] sm:h-[65vh] lg:h-[85vh] overflow-hidden bg-black"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                {/* Backdrop Image */}
                <img
                    src={getBackdropUrl()}
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    alt={movie?.title || movie?.name}
                    onError={handleImgError}
                />

                {/* Cinematic gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-surfaceDark via-surfaceDark/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-surfaceDark/90 via-surfaceDark/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surfaceDark to-transparent" />

                {/* Hero Content */}
                <motion.div
                    className="absolute bottom-10 sm:bottom-14 lg:bottom-20 left-0 px-6 sm:px-10 lg:px-16 w-full max-w-4xl space-y-3"
                    initial="hidden"
                    animate="visible"
                >
                    {/* Genre chips */}
                    {genres.length > 0 && (
                        <motion.div className="flex flex-wrap items-center gap-2" variants={fadeUp} custom={0}>
                            {genres.map((g, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-white/10 backdrop-blur-sm text-white/90 border border-white/10"
                                >
                                    {g}
                                </span>
                            ))}
                        </motion.div>
                    )}

                    {/* Title */}
                    <motion.h1
                        className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-white drop-shadow-lg"
                        variants={fadeUp}
                        custom={1}
                    >
                        {movie?.title || movie?.name}
                    </motion.h1>

                    {/* Overview */}
                    <motion.p
                        className="text-white/60 text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed"
                        variants={fadeUp}
                        custom={2}
                    >
                        {movie?.overview || 'No description available for this title.'}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div className="flex flex-wrap items-center gap-3 pt-3" variants={fadeUp} custom={3}>
                        {/* ▶ Play Trailer */}
                        <button
                            onClick={handlePlayTrailer}
                            className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/30 hover:bg-red-600 hover:shadow-brand/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                                <line x1="7" y1="2" x2="7" y2="22" />
                                <line x1="17" y1="2" x2="17" y2="22" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                            </svg>
                            Trailer
                        </button>

                        {/* ⓘ More Info */}
                        <button
                            onClick={() => {
                                if (movie) {
                                    const isAdminItem = movie.isAdmin || movie.source === 'admin';
                                    const type = isAdminItem ? 'admin' : (movie.media_type || 'movie');
                                    const id = movie.id || movie._id;
                                    navigate(`/watch/${type}/${id}`);
                                }
                            }}
                            className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            More Info
                        </button>

                        {/* Rating Badge */}
                        {movie?.vote_average > 0 && (
                            <div className="hidden sm:flex items-center gap-2 ml-2 pl-4 border-l border-white/15">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/50 font-semibold uppercase tracking-widest">Rating</span>
                                    <span className="text-lg font-bold text-gold flex items-center gap-1">
                                        ★ {movie.vote_average?.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>

            <TrailerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                youtubeKey={youtubeKey}
            />
        </>
    );
};

export default Hero;