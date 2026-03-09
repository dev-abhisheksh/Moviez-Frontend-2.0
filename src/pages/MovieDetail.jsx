import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMediaDetails, getMediaTrailer } from '../api/media.api';
import { toggleFavourite, checkFavouriteStatus } from '../api/favourite.api';
import { addToHistory } from '../api/history.api';
import TrailerModal from '../components/movies/TrailerModal';
import EmptyState from '../components/common/EmptyState';
import MovieRow from '../components/movies/MovieRow';
import Button from '../components/common/Button';

const FALLBACK_BACKDROP = 'https://via.placeholder.com/1920x1080?text=MovieHub+Content';
const ERROR_BACKDROP = 'https://images.placeholders.dev/?width=1920&height=1080&text=Content+Unavailable&bgColor=%23111';

const MovieDetail = () => {
    const { mediaId, mediaType } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [youtubeKey, setYoutubeKey] = useState(null);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const { data } = await getMediaDetails(mediaId);
                setMovie(data.media || data);
            } catch (err) {
                console.error('Detail fetch error:', err);
                setError('Could not load movie details.');
            } finally {
                setLoading(false);
            }
        };

        if (mediaId) fetchDetails();
    }, [mediaId]);

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

    const handleImgError = (e) => {
        if (e.target.src !== FALLBACK_BACKDROP && e.target.src !== ERROR_BACKDROP) {
            e.target.src = FALLBACK_BACKDROP;
        }
    };

    if (loading) return (
        <div className="bg-background min-h-screen">
            <div className="w-full h-[60vh] lg:h-[80vh] bg-gray-900 animate-pulse" />
            <div className="px-8 lg:px-16 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse mb-6" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (error || !movie) return (
        <div className="bg-background min-h-screen flex flex-col pt-20">
            <div className="relative flex-1 flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img src={ERROR_BACKDROP} alt="error" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
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
            <div className="relative z-10 pb-20 mt-10 border-t border-gray-100/10">
                <MovieRow title="Top Picks For You" endpoint="/media/trending/movie" />
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

    const firstGenre = genres[0] || movie.title || 'action';

    return (
        <>
            <div className="bg-background min-h-screen">
                {/* Backdrop & Main Info */}
                <div className="relative h-[60vh] lg:h-[80vh] w-full bg-black">
                    <img
                        src={getBackdropUrl()}
                        className="w-full h-full object-cover opacity-60"
                        alt="backdrop"
                        onError={handleImgError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                    <div className="absolute bottom-10 left-0 px-8 lg:px-16 w-full max-w-4xl space-y-4">
                        {genres.length > 0 && (
                            <div className="flex items-center gap-3 text-tmdbBlue text-white font-bold text-sm uppercase tracking-widest">
                                {genres.join(' • ')}
                            </div>
                        )}
                        <h1 className="text-4xl lg:text-7xl text-white font-black text-textMain tracking-tighter">
                            {movie.title || movie.name}
                        </h1>
                        {movie.tagline && (
                            <p className="italic text-white text-lg lg:text-xl font-medium">"{movie.tagline}"</p>
                        )}

                        <div className="flex flex-wrap items-center gap-6 mt-6">
                            <Button onClick={handlePlayTrailer} className="px-10 py-4 shadow-xl bg-white text-black">
                                ▶ Watch Trailer
                            </Button>
                            <button
                                onClick={handleToggleFavourite}
                                className="flex items-center gap-2 bg-white border-2 border-gray-200 p-3 rounded-full hover:bg-gray-50 transition group"
                            >
                                <span className={`text-2xl group-hover:scale-125 transition-transform ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
                                    ❤
                                </span>
                            </button>
                            {movie.vote_average > 0 && (
                                <div className="flex flex-col border-l-2 border-gray-200 pl-6">
                                    <span className="text-sm text-white font-bold uppercase">Rating</span>
                                    <span className="text-xl font-black text-white">★ {movie.vote_average?.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Info */}
                <div className="px-8 lg:px-16 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-black text-textMain mb-4">Storyline</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {movie.overview || 'No description available for this title.'}
                            </p>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-6">
                        {movie.release_date && (
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Release Date</span>
                                <span className="text-textMain font-bold">{movie.release_date}</span>
                            </div>
                        )}
                        {movie.runtime > 0 && (
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Runtime</span>
                                <span className="text-textMain font-bold">{movie.runtime} minutes</span>
                            </div>
                        )}
                        {movie.status && (
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                <span className="text-textMain font-bold">{movie.status}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="pb-20">
                    <MovieRow title="You May Also Like" endpoint={`/media/search?q=${encodeURIComponent(firstGenre)}`} />
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