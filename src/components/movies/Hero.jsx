import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaTrailer, getTrendingMedia } from '../../api/media.api';
import { addToHistory } from '../../api/history.api';
import TrailerModal from '../common/Modal';

const FALLBACK_BACKDROP = 'https://images.placeholders.dev/?width=1920&height=1080&text=No+Image&bgColor=%23222';

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
                    const randomIdx = Math.floor(Math.random() * results.length);
                    setMovie(results[randomIdx]);
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

    if (loading) return <div className="w-full h-[70vh] lg:h-[85vh] bg-gray-200 animate-pulse" />;
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

    return (
        <>
            {/* CSS gradient background as fallback — text stays readable even if image fails */}
            <div
                className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
            >
                <div className="absolute inset-0">
                    <img
                        src={getBackdropUrl()}
                        className="w-full h-full object-cover"
                        alt={movie?.title || movie?.name}
                        onError={handleImgError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-16 max-w-2xl gap-4">
                    <h1 className="text-4xl lg:text-6xl font-black text-textMain tracking-tight">
                        {movie?.title || movie?.name}
                    </h1>
                    <p className="text-gray-700 text-lg line-clamp-3 font-medium leading-relaxed">
                        {movie?.overview || 'No description available for this title.'}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                        <button
                            onClick={handlePlayTrailer}
                            className="flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-md font-bold bg-red-700 transition shadow-lg shadow-red-500/20"
                        >
                            <span>▶</span> Play Trailer
                        </button>
                        <button
                            onClick={() => {
                                if (movie) {
                                    const type = movie.media_type || 'movie';
                                    const id = movie.id || movie._id;
                                    navigate(`/watch/${type}/${id}`);
                                }
                            }}
                            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-textMain border border-gray-200 px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition"
                        >
                            ⓘ More Info
                        </button>
                    </div>
                </div>
            </div>

            {/* Trailer Modal Integration */}
            <TrailerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                youtubeKey={youtubeKey}
            />
        </>
    );
};

export default Hero;