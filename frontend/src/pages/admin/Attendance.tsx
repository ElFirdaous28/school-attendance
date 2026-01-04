import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, XCircle, Clock,
    Save, ShieldCheck, UserCheck, UserX, AlertCircle
} from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';

const AttendancePage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const axios = useAxios();
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>({});

    const isSessionValidated = session?.status === 'VALIDATED';

    const fetchData = async () => {
        setLoading(true);
        try {
            const sessionRes = await axios.get(`/sessions/${sessionId}`);
            const sessionData = sessionRes.data.session;
            setSession(sessionData);

            const enrollmentRes = await axios.get(`/student-classes/class/${sessionData.classId}/students`);
            const attendanceRes = await axios.get(`/attendances/session/${sessionId}`);

            const existingMap: Record<string, any> = {};
            attendanceRes.data.attendances.forEach((a: any) => {
                existingMap[a.studentId] = a;
            });

            setStudents(enrollmentRes.data.students);
            setAttendanceMap(existingMap);
        } catch (err) {
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [sessionId]);

    const handleStatusChange = async (studentId: string, newStatus: string) => {
        if (isSessionValidated) return; // Guard clause

        const existing = attendanceMap[studentId];
        try {
            if (existing) {
                const res = await axios.put(`/attendances/${existing.id}`, { status: newStatus });
                setAttendanceMap(prev => ({ ...prev, [studentId]: res.data.attendance }));
            } else {
                const res = await axios.post('/attendances', { sessionId, studentId, status: newStatus });
                setAttendanceMap(prev => ({ ...prev, [studentId]: res.data.attendance }));
            }
            toast.success(`Marked as ${newStatus.toLowerCase()}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleSaveNote = async (studentId: string, noteText: string) => {
        const existing = attendanceMap[studentId];
        if (!existing) {
            toast.info("Please mark status first");
            return;
        }
        try {
            const res = await axios.put(`/attendances/${existing.id}`, { notes: noteText });
            setAttendanceMap(prev => ({ ...prev, [studentId]: res.data.attendance }));
            toast.success('Note saved');
        } catch (err) {
            toast.error('Failed to save note');
        }
    };

    const handleValidateSession = async () => {
        setValidating(true);
        try {
            await axios.put(`/sessions/validate/${sessionId}`);
            toast.success('Session validated');
            fetchData();
        } catch (err) {
            toast.error('Validation failed');
        } finally {
            setValidating(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-textMuted">Loading...</div>;

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-textMain">Attendance Management</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-textMuted">{session?.class?.name}</span>
                                <span className="w-1 h-1 bg-border rounded-full"></span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isSessionValidated ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {session?.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleValidateSession}
                        disabled={validating || isSessionValidated}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primaryHover transition-all font-bold shadow-md disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
                    >
                        {isSessionValidated ? <CheckCircle size={20} /> : <ShieldCheck size={20} />}
                        {isSessionValidated ? 'Validated' : 'Validate Session'}
                    </button>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {students.map((item) => {
                                const sId = item.studentId;
                                const att = attendanceMap[sId];
                                return (
                                    <tr key={sId} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-textMain">{item.student.user.firstName} {item.student.user.lastName}</p>
                                            <p className="text-xs text-textMuted">{item.student.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <AttBtn
                                                    active={att?.status === 'PRESENT'}
                                                    icon={<UserCheck size={14} />}
                                                    color="bg-green-600"
                                                    label="Present"
                                                    disabled={isSessionValidated}
                                                    onClick={() => handleStatusChange(sId, 'PRESENT')}
                                                />
                                                <AttBtn
                                                    active={att?.status === 'ABSENT'}
                                                    icon={<UserX size={14} />}
                                                    color="bg-red-600"
                                                    label="Absent"
                                                    disabled={isSessionValidated}
                                                    onClick={() => handleStatusChange(sId, 'ABSENT')}
                                                />
                                                <AttBtn
                                                    active={att?.status === 'LATE'}
                                                    icon={<Clock size={14} />}
                                                    color="bg-yellow-600"
                                                    label="Late"
                                                    disabled={isSessionValidated}
                                                    onClick={() => handleStatusChange(sId, 'LATE')}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group">
                                                <input
                                                    type="text"
                                                    placeholder="Add note..."
                                                    defaultValue={att?.notes || ''}
                                                    className="bg-transparent border-b border-border focus:border-primary outline-none text-sm w-full py-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveNote(sId, e.currentTarget.value);
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        handleSaveNote(sId, input.value);
                                                    }}
                                                    className="p-1.5 text-textMuted hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Save size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AttBtn: React.FC<{ active: boolean, icon: any, color: string, label: string, disabled: boolean, onClick: () => void }> = ({ active, icon, color, label, disabled, onClick }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${active
            ? `${color} text-white border-transparent shadow-inner`
            : 'bg-white text-textMuted border-border hover:bg-gray-50'
            } disabled:cursor-not-allowed ${disabled && !active ? 'opacity-40' : ''}`}
    >
        {icon} {label}
    </button>
);

export default AttendancePage;