import { useState, useEffect } from 'react';
import { getAllMedia, createMedia, updateMedia, deleteMedia } from '../../api/admin.api';
import MediaForm from './MediaForm';

const FALLBACK = 'https://images.placeholders.dev/?width=500&height=750&text=No+Image&bgColor=%23222';

const MediaTable = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data } = await getAllMedia();
            setMedia(data.medias || []);
        } catch (err) {
            console.error('Fetch media error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMedia(); }, []);

    const handleCreate = async (formData) => {
        await createMedia(formData);
        fetchMedia();
    };

    const handleUpdate = async (formData) => {
        const id = editData?._id || editData?.id;
        await updateMedia(id, formData);
        fetchMedia();
    };

    const handleDelete = async (item) => {
        const id = item._id || item.id;
        const action = item.isDeleted ? 'restore' : 'delete';
        if (!window.confirm(`Are you sure you want to ${action} "${item.title}"?`)) return;
        try {
            await deleteMedia(id);
            fetchMedia();
        } catch (err) {
            console.error('Delete media error:', err);
        }
    };

    const openEdit = (item) => {
        setEditData(item);
        setShowForm(true);
    };

    const openCreate = () => {
        setEditData(null);
        setShowForm(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-400">Loading media...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Media Management</h2>
                <button onClick={openCreate}
                    className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                    + Add Media
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Poster</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Type</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Status</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {media.map((item) => {
                            const id = item._id || item.id;
                            return (
                                <tr key={id} className={`hover:bg-gray-50 transition ${item.isDeleted ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <img
                                            src={item.poster_path || FALLBACK}
                                            alt={item.title}
                                            className="w-10 h-14 object-cover rounded"
                                            onError={(e) => { if (e.target.src !== FALLBACK) e.target.src = FALLBACK; }}
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.title || item.name}</td>
                                    <td className="px-4 py-3 text-gray-500 capitalize hidden sm:table-cell">{item.media_type}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${item.isDeleted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                            {item.isDeleted ? 'Hidden' : 'Visible'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openEdit(item)}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${item.isDeleted ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                            {item.isDeleted ? 'Restore' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {media.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-400">No media found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showForm && (
                <MediaForm
                    editData={editData}
                    onSubmit={editData ? handleUpdate : handleCreate}
                    onClose={() => { setShowForm(false); setEditData(null); }}
                />
            )}
        </div>
    );
};

export default MediaTable;
