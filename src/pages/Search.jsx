import React, { useState, useEffect } from 'react';
import { searchMedia } from '../api/media.api';
import MovieGrid from '../components/movies/MovieGrid';
import { MovieRowSkeleton } from '../components/common/Skeleton';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                setLoading(true);
                setError('');
                const { data } = await searchMedia(query);
                setResults(data.results || []);
            } catch (err) {
                console.error('Search error:', err);
                setError('Something went wrong. Please try again.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="min-h-screen bg-background pt-24 px-6 lg:px-16">
            {/* Search Input */}
            <div className="max-w-3xl mx-auto mb-12">
                <h1 className="text-3xl font-black mb-6 text-center">Explore Movies & TV</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for movies, actors, or admin picks..."
                        className="w-full p-5 rounded-2xl bg-white border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-tmdbBlue transition-all text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {loading && (
                        <div className="absolute right-5 top-5">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-10 text-red-500 font-bold">{error}</div>
            )}

            {/* Results */}
            {loading && results.length === 0 ? (
                <MovieRowSkeleton />
            ) : (
                <MovieGrid movies={results} />
            )}

            {/* Empty State */}
            {!loading && query.length > 2 && results.length === 0 && !error && (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl font-bold">No results found for "{query}"</p>
                    <p>Try searching for something else!</p>
                </div>
            )}
        </div>
    );
};

export default Search;