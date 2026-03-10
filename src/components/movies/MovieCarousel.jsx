import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { API } from '../../api/media.api';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const FALLBACK = 'https://images.placeholders.dev/?width=500&height=750&text=No+Image&bgColor=%23222';

const MovieCarousel = ({ title, endpoint, minRating = 0 }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    useEffect(() => {
        if (!inView || fetched || !endpoint) return;

        const fetchCarouselData = async () => {
            try {
                setLoading(true);

                // Build page URLs — fetch 2 pages for more variety
                const separator = endpoint.includes('?') ? '&' : '?';
                const res1 = await API.get(`${endpoint}${separator}page=1`);
                const res2 = await API.get(`${endpoint}${separator}page=2`);

                // Determine the default media_type from the endpoint context
                const isTvEndpoint = endpoint.includes('/tv') || endpoint.includes('q=anime');
                const defaultType = isTvEndpoint ? 'tv' : 'movie';

                const combined = [
                    ...(res1.data.results || []),
                    ...(res2.data.results || []),
                ].map(item => ({
                    ...item,
                    media_type: item.media_type || defaultType,
                }));

                // De-duplicate by id
                const seen = new Set();
                const unique = combined.filter((m) => {
                    const id = m.id || m._id;
                    if (seen.has(id)) return false;
                    seen.add(id);
                    return true;
                });

                // Sort by rating descending
                const sorted = unique.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

                // Filter by minimum rating
                let filtered = minRating > 0
                    ? sorted.filter((m) => (m.vote_average || 0) >= minRating)
                    : sorted;

                // Fallback: if fewer than 6 items pass the filter, use top 10 from sorted
                if (filtered.length < 6) {
                    filtered = sorted.slice(0, 10);
                }

                // Cap at 20 for performance
                setMovies(filtered.slice(0, 20));
            } catch (err) {
                console.error(`Error fetching ${title}:`, err);
            } finally {
                setLoading(false);
                setFetched(true);
            }
        };

        fetchCarouselData();
    }, [inView, fetched, endpoint, title, minRating]);

    const getPoster = (movie) => {
        if (!movie?.poster_path) return FALLBACK;
        if (movie?.isAdmin) return movie.poster_path;
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    };

    const handleImgError = (e) => {
        if (e.target.src !== FALLBACK) {
            e.target.src = FALLBACK;
        }
    };

    return (
        <div ref={ref} className="my-10 px-8 lg:px-16">
            <h2 className="text-xl lg:text-2xl font-black mb-6 text-textMain border-l-4 border-brand pl-3 uppercase tracking-tighter">
                {title}
            </h2>

            {loading && (
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[220px] space-y-3 animate-pulse">
                            <div className="aspect-[2/3] bg-gray-200 rounded-xl" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && movies.length > 0 && (
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={2}
                    navigation
                    loop={movies.length >= 4}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    breakpoints={{
                        640: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                        1280: { slidesPerView: 5 },
                    }}
                    className="carousel-swiper"
                >
                    {movies.map((movie) => {
                        const id = movie.id || movie._id;
                        const isAdmin = movie.isAdmin || movie.source === 'admin';
                        const mediaType = isAdmin ? 'admin' : (movie.media_type || 'movie');

                        return (
                            <SwiperSlide key={id}>
                                <Link to={`/watch/${mediaType}/${id}`}>
                                    <div className="group cursor-pointer transition-transform duration-300 hover:scale-105">
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg bg-gray-200">
                                            <img
                                                src={getPoster(movie)}
                                                alt={movie.title || movie.name}
                                                className="object-cover w-full h-full"
                                                onError={handleImgError}
                                            />
                                            {/* Rating badge */}
                                            {movie.vote_average > 0 && (
                                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
                                                    ★ {movie.vote_average?.toFixed(1)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-white text-black p-3 rounded-full shadow-lg">▶</span>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <h3 className="text-sm font-bold truncate text-gray-900">
                                                {movie.title || movie.name}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            )}
        </div>
    );
};

export default MovieCarousel;
