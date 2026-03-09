import React, { useEffect, useState } from 'react';
import { getWatchHistory } from '../api/history.api';
import MovieRow from '../components/movies/MovieRow';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user from localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (err) {
                console.error('Parse user error:', err);
            }
        }

        // Fetch watch history
        const fetchHistory = async () => {
            try {
                const { data } = await getWatchHistory();
                setHistory(data.histories || []);
            } catch (err) {
                console.error('History fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-6 lg:px-16">
            {/* User Info */}
            <div className="max-w-2xl mx-auto mb-12">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=E50914&color=fff&size=80`}
                        className="w-20 h-20 rounded-full"
                        alt="avatar"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-textMain">{user?.name || 'User'}</h1>
                        <p className="text-gray-500 text-sm">{user?.email || 'No email'}</p>
                        {user?.role && (
                            <span className="inline-block mt-2 text-xs font-bold bg-tmdbBlue/10 text-tmdbBlue px-3 py-1 rounded-full uppercase">
                                {user.role}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-red-50 hover:text-brand transition"
                    >
                        Logout
                    </button>
                </div>
            </div>


            <div>
                <h2>Clear History</h2>
                <MovieRow title="Watch History" endpoint="/history" />
            </div>
        </div>
    );
};

export default ProfilePage;
