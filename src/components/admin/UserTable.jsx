import { useState, useEffect } from 'react';
import { getAllUsers, banUser, deleteUser } from '../../api/admin.api';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await getAllUsers();
            setUsers(data.users || []);
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleBan = async (user) => {
        const id = user._id || user.id;
        const action = user.isBanned ? 'unban' : 'ban';
        if (!window.confirm(`Are you sure you want to ${action} "${user.name}"?`)) return;
        try {
            await banUser(id, `Admin ${action} action`);
            setUsers(prev => prev.map(u =>
                (u._id || u.id) === id ? { ...u, isBanned: !u.isBanned } : u
            ));
        } catch (err) {
            console.error('Ban user error:', err);
            alert(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDelete = async (user) => {
        const id = user._id || user.id;
        if (!window.confirm(`Permanently delete "${user.name}"? This action cannot be undone.`)) return;
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
        } catch (err) {
            console.error('Delete user error:', err);
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-400">Loading users...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <span className="text-sm text-gray-400">{users.length} users</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Role</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => {
                            const id = user._id || user.id;
                            const isAdmin = user.role === 'admin';
                            return (
                                <tr key={id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=36`}
                                                alt={user.name}
                                                className="w-9 h-9 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-400 sm:hidden">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{user.email}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${user.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                            {user.isBanned ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {!isAdmin && (
                                            <>
                                                <button onClick={() => handleBan(user)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${user.isBanned ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>
                                                    {user.isBanned ? 'Unban' : 'Ban'}
                                                </button>
                                                <button onClick={() => handleDelete(user)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {isAdmin && (
                                            <span className="text-xs text-gray-400 italic">Protected</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
