import React, { useState, useEffect } from 'react';
import { Clock, User, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

const Attendance: React.FC = () => {
    const axios = useAxios();
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuth();
    const studentId = user!.user!.student!.id;

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/attendances/student/${studentId}`);
            setAttendances(res.data.attendances);
        } catch (err) {
            toast.error("Failed to load your attendance records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) fetchAttendance();
    }, [studentId]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-present/10 text-present border-present/20';
            case 'ABSENT': return 'bg-absent/10 text-absent border-absent/20';
            case 'LATE': return 'bg-late/10 text-late border-late/20';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Summary Statistics
    const stats = {
        present: attendances.filter(a => a.status === 'PRESENT').length,
        absent: attendances.filter(a => a.status === 'ABSENT').length,
        late: attendances.filter(a => a.status === 'LATE').length,
        total: attendances.length
    };

    if (loading) return <div className="p-10 text-center text-textMuted">Loading records...</div>;

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-textMain">My Attendance</h1>
                    <p className="text-textMuted mt-1">View your presence history and session details</p>
                </div>

                {/* Stats Summary Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<CheckCircle className="text-present" />} label="Present" value={stats.present} total={stats.total} color="border-present" />
                    <StatCard icon={<XCircle className="text-absent" />} label="Absent" value={stats.absent} total={stats.total} color="border-absent" />
                    <StatCard icon={<Clock className="text-late" />} label="Late" value={stats.late} total={stats.total} color="border-late" />
                </div>

                {/* Attendance Table */}
                <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Session & Class</th>
                                    <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-textMuted italic">No attendance records found.</td>
                                    </tr>
                                ) : attendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <BookOpen size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-textMain">{att.session.class.name}</p>
                                                    <p className="text-xs text-textMuted">{att.session.class.level}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-textMain">
                                                <User size={14} className="text-textMuted" />
                                                {att.session.teacher.user.firstName} {att.session.teacher.user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-textMain">
                                            <div className="font-medium">{new Date(att.session.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-textMuted">
                                                {new Date(att.session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(att.status)}`}>
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {att.notes ? (
                                                <div className="flex items-center gap-2 text-xs text-textMuted bg-gray-50 p-2 rounded border border-border">
                                                    <AlertCircle size={12} />
                                                    {att.notes}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">No notes</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Stat Card Helper
const StatCard: React.FC<{ icon: any, label: string, value: number, total: number, color: string }> = ({ icon, label, value, total, color }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className={`bg-surface p-5 rounded-xl border-l-4 ${color} border-t border-r border-b border-border shadow-sm flex items-center justify-between`}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-textMuted uppercase">{label}</p>
                    <p className="text-2xl font-bold text-textMain">{value}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-lg font-bold text-textMain">{percentage}%</span>
                <p className="text-[10px] text-textMuted uppercase">of total</p>
            </div>
        </div>
    );
};

export default Attendance;