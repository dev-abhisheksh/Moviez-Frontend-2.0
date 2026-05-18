import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFavourites } from '../api/favourite.api';
import MovieGrid from '../components/movies/MovieGrid';
import EmptyState from '../components/common/EmptyState';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const Favourites = () => {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                setLoading(true);
                const { data } = await getFavourites();
                setFavourites(data.favourites || []);
            } catch (err) {
                console.error('Favourites fetch error:', err);
                setError('Could not load your favourites.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, []);

    return (
        <div className="min-h-screen bg-surfaceDark pt-24 px-6 lg:px-16 pb-20">
            {/* Header */}
            <motion.div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0}
            >
                <div>
                    <h1 className="text-3xl font-black text-white border-l-4 border-brand pl-3">
                        My List
                    </h1>
                    <p className="text-white/40 text-sm mt-2 pl-4">
                        {loading ? 'Loading...' : `${favourites.length} title${favourites.length !== 1 ? 's' : ''} saved`}
                    </p>
                </div>
            </motion.div>

            {/* Error state */}
            {error && (
                <EmptyState
                    icon="⚠️"
                    title="Couldn't load favourites"
                    message={error}
                    actionText="Refresh"
                    onAction={() => window.location.reload()}
                />
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[2/3] bg-white/[0.06] rounded-xl" />
                            <div className="mt-2.5 space-y-1.5">
                                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && favourites.length === 0 && (
                <EmptyState
                    icon="🍿"
                    title="Your watchlist is feeling a bit lonely"
                    message="Start adding movies and TV shows you love!"
                    actionText="Explore Trending"
                    actionLink="/"
                />
            )}

            {/* Favourites grid */}
            {!loading && !error && favourites.length > 0 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={1}
                >
                    <MovieGrid movies={favourites} />
                </motion.div>
            )}
        </div>
    );
};

export default Favourites;
