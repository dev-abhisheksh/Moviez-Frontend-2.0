import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMediaDetails } from '../api/media.api';

const FALLBACK_BACKDROP = 'https://images.placeholders.dev/?width=1920&height=1080&text=MovieHub&bgColor=%231a1a2e';

const SERVER_OPTIONS = [
    { label: 'Server 1', id: 'vidking', getUrl: (type, id, s, e) => type === 'tv' ? `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=e50914` : `https://www.vidking.net/embed/movie/${id}?color=e50914` },
    { label: 'Server 2', id: 'vidbinge', getUrl: (type, id, s, e) => type === 'tv' ? `https://vidbinge.dev/embed/tv/${id}/${s}/${e}` : `https://vidbinge.dev/embed/movie/${id}` },
    { label: 'Server 3', id: 'embed2', getUrl: (type, id, s, e) => type === 'tv' ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}` },
    { label: 'Server 4', id: 'multiembed', getUrl: (type, id, s, e) => type === 'tv' ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${id}&tmdb=1` },
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const DownloadPage = () => {
    const { mediaType, mediaId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeServer, setActiveServer] = useState('vidking');
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await getMediaDetails(mediaId, mediaType);
                const media = data.media || data;
                setMovie(media);
            } catch (err) {
                console.error('Download page fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [mediaId, mediaType]);

    // Reset iframe loaded state when server changes
    useEffect(() => {
        setIframeLoaded(false);
    }, [activeServer, season, episode]);

    const getBackdropUrl = () => {
        if (!movie?.backdrop_path) return FALLBACK_BACKDROP;
        if (movie?.isAdmin) return movie.backdrop_path;
        return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    };

    const getPosterUrl = () => {
        if (!movie?.poster_path) return FALLBACK_BACKDROP;
        if (movie?.isAdmin) return movie.poster_path;
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    };

    const currentServer = SERVER_OPTIONS.find(s => s.id === activeServer) || SERVER_OPTIONS[0];
    const embedUrl = movie ? currentServer.getUrl(mediaType === 'tv' ? 'tv' : 'movie', movie.id || movie._id || mediaId, season, episode) : '';

    if (loading) {
        return (
            <div className="bg-surfaceDark min-h-screen pt-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                    <span className="text-white/50 text-sm">Loading download options...</span>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="bg-surfaceDark min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-5xl mb-4">❌</p>
                    <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
                    <p className="text-white/40 mb-6">Unable to load download information.</p>
                    <Link to="/" className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const title = movie.title || movie.name || 'Unknown Title';
    const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
    const totalSeasons = movie.number_of_seasons || 1;

    return (
        <div className="bg-surfaceDark min-h-screen">
            {/* Background Backdrop */}
            <div className="fixed inset-0 z-0">
                <img src={getBackdropUrl()} alt="" className="w-full h-full object-cover opacity-10 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-surfaceDark/80 via-surfaceDark/95 to-surfaceDark" />
            </div>

            {/* Content */}
            <div className="relative z-10 pt-24 sm:pt-28 pb-20 px-4 sm:px-10 lg:px-16">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition mb-6 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className="max-w-5xl mx-auto">
                    {/* Movie Info */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-5 mb-8"
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.img
                            src={getPosterUrl()}
                            alt={title}
                            className="w-28 sm:w-36 rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
                            variants={fadeUp}
                            custom={0}
                        />
                        <motion.div variants={fadeUp} custom={1} className="flex flex-col justify-center">
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
                                {title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 mb-2">
                                {year && <span>{year}</span>}
                                {movie.runtime > 0 && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-white/30" />
                                        <span>{movie.runtime} min</span>
                                    </>
                                )}
                                {movie.vote_average > 0 && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-white/30" />
                                        <span className="text-gold font-semibold">★ {movie.vote_average?.toFixed(1)}</span>
                                    </>
                                )}
                                <span className="w-1 h-1 rounded-full bg-white/30" />
                                <span className="capitalize">{mediaType}</span>
                            </div>
                            <p className="text-white/40 text-sm line-clamp-2 max-w-lg">{movie.overview || ''}</p>
                        </motion.div>
                    </motion.div>

                    {/* Server Selector & Episode Picker */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                    >
                        {/* Server Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {SERVER_OPTIONS.map((server) => (
                                <button
                                    key={server.id}
                                    onClick={() => setActiveServer(server.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        activeServer === server.id
                                            ? 'bg-brand text-white shadow-lg shadow-brand/30'
                                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80'
                                    }`}
                                >
                                    {server.label}
                                </button>
                            ))}
                        </div>

                        {/* Season/Episode picker for TV */}
                        {mediaType === 'tv' && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider">S</label>
                                    <select
                                        value={season}
                                        onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }}
                                        className="bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand/50"
                                    >
                                        {Array.from({ length: totalSeasons }, (_, i) => (
                                            <option key={i + 1} value={i + 1} className="bg-surfaceDark">{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider">E</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={episode}
                                        onChange={(e) => setEpisode(Number(e.target.value) || 1)}
                                        className="bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 w-20 focus:outline-none focus:border-brand/50"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Embedded Player */}
                    <motion.div
                        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                    >
                        {/* Loading state */}
                        {!iframeLoaded && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-surfaceDark">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                                    <span className="text-white/40 text-sm">Loading player...</span>
                                </div>
                            </div>
                        )}

                        <div className="aspect-video w-full bg-black">
                            <iframe
                                key={`${activeServer}-${season}-${episode}`}
                                src={embedUrl}
                                title="Download Player"
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                sandbox="allow-scripts allow-same-origin allow-forms"
                                onLoad={() => setIframeLoaded(true)}
                            />
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        className="mt-6 p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={4}
                    >
                        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline strokeLinecap="round" strokeLinejoin="round" points="7 10 12 15 17 10" />
                                <line strokeLinecap="round" x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            How to Download
                        </h3>
                        <ol className="text-white/40 text-xs sm:text-sm space-y-2 list-decimal list-inside">
                            <li>Select a server above. If one doesn't work, try another.</li>
                            <li>Wait for the video to load in the player.</li>
                            <li>Use the player's built-in <strong className="text-white/60">download button</strong> (if available).</li>
                            <li>Or play the video, then <strong className="text-white/60">right-click → Save video as...</strong> to download.</li>
                            {mediaType === 'tv' && (
                                <li>For TV shows, select the <strong className="text-white/60">Season</strong> and <strong className="text-white/60">Episode</strong> above.</li>
                            )}
                        </ol>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DownloadPage;
