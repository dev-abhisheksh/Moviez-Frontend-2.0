import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import MovieCard from './MovieCard';
import { API } from '../../api/media.api';

const MovieRow = ({ title, endpoint, minRating = 0 }) => {
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
        <div ref={ref} className="my-15 px-8 lg:px-16">
            <h2 className="text-xl lg:text-2xl font-black mb-4 text-textMain border-l-4 border-brand pl-3 uppercase tracking-tighter">
                {title}
            </h2>

            {loading && (
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="min-w-[180px] space-y-3 animate-pulse">
                            <div className="aspect-[2/3] bg-gray-200 rounded-lg" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && movies.length === 0 && fetched && null}

            {!loading && movies.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                    {movies.map((movie) => (
                        <div key={movie.id || movie._id} className="min-w-[160px] md:min-w-[200px] lg:min-w-[240px] snap-start">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MovieRow;