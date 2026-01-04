import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserMinus, Plus, Mail, ArrowLeft, GraduationCap, Edit2 } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { toast } from 'react-toastify';
import EnrollmentModal from '@/components/modals/EnrollmentModal';

const ClassEnrollments: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const axios = useAxios();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [classInfo, setClassInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [enrollRes, classRes] = await Promise.all([
                axios.get(`/student-classes/class/${classId}/students`),
                axios.get(`/classes/${classId}`)
            ]);
            setEnrollments(enrollRes.data.students);
            setClassInfo(classRes.data._class);
        } catch (err) {
            toast.error('Failed to fetch enrollment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [classId]);

    const handleRemove = async (enrollmentId: string) => {
        try {
            await axios.delete(`/student-classes/${enrollmentId}`);
            toast.success('Student removed from class');
            fetchData();
        } catch (err) {
            toast.error('Failed to remove student');
        }
    };

    return (
        <div className="min-h-screen w-full bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="p-2 hover:bg-surface rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-textMain">{classInfo?.name || 'Class'} Enrollments</h1>
                            <p className="text-textMuted">{classInfo?.level} • {enrollments.length} Students enrolled</p>
                        </div>
                    </div>
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-all shadow-md font-medium">
                        <Plus size={20} /> Enroll Student
                    </button>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted uppercase">Student</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted uppercase">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textMuted uppercase">Enrollment Date</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-textMuted uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={4} className="py-20 text-center text-textMuted">Loading students...</td></tr>
                            ) : enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <GraduationCap size={48} className="mx-auto text-textMuted mb-2 opacity-20" />
                                        <p className="text-textMuted">No students enrolled in this class yet.</p>
                                    </td>
                                </tr>
                            ) : enrollments.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {item.student.user.firstName[0]}{item.student.user.lastName[0]}
                                            </div>
                                            <span className="font-medium text-textMain">
                                                {item.student.user.firstName} {item.student.user.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-textMuted">
                                            <Mail size={14} /> {item.student.user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-textMuted">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedEnrollment(item); setModalOpen(true); }}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Edit Enrollment"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <ConfirmDialog
                                                trigger={
                                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <UserMinus size={18} />
                                                    </button>
                                                }
                                                onConfirm={() => handleRemove(item.id)}
                                                title="Remove from Class?"
                                                description={`Remove ${item.student.user.firstName} from this class?`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EnrollmentModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedEnrollment(null); }}
                classId={classId!}
                enrollmentData={selectedEnrollment}
                onSave={fetchData}
            />
        </div>
    );
};

export default ClassEnrollments;