import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMediaDetails } from '../api/media.api';

const FALLBACK_BACKDROP = 'https://images.placeholders.dev/?width=1920&height=1080&text=MovieHub&bgColor=%231a1a2e';

const QUALITY_OPTIONS = [
    { label: '4K Ultra HD', quality: '2160p', size: '~8-15 GB', icon: '🎬' },
    { label: 'Full HD', quality: '1080p', size: '~2-4 GB', icon: '📀' },
    { label: 'HD', quality: '720p', size: '~1-2 GB', icon: '💿' },
    { label: 'SD', quality: '480p', size: '~500 MB', icon: '📱' },
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
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await getMediaDetails(mediaId, mediaType);
                setMovie(data);
            } catch (err) {
                console.error('Download page fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [mediaId, mediaType]);

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

    const handleDownload = (quality) => {
        setDownloading(quality);

        // Build the download embed URL
        const id = movie?.id || movie?._id || mediaId;
        const type = mediaType === 'tv' ? 'tv' : 'movie';

        // Open VidSrc download page in same window using an anchor
        const downloadUrl = type === 'tv'
            ? `https://vidsrc.xyz/embed/tv/${id}`
            : `https://vidsrc.xyz/embed/movie/${id}`;

        // Create a temporary link to bypass popup blockers
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => setDownloading(null), 2000);
    };

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

    return (
        <div className="bg-surfaceDark min-h-screen">
            {/* Background Backdrop */}
            <div className="fixed inset-0 z-0">
                <img src={getBackdropUrl()} alt="" className="w-full h-full object-cover opacity-15 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-surfaceDark/80 via-surfaceDark/95 to-surfaceDark" />
            </div>

            {/* Content */}
            <div className="relative z-10 pt-24 sm:pt-28 pb-20 px-6 sm:px-10 lg:px-16">
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

                <div className="max-w-4xl mx-auto">
                    {/* Movie Info Card */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 mb-10"
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Poster */}
                        <motion.div variants={fadeUp} custom={0} className="flex-shrink-0">
                            <img
                                src={getPosterUrl()}
                                alt={title}
                                className="w-36 sm:w-44 rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
                            />
                        </motion.div>

                        {/* Info */}
                        <motion.div variants={fadeUp} custom={1} className="flex flex-col justify-center">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
                                {title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 mb-3">
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
                            <p className="text-white/40 text-sm sm:text-base line-clamp-3 max-w-lg leading-relaxed">
                                {movie.overview || 'No description available.'}
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Download Options */}
                    <motion.div initial="hidden" animate="visible">
                        <motion.h2
                            className="text-xl font-bold text-white mb-5 flex items-center gap-2"
                            variants={fadeUp}
                            custom={2}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline strokeLinecap="round" strokeLinejoin="round" points="7 10 12 15 17 10" />
                                <line strokeLinecap="round" x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Options
                        </motion.h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {QUALITY_OPTIONS.map((opt, i) => (
                                <motion.button
                                    key={opt.quality}
                                    variants={fadeUp}
                                    custom={i + 3}
                                    onClick={() => handleDownload(opt.quality)}
                                    disabled={downloading === opt.quality}
                                    className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand/30 transition-all duration-300 group disabled:opacity-60 text-left"
                                >
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div className="flex-1">
                                        <span className="text-white font-bold text-sm sm:text-base block">
                                            {opt.label}
                                            <span className="ml-2 text-white/30 font-normal text-xs">({opt.quality})</span>
                                        </span>
                                        <span className="text-white/30 text-xs">{opt.size}</span>
                                    </div>
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                        {downloading === opt.quality ? (
                                            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                <polyline strokeLinecap="round" strokeLinejoin="round" points="7 10 12 15 17 10" />
                                                <line strokeLinecap="round" x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Info Note */}
                        <motion.div
                            variants={fadeUp}
                            custom={7}
                            className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <p className="text-white/30 text-xs sm:text-sm leading-relaxed">
                                Downloads are provided through third-party sources. Actual quality and availability may vary.
                                For the best experience, use the in-app player to stream directly.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DownloadPage;
