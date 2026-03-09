import React, { useEffect, useState } from 'react';
import { getFavourites } from '../api/favourite.api';
import MovieGrid from '../components/movies/MovieGrid';
import { MovieRowSkeleton } from '../components/common/Skeleton';

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

            {error && <div className="text-center py-10 text-red-500 font-bold">{error}</div>}

            {loading ? (
                <MovieRowSkeleton />
            ) : favourites.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl font-bold">No favourites yet</p>
                    <p>Start adding movies you love!</p>
                </div>
            ) : (
                <MovieGrid movies={favourites} />
            )}
        </div>
    );
};

export default Favourites;
