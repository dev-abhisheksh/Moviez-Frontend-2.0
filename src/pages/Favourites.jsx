import React, { useEffect, useState } from 'react';
import { getFavourites } from '../api/favourite.api';
import MovieGrid from '../components/movies/MovieGrid';
import { MovieRowSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

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
        <div className="min-h-screen bg-background pt-24 px-6 lg:px-16">
            <h1 className="text-3xl font-black mb-8 text-textMain border-l-4 border-brand pl-3">My Favourites</h1>

            {error && (
                <EmptyState
                    icon="⚠️"
                    title="Couldn't load favourites"
                    message={error}
                    actionText="Refresh"
                    onAction={() => window.location.reload()}
                />
            )}

            {loading ? (
                <MovieRowSkeleton />
            ) : !error && favourites.length === 0 ? (
                <EmptyState
                    icon="🍿"
                    title="Your watchlist is feeling a bit lonely"
                    message="Start adding movies and TV shows you love!"
                    actionText="Explore Trending"
                    actionLink="/"
                />
            ) : !error && (
                <MovieGrid movies={favourites} />
            )}
        </div>
    );
};

export default Favourites;
