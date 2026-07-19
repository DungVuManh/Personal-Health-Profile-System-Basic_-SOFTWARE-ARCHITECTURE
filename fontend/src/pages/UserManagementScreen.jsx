import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9999";

const UserManagementScreen = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`);
            if (!res.ok) return;
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("DEBUG [UC7-UI]: Critical error during fetchUsers():", error);
        }
    };

    const handleAction = async (action, userData) => {
        try {
            const res = await fetch(`${API_URL}/api/users/manage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, data: userData })
            });

            const result = await res.json();
            
            setMsg(result.message);
            // Auto-hide message after 3 seconds
            setTimeout(() => setMsg(""), 3000);

            if (result.success) {
                setEditingUser(null);
                fetchUsers(); 
            }
        } catch (error) {
            console.error("DEBUG [UC7-UI]: Failed to process user request:", error);
        }
    };

    // Open Modal for New User
    const handleAddNewUser = () => {
        setEditingUser({
            isNew: true,
            user_id: `UC7-${String(Math.floor(Math.random() * 900) + 100)}`, // Auto-generate random ID for demo
            username: '',
            email: '',
            phone: '',
            address: '',
            permission_id: 3,
            management_status: 'Active'
        });
    };

    // Save User (handles both ADD and EDIT)
    const handleSaveUser = () => {
        const action = editingUser.isNew ? 'ADD' : 'EDIT';
        // Remove the 'isNew' flag before sending to backend
        const { isNew, ...userData } = editingUser;
        handleAction(action, userData);
    };

    // Delete User Confirmation
    const handleRemoveUser = (user) => {
        if (window.confirm(`Are you sure you want to permanently remove user: ${user.username}?`)) {
            handleAction('DELETE', user);
        }
    };

    // Toggle Status (Activate/Deactivate)
    const handleToggleStatus = (user) => {
        const newStatus = user.management_status === 'Active' ? 'Deactivated' : 'Active';
        handleAction('EDIT', { ...user, management_status: newStatus });
    };

    return (
        <div className="max-w-7xl mx-auto p-6 relative">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">User Management (UC7)</h1>
                    <p className="text-slate-500 text-sm">System Admin Dashboard - Managing User Accounts</p>
                </div>
                
                {/* ADD NEW USER BUTTON */}
                <button 
                    onClick={handleAddNewUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span className="text-lg leading-none">+</span> Add New User
                </button>
            </div>
            
            {/* Notification Banner */}
            {msg && (
                <div className="p-4 bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 mb-6 rounded-r-md font-medium shadow-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    {msg}
                    <button onClick={() => setMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">✕</button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Username</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length > 0 ? (
                            users.map(u => {
                                const roleName = u.permission_id === 1 ? 'Admin' : u.permission_id === 2 ? 'Doctor' : 'Patient';
                                const isActive = u.management_status === 'Active';
                                
                                return (
                                    <tr key={u.user_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium text-slate-900">{u.user_id}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{u.username}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3">{u.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                u.permission_id === 1 ? 'bg-purple-100 text-purple-700' :
                                                u.permission_id === 2 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {roleName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                isActive ? 'bg-green-100 text-green-700' :
                                                u.management_status === 'Locked' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {u.management_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {/* Business Rule: Hide Edit, Toggle & Remove buttons if the user is an Admin (permission_id = 1) */}
                                            {u.permission_id !== 1 ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => setEditingUser(u)}
                                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleToggleStatus(u)} 
                                                        className={`${isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} px-3 py-1.5 rounded-md font-semibold text-xs transition-colors`}
                                                    >
                                                        {isActive ? 'Deactivate' : 'Activate'}
                                                    </button>

                                                    <button 
                                                        onClick={() => handleRemoveUser(u)} 
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Protected Admin</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-slate-400">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Interaction 2: Edit / Add Form MODAL */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    {editingUser.isNew ? 'Create New User' : 'Edit User Profile'}
                                </h3>
                                {!editingUser.isNew && (
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {editingUser.user_id}</p>
                                )}
                            </div>
                            <button 
                                onClick={() => setEditingUser(null)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {editingUser.isNew && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">User ID</label>
                                    <input 
                                        className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium font-mono"
                                        value={editingUser.user_id || ''} 
                                        onChange={e => setEditingUser({...editingUser, user_id: e.target.value})} 
                                        placeholder="e.g. UC7-999"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                                <input 
                                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={editingUser.username || ''} 
                                    onChange={e => setEditingUser({...editingUser, username: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input 
                                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={editingUser.email || ''} 
                                    onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                                <input 
                                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={editingUser.phone || ''} 
                                    onChange={e => setEditingUser({...editingUser, phone: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                                <input 
                                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={editingUser.address || ''} 
                                    onChange={e => setEditingUser({...editingUser, address: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role (Permission)</label>
                                <select 
                                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={editingUser.permission_id || 3}
                                    onChange={e => setEditingUser({...editingUser, permission_id: parseInt(e.target.value)})}
                                >
                                    <option value={1}>1 - Admin</option>
                                    <option value={2}>2 - Doctor</option>
                                    <option value={3}>3 - Patient</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Status</label>
                                <select 
                                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:bg-white bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={editingUser.management_status || 'Active'}
                                    onChange={e => setEditingUser({...editingUser, management_status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Locked">Locked</option>
                                    <option value="Deactivated">Deactivated</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setEditingUser(null)} 
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveUser} 
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                            >
                                {editingUser.isNew ? 'Create User' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementScreen;