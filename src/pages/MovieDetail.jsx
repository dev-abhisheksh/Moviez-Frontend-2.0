import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMediaDetails, getMediaTrailer, getMovieCredits, getRecommendations } from '../api/media.api';
import { toggleFavourite, checkFavouriteStatus } from '../api/favourite.api';
import { addToHistory } from '../api/history.api';
import TrailerModal from '../components/movies/TrailerModal';
import VideoPlayer from '../components/movies/VideoPlayer';
import EmptyState from '../components/common/EmptyState';
import MovieRow from '../components/movies/MovieRow';
import MovieCard from '../components/movies/MovieCard';
import Button from '../components/common/Button';

const FALLBACK_BACKDROP = 'https://via.placeholder.com/1920x1080?text=MovieHub+Content';
const ERROR_BACKDROP = 'https://images.placeholders.dev/?width=1920&height=1080&text=Content+Unavailable&bgColor=%23111';
const AVATAR_FALLBACK = 'https://images.placeholders.dev/?width=185&height=278&text=No+Photo&bgColor=%23333';

/* ── Subtle animation presets ── */
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const MovieDetail = () => {
    const { mediaId, mediaType } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [youtubeKey, setYoutubeKey] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showPlayer, setShowPlayer] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const type = mediaType || 'movie';
                const { data } = await getMediaDetails(mediaId, type);
                const media = data.media || data;

                // Validate that the returned content matches the requested ID
                const returnedId = String(media.id || media._id);
                if (returnedId !== String(mediaId)) {
                    setError('Could not load details — content mismatch.');
                    return;
                }

                setMovie(media);
            } catch (err) {
                console.error('Detail fetch error:', err);
                setError('Could not load movie details.');
            } finally {
                setLoading(false);
            }
        };

        if (mediaId) fetchDetails();
    }, [mediaId, mediaType]);

    // Fetch cast (TMDB only)
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const type = mediaType || 'movie';
                const { data } = await getMovieCredits(type, mediaId);
                setCast(data.cast || []);
            } catch (err) {
                console.error('Credits fetch error:', err);
            }
        };

        if (mediaId && mediaType) fetchCredits();
    }, [mediaId, mediaType]);

    // Fetch recommendations (TMDB-powered)
    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const type = mediaType || 'movie';
                // Only fetch TMDB recommendations for non-admin content
                if (type === 'admin') return;
                const { data } = await getRecommendations(type, mediaId);
                setRecommendations(data.results || []);
            } catch (err) {
                console.error('Recommendations fetch error:', err);
            }
        };

        if (mediaId && mediaType && mediaType !== 'admin') fetchRecs();
    }, [mediaId, mediaType]);

    // Check favourite status
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const id = mediaId;
                const type = mediaType || 'movie';
                const { data } = await checkFavouriteStatus(id, type);
                setIsLiked(data.isFavourite);
            } catch (err) {
                console.error('Favourite status error:', err);
            }
        };

        if (mediaId) checkStatus();
    }, [mediaId, mediaType]);

    // Add to watch history
    useEffect(() => {
        const recordHistory = async () => {
            try {
                const type = mediaType || 'movie';
                await addToHistory(mediaId, type);
            } catch (err) {
                console.error('History error:', err);
            }
        };

        if (mediaId) recordHistory();
    }, [mediaId, mediaType]);

    const handlePlayTrailer = async () => {
        if (!movie) return;

        // Admin-created movies: use the stored trailer_url (YouTube ID)
        const isAdminMovie = movie.isAdmin || movie.source === 'admin';
        if (isAdminMovie && movie.trailer_url) {
            setYoutubeKey(movie.trailer_url);
            setIsModalOpen(true);
            return;
        }

        try {
            const type = movie.media_type || mediaType || 'movie';
            const id = movie.id || movie._id;
            const { data } = await getMediaTrailer(type, id);
            setYoutubeKey(data.key);
            setIsModalOpen(true);
        } catch (err) {
            alert('Trailer not available for this title');
        }
    };

    const handleToggleFavourite = async () => {
        try {
            const id = movie.id || movie._id;
            const type = movie.media_type || mediaType || 'movie';
            await toggleFavourite(id, type);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error('Favourite toggle error:', err);
        }
    };

    const handlePlayerEnded = useCallback(() => {
        const type = mediaType || 'movie';
        addToHistory(mediaId, type).catch((err) =>
            console.error('Failed to mark as watched:', err)
        );
    }, [mediaId, mediaType]);

    const handleImgError = (e) => {
        if (e.target.src !== FALLBACK_BACKDROP && e.target.src !== ERROR_BACKDROP) {
            e.target.src = FALLBACK_BACKDROP;
        }
    };

    /* ── Loading State ── */
    if (loading) return (
        <div className="bg-surfaceDark min-h-screen">
            {/* Hero skeleton */}
            <div className="relative w-full h-[55vh] lg:h-[80vh] bg-gradient-to-b from-gray-800 to-surfaceDark overflow-hidden">
                <div className="absolute inset-0 skeleton-shimmer" />
                <div className="absolute bottom-12 left-0 px-6 sm:px-10 lg:px-16 w-full max-w-3xl space-y-4">
                    <div className="h-4 w-32 rounded-full bg-white/10 skeleton-shimmer" />
                    <div className="h-10 lg:h-14 w-3/4 rounded-lg bg-white/10 skeleton-shimmer" />
                    <div className="h-5 w-1/2 rounded-md bg-white/8 skeleton-shimmer" />
                    <div className="flex gap-3 pt-4">
                        <div className="h-12 w-32 rounded-xl bg-white/10 skeleton-shimmer" />
                        <div className="h-12 w-32 rounded-xl bg-white/8 skeleton-shimmer" />
                        <div className="h-12 w-12 rounded-full bg-white/8 skeleton-shimmer" />
                    </div>
                </div>
            </div>
            {/* Content skeleton */}
            <div className="px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-7 bg-white/8 rounded-lg w-40 skeleton-shimmer" />
                    <div className="h-4 bg-white/6 rounded w-full skeleton-shimmer" />
                    <div className="h-4 bg-white/6 rounded w-5/6 skeleton-shimmer" />
                    <div className="h-4 bg-white/6 rounded w-4/5 skeleton-shimmer" />
                </div>
                <div className="space-y-4">
                    <div className="h-40 bg-white/6 rounded-2xl skeleton-shimmer" />
                </div>
            </div>
        </div>
    );

    /* ── Error State ── */
    if (error || !movie) return (
        <div className="bg-surfaceDark min-h-screen flex flex-col pt-20">
            <div className="relative flex-1 flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img src={ERROR_BACKDROP} alt="error" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surfaceDark via-surfaceDark/80 to-transparent" />
                </div>
                <div className="relative z-10 w-full">
                    <EmptyState
                        icon="💔"
                        title="Oops! We couldn't find that title"
                        message={error || "The movie you're looking for doesn't exist or has been removed."}
                        actionText="Explore Trending"
                        actionLink="/"
                    />
                </div>
            </div>
            <div className="relative z-10 pb-20 mt-10 border-t border-white/5">
                <MovieRow title="Top Picks For You" endpoint="/media/trending/movie" dark />
            </div>
        </div>
    );

    const isAdmin = movie.isAdmin || movie.source === 'admin';

    const getBackdropUrl = () => {
        if (!movie.backdrop_path) return FALLBACK_BACKDROP;
        if (isAdmin) return movie.backdrop_path;
        return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    };

    const GENRE_MAP = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };

    let genres = [];
    if (movie.genres && movie.genres.length > 0) {
        genres = movie.genres.map(g => g.name || g);
    } else if (movie.genre_ids && movie.genre_ids.length > 0) {
        genres = movie.genre_ids.map(id => GENRE_MAP[id] || 'Unknown');
    }

    const isAdminContent = isAdmin || mediaType === 'admin';

    return (
        <>
            <div className="bg-surfaceDark min-h-screen text-white">
                {/* ─── VidKing Player (replaces hero when active) ─── */}
                {showPlayer && (
                    <div className="w-full bg-black pt-14">
                        {/* Season/Episode picker for TV */}
                        {mediaType === 'tv' && (
                            <div className="flex items-center gap-4 px-4 sm:px-8 py-3 bg-surfaceDark/90 backdrop-blur-sm border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider">Season</label>
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(1); }}
                                        className="bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand/50"
                                    >
                                        {Array.from({ length: movie.number_of_seasons || 5 }, (_, i) => (
                                            <option key={i + 1} value={i + 1} className="bg-surfaceDark">{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider">Episode</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={selectedEpisode}
                                        onChange={(e) => setSelectedEpisode(Number(e.target.value) || 1)}
                                        className="bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-1.5 w-20 focus:outline-none focus:border-brand/50"
                                    />
                                </div>
                            </div>
                        )}
                        <VideoPlayer
                            tmdbId={movie.id || movie._id}
                            type={mediaType || 'movie'}
                            season={selectedSeason}
                            episode={selectedEpisode}
                            onEnded={handlePlayerEnded}
                            onClose={() => setShowPlayer(false)}
                        />
                    </div>
                )}

                {/* ─── Cinematic Hero Section ─── */}
                {!showPlayer && (
                    <motion.div
                        className="relative h-[55vh] sm:h-[60vh] lg:h-[80vh] w-full bg-black overflow-hidden"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        {/* Backdrop image */}
                        <img
                            src={getBackdropUrl()}
                            className="absolute inset-0 w-full h-full object-cover scale-105"
                            alt="backdrop"
                            onError={handleImgError}
                        />
                        {/* Multi-layer gradient overlays for cinematic depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-surfaceDark via-surfaceDark/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-surfaceDark/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surfaceDark to-transparent" />

                        {/* Hero content */}
                        <motion.div
                            className="absolute bottom-10 sm:bottom-14 lg:bottom-16 left-0 px-6 sm:px-10 lg:px-16 w-full max-w-4xl space-y-3"
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Genre chips */}
                            {genres.length > 0 && (
                                <motion.div
                                    className="flex flex-wrap items-center gap-2"
                                    variants={fadeUp}
                                    custom={0}
                                >
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
                                {movie.title || movie.name}
                            </motion.h1>

                            {/* Tagline */}
                            {movie.tagline && (
                                <motion.p
                                    className="italic text-white/70 text-base sm:text-lg lg:text-xl font-light"
                                    variants={fadeUp}
                                    custom={2}
                                >
                                    "{movie.tagline}"
                                </motion.p>
                            )}

                            {/* Action buttons */}
                            <motion.div
                                className="flex flex-wrap items-center gap-3 pt-3"
                                variants={fadeUp}
                                custom={3}
                            >
                                {/* ▶ Play */}
                                <Button
                                    onClick={() => setShowPlayer(true)}
                                    className="px-8 sm:px-10 py-3.5 shadow-lg shadow-brand/30 bg-brand text-white font-bold rounded-xl hover:bg-red-600 hover:shadow-brand/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Play
                                </Button>

                                {/* 🎬 Trailer */}
                                <Button
                                    onClick={handlePlayTrailer}
                                    className="px-6 sm:px-8 py-3.5 shadow-lg bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                                        <line x1="7" y1="2" x2="7" y2="22" />
                                        <line x1="17" y1="2" x2="17" y2="22" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <line x1="2" y1="7" x2="7" y2="7" />
                                        <line x1="2" y1="17" x2="7" y2="17" />
                                        <line x1="17" y1="7" x2="22" y2="7" />
                                        <line x1="17" y1="17" x2="22" y2="17" />
                                    </svg>
                                    Trailer
                                </Button>

                                {/* ❤ Favourite */}
                                <button
                                    onClick={handleToggleFavourite}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 active:scale-95 ${isLiked
                                        ? 'bg-brand/20 border-brand/40 shadow-lg shadow-brand/20'
                                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                                        }`}
                                >
                                    <span className={`text-xl ${isLiked ? 'text-brand' : 'text-white/70'}`}>
                                        ❤
                                    </span>
                                </button>

                                {/* ⬇ Download */}
                                <button
                                    onClick={() => {
                                        const id = movie.id || movie._id;
                                        const type = movie.media_type || mediaType || 'movie';
                                        navigate(`/download/${type}/${id}`);
                                    }}
                                    className="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
                                    title="Download"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                        <polyline strokeLinecap="round" strokeLinejoin="round" points="7 10 12 15 17 10" />
                                        <line strokeLinecap="round" x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </button>

                                {/* Rating badge */}
                                {movie.vote_average > 0 && (
                                    <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/15">
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
                )}

                {/* ─── Content Section ─── */}
                <motion.div
                    className="px-6 sm:px-10 lg:px-16 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Storyline */}
                        <motion.section variants={fadeUp} custom={0}>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand rounded-full inline-block" />
                                Storyline
                            </h2>
                            <p className="text-white/60 leading-relaxed text-base sm:text-lg">
                                {movie.overview || 'No description available for this title.'}
                            </p>
                        </motion.section>
                        {/* Download CTA */}
                        <motion.section variants={fadeUp} custom={1}>
                            <button
                                onClick={() => {
                                    const id = movie.id || movie._id;
                                    const type = movie.media_type || mediaType || 'movie';
                                    navigate(`/download/${type}/${id}`);
                                }}
                                className="w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/20 text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                        <polyline strokeLinecap="round" strokeLinejoin="round" points="7 10 12 15 17 10" />
                                        <line strokeLinecap="round" x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <span className="text-white font-bold text-base sm:text-lg block">Download</span>
                                    <span className="text-white/40 text-xs sm:text-sm">Save to watch offline</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/30 ml-auto group-hover:text-white/60 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </motion.section>

                    </div>

                    {/* ─── Sidebar Info ─── */}
                    <motion.div
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 h-fit space-y-5"
                        variants={fadeUp}
                        custom={2}
                    >
                        {movie.release_date && (
                            <div>
                                <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">Release Date</span>
                                <span className="text-white/90 font-semibold">{movie.release_date}</span>
                            </div>
                        )}
                        {movie.runtime > 0 && (
                            <div>
                                <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">Runtime</span>
                                <span className="text-white/90 font-semibold">{movie.runtime} min</span>
                            </div>
                        )}
                        {movie.status && (
                            <div>
                                <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">Status</span>
                                <span className="text-white/90 font-semibold">{movie.status}</span>
                            </div>
                        )}
                        {movie.vote_average > 0 && (
                            <div>
                                <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">User Score</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gold text-lg font-bold">★ {movie.vote_average?.toFixed(1)}</span>
                                    <span className="text-white/40 text-sm">/ 10</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* ─── Cast Gallery ─── */}
                {cast.length > 0 && (
                    <motion.section
                        className="px-6 sm:px-10 lg:px-16 pb-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 flex items-center gap-2">
                            <span className="w-1 h-6 bg-brand rounded-full inline-block" />
                            Top Cast
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {cast.map((actor) => (
                                <div
                                    key={actor.id}
                                    className="flex-shrink-0 w-[120px] sm:w-[130px] group text-center"
                                >
                                    <div className="relative overflow-hidden rounded-xl">
                                        <img
                                            src={actor.profile_path
                                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                                : AVATAR_FALLBACK
                                            }
                                            alt={actor.name}
                                            className="w-full aspect-[2/3] object-cover bg-white/5 group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                if (e.target.src !== AVATAR_FALLBACK) e.target.src = AVATAR_FALLBACK;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-white/90 mt-2 truncate">{actor.name}</p>
                                    <p className="text-xs text-white/40 truncate">{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* ─── Recommendations ─── */}
                <div className="pb-20 border-t border-white/5 pt-4">
                    {!isAdminContent && recommendations.length > 0 ? (
                        <div className="my-15 px-6 sm:px-8 lg:px-16">
                            <h2 className="text-xl lg:text-2xl font-black mb-4 border-l-4 border-brand pl-3 uppercase tracking-tighter text-white">
                                You May Also Like
                            </h2>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                                {recommendations.map((rec) => (
                                    <div key={rec.id} className="min-w-[160px] md:min-w-[200px] lg:min-w-[240px] snap-start">
                                        <MovieCard movie={rec} dark />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <MovieRow title="You May Also Like" endpoint="/media/trending/movie" dark />
                    )}
                </div>
            </div>

            {/* Trailer Modal */}
            <TrailerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                youtubeKey={youtubeKey}
            />
        </>
    );
};

export default MovieDetail;