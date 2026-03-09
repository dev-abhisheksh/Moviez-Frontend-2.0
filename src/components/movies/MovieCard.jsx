import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toggleFavourite, checkFavouriteStatus } from '../../api/favourite.api';

const FALLBACK_POSTER = 'https://images.placeholders.dev/?width=500&height=750&text=No+Image&bgColor=%23222';

const MovieCard = ({ movie }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [animating, setAnimating] = useState(false);

    const id = movie?.id || movie?._id;
    const mediaType = movie?.media_type || 'movie';

    const getPosterUrl = () => {
        if (!movie?.poster_path) return FALLBACK_POSTER;
        if (movie?.isAdmin) return movie.poster_path;
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    };

    // Check initial favourite status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data } = await checkFavouriteStatus(id, mediaType);
                setIsLiked(data.isFavourite);
            } catch (err) {
                // silently fail — user may not be logged in
            }
        };

        if (id) checkStatus();
    }, [id, mediaType]);

    const handleFavourite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await toggleFavourite(id, mediaType);
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
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md bg-gray-200">
                    <img
                        src={getPosterUrl()}
                        alt={movie?.title || movie?.name}
                        className="object-cover w-full h-full"
                        onError={handleImgError}
                    />

                    {/* Heart Icon */}
                    <button
                        onClick={handleFavourite}
                        className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <span className={`text-lg transition-transform duration-300 inline-block ${isLiked ? 'text-red-500' : 'text-gray-400'} ${animating ? 'scale-125' : 'scale-100'}`}>
                            ❤
                        </span>
                    </button>

                    {/* Admin Badge */}
                    {movie?.isAdmin && (
                        <span className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Admin
                        </span>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200">▶</span>
                    </div>
                </div>

                {/* Info Below Card */}
                <div className="mt-2">
                    <h3 className="text-sm font-bold truncate text-gray-900">{movie?.title || movie?.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-yellow-500 font-bold">★ {movie?.vote_average?.toFixed(1) || 'N/A'}</span>
                        <span>•</span>
                        <span>{movie?.release_date?.split('-')[0] || movie?.first_air_date?.split('-')[0] || '2024'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;