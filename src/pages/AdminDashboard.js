import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/admin/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
                if (err.response && err.response.status === 403) {
                    navigate('/');
                } else {
                    setError("Failed to load user list.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);


    const handleBan = async (userId) => {
        if (!window.confirm("Are you sure you want to ban this user? This cannot be undone easily.")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/admin/ban/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(users.map(user =>
                user.user_id === userId ? { ...user, isBanned: true } : user
            ));

        } catch (err) {
            alert(err.response?.data?.message || "Failed to ban user.");
        }
    };

    if (loading) return <div className="text-center mt-10 text-text-muted">Loading admin dashboard...</div>;
    if (error) return <div className="text-center mt-10 text-status-error">{error}</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-text-main">Admin Dashboard</h1>
                    <div className="bg-background-paper px-4 py-2 rounded shadow text-text-muted text-sm">
                        Total Users: <span className="font-bold text-primary">{users.length}</span>
                    </div>
                </div>

                <div className="bg-background-paper shadow-md rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.user_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-text-main">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-sm text-text-muted">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isBanned ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Suspended
                                            </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {!user.isBanned && user.role !== 'admin' && (
                                        <button
                                            onClick={() => handleBan(user.user_id)}
                                            className="text-red-600 hover:text-red-900 font-bold hover:underline"
                                        >
                                            Ban User
                                        </button>
                                    )}
                                    {user.isBanned && (
                                        <span className="text-gray-400 italic">No actions</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;