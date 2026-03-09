import { useState, useEffect } from 'react';

const FALLBACK = 'https://images.placeholders.dev/?width=500&height=750&text=No+Image&bgColor=%23222';

const MediaForm = ({ editData, onSubmit, onClose }) => {
    const [form, setForm] = useState({
        title: '',
        overview: '',
        media_type: 'movie',
        release_date: '',
        trailer_url: '',
        vote_average: '',
    });
    const [poster, setPoster] = useState(null);
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pre-fill when editing
    useEffect(() => {
        if (editData) {
            setForm({
                title: editData.title || editData.name || '',
                overview: editData.overview || '',
                media_type: editData.media_type || 'movie',
                release_date: editData.release_date
                    ? new Date(editData.release_date).toISOString().split('T')[0]
                    : '',
                trailer_url: editData.trailer_url || '',
                vote_average: editData.vote_average ?? '',
            });
        }
    }, [editData]);

    // Scroll lock
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImgError = (e) => {
        if (e.target.src !== FALLBACK) e.target.src = FALLBACK;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.title || !form.media_type) {
            setError('Title and media type are required.');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('name', form.title);
            formData.append('overview', form.overview);
            formData.append('media_type', form.media_type);
            if (form.release_date) formData.append('release_date', form.release_date);
            if (form.trailer_url) formData.append('trailer_url', form.trailer_url);
            if (form.vote_average !== '') formData.append('vote_average', form.vote_average);
            if (poster) formData.append('poster', poster);
            if (banner) formData.append('banner', banner);

            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition';
    const labelClass = 'text-sm font-semibold text-gray-700';

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {editData ? 'Edit Media' : 'Add New Media'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Title</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Movie or show title" className={inputClass} />
                    </div>

                    {/* Overview */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Overview</label>
                        <textarea name="overview" value={form.overview} onChange={handleChange} placeholder="Brief description..." rows={3} className={`${inputClass} resize-none`} />
                    </div>

                    {/* Media Type & Release Date — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Media Type</label>
                            <select name="media_type" value={form.media_type} onChange={handleChange} className={inputClass}>
                                <option value="movie">Movie</option>
                                <option value="tv">TV Show</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Release Date</label>
                            <input type="date" name="release_date" value={form.release_date} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>

                    {/* Trailer Link & Rating — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Trailer Link</label>
                            <input type="text" name="trailer_url" value={form.trailer_url} onChange={handleChange} placeholder="Paste YouTube URL here" className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Rating</label>
                            <input type="number" name="vote_average" value={form.vote_average} onChange={handleChange} min="0" max="10" step="0.1" placeholder="0 – 10" className={inputClass} />
                        </div>
                    </div>

                    {/* Poster */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Poster Image</label>
                        {editData?.poster_path && (
                            <img src={editData.poster_path || FALLBACK} alt="Current poster" className="w-20 h-28 object-cover rounded-lg border" onError={handleImgError} />
                        )}
                        <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0])}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer" />
                    </div>

                    {/* Banner */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Banner Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer" />
                    </div>

                    {/* Error */}
                    {error && <p className="text-red-500 font-semibold text-sm">{error}</p>}

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50">
                        {loading ? 'Saving...' : editData ? 'Update Media' : 'Create Media'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MediaForm;
