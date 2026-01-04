import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, Users, Calendar } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { toast } from 'react-toastify';
import ClassModal from '@/components/modals/ClassModal';

const Classes: React.FC = () => {
    const axios = useAxios();
    const [classes, setClasses] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedClass, setSelectedClass] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/classes', {
                params: { page: pagination.page, limit: pagination.limit, search: searchInput, status: statusFilter }
            });
            setClasses(response.data.classes);
            setPagination(response.data.pagination);
        } catch (err: any) {
            toast.error('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchClasses, 500);
        return () => clearTimeout(timer);
    }, [pagination.page, searchInput, statusFilter]);

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/classes/${id}`);
            toast.success('Class deleted');
            fetchClasses();
        } catch (err: any) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-textMain">Classes</h1>
                        <p className="text-textMuted">Manage academic groups and schedules</p>
                    </div>
                    <button onClick={() => { setSelectedClass(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-all shadow-md">
                        <Plus size={20} /> Add Class
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                        <input type="text" placeholder="Search by name or level..." value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none">
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="FINISHED">Finished</option>
                    </select>
                </div>

                {/* Grid Boxes */}
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {classes.map((cls) => (
                            <div key={cls.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-lg ${cls.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {cls.status}
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-textMain truncate">{cls.name}</h3>
                                    <span className="text-sm text-primary font-medium">{cls.level}</span>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-textMuted">
                                        <Users size={16} /> <span>Capacity: {cls.capacity} Students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-textMuted">
                                        <Calendar size={16} /> <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                                    <button onClick={() => { setSelectedClass(cls); setModalOpen(true); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={18} /></button>
                                    <ConfirmDialog
                                        trigger={<button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>}
                                        onConfirm={() => handleDelete(cls.id)}
                                        title="Delete Class?"
                                        description="Are you sure you want to remove this class?"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ClassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} classData={selectedClass} onSave={fetchClasses} />
        </div>
    );
};

export default Classes;