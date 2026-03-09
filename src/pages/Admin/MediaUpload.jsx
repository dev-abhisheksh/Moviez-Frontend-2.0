import React, { useState } from 'react';
import { createMediaAdmin } from '../../api/media.api';

const MediaUpload = () => {
    const [form, setForm] = useState({
        title: '',
        overview: '',
        media_type: 'movie',
    });
    const [poster, setPoster] = useState(null);
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!form.title || !form.media_type) {
            setError('Title and media type are required.');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('overview', form.overview);
            formData.append('media_type', form.media_type);
            if (poster) formData.append('poster', poster);
            if (banner) formData.append('banner', banner);

            await createMediaAdmin(formData);
            setMessage('Media uploaded successfully!');
            setForm({ title: '', overview: '', media_type: 'movie' });
            setPoster(null);
            setBanner(null);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-6 lg:px-16">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-black mb-8 text-textMain border-l-4 border-brand pl-3">Upload Media</h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter movie or show title"
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-tmdbBlue focus:border-transparent outline-none transition"
                        />
                    </div>

                    {/* Overview */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Overview</label>
                        <textarea
                            name="overview"
                            value={form.overview}
                            onChange={handleChange}
                            placeholder="Brief description..."
                            rows={4}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-tmdbBlue focus:border-transparent outline-none transition resize-none"
                        />
                    </div>

                    {/* Media Type */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Media Type</label>
                        <select
                            name="media_type"
                            value={form.media_type}
                            onChange={handleChange}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-tmdbBlue focus:border-transparent outline-none transition"
                        >
                            <option value="movie">Movie</option>
                            <option value="tv">TV Show</option>
                        </select>
                    </div>

                    {/* Poster File */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Poster Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPoster(e.target.files[0])}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-red-700 file:cursor-pointer"
                        />
                    </div>

                    {/* Banner File */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Banner Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBanner(e.target.files[0])}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-red-700 file:cursor-pointer"
                        />
                    </div>

                    {/* Messages */}
                    {message && <p className="text-green-600 font-bold text-sm">{message}</p>}
                    {error && <p className="text-red-500 font-bold text-sm">{error}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload Media'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MediaUpload;
