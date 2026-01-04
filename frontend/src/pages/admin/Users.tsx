import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, User as UserIcon, Mail, Calendar, Phone, BookOpen, AlertCircle, Users, Heart } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import type { User, Teacher, Student, Guardian } from '@school/shared';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { toast } from 'react-toastify';
import UserModal from '@/components/modals/UserModal';
import GuardianChildrenModal from '@/components/modals/GuardianChildrenModal';
import StudentGuardiansModal from '@/components/modals/StudentGuardiansModal';

type UserWithRelations = User & {
    teacher?: Teacher | null;
    student?: Student | null;
    guardian?: Guardian | null;
};

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const UsersManagementPage: React.FC = () => {
    const axios = useAxios();
    const [users, setUsers] = useState<UserWithRelations[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [childrenModalOpen, setChildrenModalOpen] = useState(false);
    const [guardiansModalOpen, setGuardiansModalOpen] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/users', {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search,
                    role: roleFilter
                }
            });
            const { users: fetchedUsers, pagination: paginationData } = response.data;
            setUsers(fetchedUsers);
            setPagination(paginationData);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, search, roleFilter]);

    const handleDeleteUser = async (user: UserWithRelations) => {
        try {
            await axios.delete(`/users/${user.id}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (err: any) {
            console.error('Error deleting user:', err);
            toast.error(err.message || 'Failed to delete user. Please try again.');
        }
    };

    const handleSaveUser = async (data: any) => {
        try {
            if (selectedUser) {
                // Update existing user
                await axios.put(`/users/${selectedUser.id}`, data);
                toast.success('User updated successfully');
            } else {
                // Create new user
                await axios.post('/users', data);
                toast.success('User created successfully');
            }
            fetchUsers();
        } catch (err: any) {
            console.error('Error saving user:', err);
            throw err; // will be handled inside UserModal
        }
    };

    const handleRoleFilterChange = (newRole: string) => {
        setRoleFilter(newRole);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'TEACHER': return 'bg-blue-100 text-blue-700';
            case 'STUDENT': return 'bg-green-100 text-green-700';
            case 'GUARDIAN': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-textMain">Users Management</h1>
                        <p className="text-textMuted mt-1">Manage all users in the system</p>
                    </div>
                    <button
                        onClick={() => { setSelectedUser(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors font-medium shadow-sm">
                        <Plus size={20} />
                        Add User
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-surface rounded-lg shadow-sm border border-border p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleFilterChange(e.target.value)}
                            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface">
                            <option value="">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="STUDENT">Student</option>
                            <option value="GUARDIAN">Guardian</option>
                        </select>

                        {/* Items per page */}
                        <select
                            value={pagination.limit}
                            onChange={(e) => setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 })}
                            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface">
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-textMuted">Loading users...</p>
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    /* Empty State */
                    <div className="bg-surface rounded-lg shadow-sm border border-border p-12 text-center">
                        <UserIcon size={48} className="mx-auto text-textMuted mb-4" />
                        <h3 className="text-xl font-semibold text-textMain mb-2">No users found</h3>
                        <p className="text-textMuted">
                            {search || roleFilter ? 'Try adjusting your filters' : 'Get started by creating your first user'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Users Table */}
                        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                                Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-textMuted uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                {/* User Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <UserIcon size={20} className="text-primary" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-textMain">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className="text-sm text-textMuted flex items-center gap-1 truncate">
                                                                <Mail size={14} />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role Badge */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* Role-specific Details */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-textMain space-y-1">
                                                        {user.teacher && user.teacher.specialization && (
                                                            <div className="flex items-center gap-1">
                                                                <BookOpen size={14} className="text-textMuted shrink-0" />
                                                                <span className="truncate">{user.teacher.specialization}</span>
                                                            </div>
                                                        )}
                                                        {user.student && (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} className="text-textMuted shrink-0" />
                                                                <span>{formatDate(user.student.dateOfBirth)}</span>
                                                            </div>
                                                        )}
                                                        {user.guardian && user.guardian.phoneNumber && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone size={14} className="text-textMuted shrink-0" />
                                                                <span className="truncate">{user.guardian.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        {!user.teacher?.specialization && !user.student && !user.guardian?.phoneNumber && (
                                                            <span className="text-textMuted text-xs">No additional details</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Created Date */}
                                                <td className="px-6 py-4 text-sm text-textMuted whitespace-nowrap">
                                                    {formatDate(user.createdAt)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Logic for Guardian Students */}
                                                        {user.role === 'GUARDIAN' && (
                                                            <button
                                                                onClick={() => { setSelectedUser(user); setChildrenModalOpen(true); }}
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Manage Children">
                                                                <Users size={18} />
                                                            </button>
                                                        )}
                                                        {/* Logic for Student Guardians */}
                                                        {user.role === 'STUDENT' && (
                                                            <button
                                                                onClick={() => { setSelectedUser(user); setGuardiansModalOpen(true); }}
                                                                className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                                                                title="Manage Guardians">
                                                                <Heart size={18} />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Edit user">
                                                            <Edit2 size={18} />
                                                        </button>

                                                        <ConfirmDialog
                                                            trigger={
                                                                <button
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete user"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            }
                                                            title="Delete user?"
                                                            description={`Are you sure you want to delete ${user.lastName} ${user.firstName}? This action cannot be undone.`}
                                                            confirmText="Delete"
                                                            onConfirm={() => handleDeleteUser(user)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                <p className="text-sm text-textMuted">
                                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                    {pagination.total} users
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                                        Previous
                                    </button>

                                    {/* Page numbers */}
                                    <div className="hidden sm:flex gap-2">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                                                    className={`px-4 py-2 border rounded-lg transition-colors font-medium ${pagination.page === pageNum
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'border-border hover:bg-gray-50'
                                                        }`}>
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* === User Modal === */}
            <UserModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />

            {/* Guardian Specific Modal */}
            <GuardianChildrenModal
                isOpen={childrenModalOpen}
                onClose={() => setChildrenModalOpen(false)}
                guardianUser={selectedUser}
            />

            {/* Student Specific Modal (Structure is similar to Guardian one) */}
            <StudentGuardiansModal
                isOpen={guardiansModalOpen}
                onClose={() => setGuardiansModalOpen(false)}
                studentUser={selectedUser}
                onEditGuardian={(guardian) => {
                    setGuardiansModalOpen(false);
                    setSelectedUser(guardian.user); // guardian.user is the User object
                    setModalOpen(true);
                }}
            />

        </div>
    );
};

export default UsersManagementPage;