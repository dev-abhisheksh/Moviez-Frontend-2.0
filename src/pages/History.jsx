import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWatchHistory, removeFromHistory, clearAllHistory } from '../api/history.api';
import EmptyState from '../components/common/EmptyState';

const FALLBACK_POSTER = 'https://images.placeholders.dev/?width=500&height=750&text=No+Image&bgColor=%23222';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clearing, setClearing] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await getWatchHistory();
            setHistory(data.results || []);
        } catch (err) {
            console.error('History fetch error:', err);
            setError('Could not load your watch history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // ── Remove single item (optimistic UI) ──────────────────────────
    const handleRemoveOne = async (item) => {
        const prevHistory = [...history];
        // Optimistically remove
        setHistory(prev => prev.filter(h => !(h.id === item.id && h.media_type === item.media_type)));

        try {
            await removeFromHistory(item.id, item.media_type);
        } catch (err) {
            console.error('Remove history item error:', err);
            setHistory(prevHistory); // rollback
        }
    };

    // ── Clear all (with confirmation) ───────────────────────────────
    const handleClearAll = async () => {
        if (!window.confirm('Clear your entire watch history? This cannot be undone.')) return;

        setClearing(true);
        const prevHistory = [...history];
        setHistory([]);

        try {
            await clearAllHistory();
        } catch (err) {
            console.error('Clear all history error:', err);
            setHistory(prevHistory); // rollback
        } finally {
            setClearing(false);
        }
    };

    const getPosterUrl = (item) => {
        if (!item.poster_path) return FALLBACK_POSTER;
        // Admin posters are full URLs; TMDB posters are paths
        if (item.poster_path.startsWith('http')) return item.poster_path;
        return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-6 lg:px-16 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-3xl font-black text-textMain border-l-4 border-brand pl-3">
                    Watch History
                </h1>

                {history.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        disabled={clearing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-semibold text-sm rounded-lg border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {clearing ? 'Clearing…' : 'Clear All History'}
                    </button>
                )}
            </div>

            {/* Error state */}
            {error && (
                <EmptyState
                    icon="⚠️"
                    title="Couldn't load history"
                    message={error}
                    actionText="Refresh"
                    onAction={() => window.location.reload()}
                />
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4 items-center animate-pulse">
                            <div className="w-20 h-28 bg-gray-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/5" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && history.length === 0 && (
                <EmptyState
                    icon="📺"
                    title="No watch history yet"
                    message="Movies and shows you watch will appear here."
                    actionText="Explore Trending"
                    actionLink="/"
                />
            )}

            {/* History list */}
            {!loading && !error && history.length > 0 && (
                <div className="space-y-3">
                    {history.map((item, idx) => {
                        const isAdmin = item.isAdmin || item.source === 'admin';
                        const routeType = isAdmin ? 'admin' : (item.media_type || 'movie');

                        return (
                            <div
                                key={`${item.id}-${item.media_type}-${idx}`}
                                className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                            >
                                {/* Poster */}
                                <Link to={`/watch/${routeType}/${item.id}`} className="flex-shrink-0">
                                    <img
                                        src={getPosterUrl(item)}
                                        alt={item.title}
                                        className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg bg-gray-200"
                                        onError={(e) => {
                                            if (e.target.src !== FALLBACK_POSTER) e.target.src = FALLBACK_POSTER;
                                        }}
                                    />
                                </Link>

                                {/* Info */}
                                <Link to={`/watch/${routeType}/${item.id}`} className="flex-1 min-w-0">
                                    <h3 className="font-bold text-textMain truncate group-hover:text-brand transition-colors">
                                        {item.title || 'Untitled'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full font-medium text-gray-500">
                                            {item.media_type || 'movie'}
                                        </span>
                                        {item.watchedAt && (
                                            <span>{formatDate(item.watchedAt)}</span>
                                        )}
                                    </div>
                                </Link>

                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemoveOne(item)}
                                    className="flex-shrink-0 p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="Remove from history"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
