import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toggleFavourite, checkFavouriteStatus } from '../../api/favourite.api';

const FALLBACK_POSTER = 'https://images.placeholders.dev/?width=500&height=750&text=No+Image&bgColor=%231a1a2e';

const MovieCard = ({ movie, dark = false }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [animating, setAnimating] = useState(false);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const id = movie?.id || movie?._id;
    const isAdmin = movie?.isAdmin || movie?.source === 'admin';
    const mediaType = isAdmin ? 'admin' : (movie?.media_type || 'movie');

    const getPosterUrl = () => {
        if (!movie?.poster_path) return FALLBACK_POSTER;
        if (isAdmin) return movie.poster_path;
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    };

    // Check initial favourite status on mount (only if logged in)
    useEffect(() => {
        if (!isLoggedIn) return;
        const checkStatus = async () => {
            try {
                const { data } = await checkFavouriteStatus(id, mediaType === 'admin' ? (movie?.media_type || 'movie') : mediaType);
                setIsLiked(data.isFavourite);
            } catch (err) {
                // silently fail — user may not be logged in
            }
        };

        if (id) checkStatus();
    }, [id, mediaType, isLoggedIn]);

    const handleFavourite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        try {
            const favType = mediaType === 'admin' ? (movie?.media_type || 'movie') : mediaType;
            await toggleFavourite(id, favType);
            setIsLiked(!isLiked);
            setAnimating(true);
            setTimeout(() => setAnimating(false), 300);
        } catch (err) {
            console.error('Favourite error:', err);
        }
    };

    const handleImgError = (e) => {
        if (e.target.src !== FALLBACK_POSTER) {
            e.target.src = FALLBACK_POSTER;
        }
    };

    return (
        <Link to={`/watch/${mediaType}/${id}`} className="block">
            <div className="relative group cursor-pointer transition-transform duration-300 ease-out hover:scale-105">
                {/* Poster Image */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg bg-white/5">
                    <img
                        src={getPosterUrl()}
                        alt={movie?.title || movie?.name}
                        className="object-cover w-full h-full"
                        onError={handleImgError}
                    />

                    {/* Heart Icon */}
                    <button
                        onClick={handleFavourite}
                        className={`absolute top-2 right-2 z-10 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 border ${
                            isLiked
                                ? 'bg-brand/20 border-brand/40'
                                : 'bg-black/40 border-white/20 hover:bg-black/60'
                        }`}
                    >
                        <span className={`text-lg transition-transform duration-300 inline-block ${isLiked ? 'text-brand' : 'text-white/70'} ${animating ? 'scale-125' : 'scale-100'}`}>
                            ❤
                        </span>
                    </button>

                    {/* Admin Badge */}
                    {movie?.isAdmin && (
                        <span className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Admin
                        </span>
                    )}

                    {/* Rating Badge */}
                    {movie?.vote_average > 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-gold text-xs font-bold px-2 py-1 rounded-lg">
                            ★ {movie.vote_average?.toFixed(1)}
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full border border-white/20 shadow-lg">▶</span>
                    </div>
                </div>

                {/* Info Below Card */}
                <div className="mt-2.5">
                    <h3 className="text-sm font-semibold truncate text-white/90">{movie?.title || movie?.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{movie?.release_date?.split('-')[0] || movie?.first_air_date?.split('-')[0] || '2024'}</span>
                        <span>•</span>
                        <span className="capitalize">{movie?.media_type || 'movie'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;