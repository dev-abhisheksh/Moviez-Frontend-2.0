import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';
import { API } from '../../api/media.api';

const MovieRow = ({ title, endpoint, minRating = 0, dark = false, categorySlug }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    useEffect(() => {
        if (!inView || fetched || !endpoint) return;

        const fetchMovies = async () => {
            try {
                setLoading(true);
                const { data } = await API.get(endpoint);
                let results = data.results || [];

                // Determine the default media_type from the endpoint context
                const isTvEndpoint = endpoint.includes('/tv') || endpoint.includes('q=anime');
                const defaultType = isTvEndpoint ? 'tv' : 'movie';

                // Inject media_type if missing from API response
                results = results.map(item => ({
                    ...item,
                    media_type: item.media_type || defaultType,
                }));

                if (minRating > 0) {
                    results = results.filter(m => (m.vote_average || 0) > minRating);
                }

                setMovies(results);
            } catch (err) {
                console.error(`Error fetching ${title}:`, err);
            } finally {
                setLoading(false);
                setFetched(true);
            }
        };

        fetchMovies();
    }, [inView, fetched, endpoint, title, minRating]);

    return (
        <div ref={ref} className="my-10 sm:my-12 lg:my-14 px-6 sm:px-8 lg:px-16">
            {/* Section Header with See All */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black border-l-4 border-brand pl-3 uppercase tracking-tighter text-white">
                    {title}
                </h2>
                {categorySlug && (
                    <Link
                        to={`/category/${categorySlug}`}
                        className="flex items-center gap-1 text-sm font-semibold text-white/40 hover:text-brand transition-colors duration-200 group"
                    >
                        See All
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                )}
            </div>

            {loading && (
                <div className="flex gap-3 sm:gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="min-w-[130px] sm:min-w-[160px] md:min-w-[180px] space-y-3">
                            <div className="aspect-[2/3] rounded-xl bg-white/10 skeleton-shimmer" />
                            <div className="h-4 rounded w-3/4 bg-white/10 skeleton-shimmer" />
                            <div className="h-3 rounded w-1/2 bg-white/6 skeleton-shimmer" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && movies.length === 0 && fetched && null}

            {!loading && movies.length > 0 && (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                    {movies.map((movie) => (
                        <div key={movie.id || movie._id} className="min-w-[130px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[240px] snap-start">
                            <MovieCard movie={movie} dark />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MovieRow;