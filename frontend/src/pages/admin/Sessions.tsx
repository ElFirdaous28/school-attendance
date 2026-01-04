import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, Calendar, Clock, ClipboardCheck } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { toast } from 'react-toastify';
import SessionModal from '@/components/modals/SessionModal';
import { useNavigate } from 'react-router-dom';

const SessionsManagementPage: React.FC = () => {
    const axios = useAxios();
    const [sessions, setSessions] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/sessions', {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchInput,
                    status: statusFilter
                }
            });
            setSessions(response.data.sessions);
            setPagination(response.data.pagination);
        } catch (err) {
            toast.error('Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchSessions, 500);
        return () => clearTimeout(timer);
    }, [pagination.page, searchInput, statusFilter]);

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-textMain">Academic Sessions</h1>
                    <button onClick={() => { setSelectedSession(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-all shadow-sm">
                        <Plus size={20} /> New Session
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                        <input type="text" placeholder="Search by class name..." value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-surface outline-none">
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="VALIDATED">Validated</option>
                    </select>
                </div>

                <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted">Class / Subject</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted">Teacher</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted">Date & Time</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-textMuted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={5} className="py-10 text-center text-textMuted">Loading...</td></tr>
                            ) : sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textMain">{session.class?.name}</div>
                                        <div className="text-xs text-textMuted">{session.class?.level}</div>
                                    </td>
                                    <td className="px-6 py-4 text-textMain">
                                        {session.teacher?.firstName} {session.teacher?.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-textMain">
                                        <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(session.date).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1 text-textMuted"><Clock size={14} /> {formatTime(session.startTime)} - {formatTime(session.endTime)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${session.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">

                                            {/* Attendance */}
                                            <button
                                                onClick={() => navigate(`/admin/attendance/${session.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="View Attendance"
                                            >
                                                <ClipboardCheck size={18} />
                                            </button>

                                            {/* Edit */}
                                            <button
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setModalOpen(true);
                                                }}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            {/* Delete */}
                                            <ConfirmDialog
                                                title="Delete Session?"
                                                trigger={
                                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                        <Trash2 size={18} />
                                                    </button>
                                                }
                                                onConfirm={() =>
                                                    axios.delete(`/sessions/${session.id}`).then(fetchSessions)
                                                }
                                            />
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <SessionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} sessionData={selectedSession} onSave={fetchSessions} />
        </div>
    );
};

export default SessionsManagementPage;