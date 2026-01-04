import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, Book } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { toast } from 'react-toastify';
import SubjectModal from '@/components/modals/SubjectModal';

const Subjects: React.FC = () => {
    const axios = useAxios();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/subjects', {
                params: { page: pagination.page, limit: pagination.limit, search: searchInput }
            });
            setSubjects(response.data.subjects);
            setPagination(response.data.pagination);
        } catch (err) {
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchSubjects, 500);
        return () => clearTimeout(timer);
    }, [pagination.page, searchInput]);

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/subjects/${id}`);
            toast.success('Subject deleted');
            fetchSubjects();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-textMain">Subjects</h1>
                        <p className="text-textMuted">Manage curriculum subjects and codes</p>
                    </div>
                    <button onClick={() => { setSelectedSubject(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-all shadow-md">
                        <Plus size={20} /> Add Subject
                    </button>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                    <input type="text" placeholder="Search by name or code..." value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {subjects.map((sub) => (
                            <div key={sub.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Book size={24} />
                                    </div>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-textMuted">{sub.code}</span>
                                </div>

                                <h3 className="text-lg font-bold text-textMain mb-2 truncate">{sub.name}</h3>
                                <p className="text-sm text-textMuted line-clamp-2 mb-6 grow">
                                    {sub.description || 'No description provided.'}
                                </p>

                                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                                    <button onClick={() => { setSelectedSubject(sub); setModalOpen(true); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                    <ConfirmDialog
                                        trigger={<button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>}
                                        onConfirm={() => handleDelete(sub.id)}
                                        title="Delete Subject?"
                                        description={`Are you sure you want to delete ${sub.name}?`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <SubjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} subjectData={selectedSubject} onSave={fetchSubjects} />
        </div>
    );
};

export default Subjects;