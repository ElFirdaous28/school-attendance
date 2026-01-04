import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Star } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';
import Select from 'react-select';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    guardianUser: any;
}

const GuardianChildrenModal: React.FC<Props> = ({ isOpen, onClose, guardianUser }) => {
    const axios = useAxios();
    const [children, setChildren] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const fetchData = async () => {
        if (!guardianUser?.guardian?.id) return;
        try {
            const [linkedRes, studentsRes] = await Promise.all([
                axios.get(`/guardian-students/guardian/${guardianUser.guardian.id}`),
                axios.get('/users?role=STUDENT&limit=1000')
            ]);
            setChildren(linkedRes.data.students);
            setAllStudents(studentsRes.data.users);
        } catch (err) {
            toast.error("Failed to load data");
        }
    };

    useEffect(() => { if (isOpen) fetchData(); }, [isOpen, guardianUser]);

    const handleLink = async () => {
        if (!selectedStudentId) return;
        setLoading(true);
        try {
            await axios.post('/guardian-students', {
                guardianId: guardianUser.guardian.id,
                studentId: selectedStudentId,
                relationType: 'PARENT',
                isPrimary: children.length === 0
            });
            toast.success("Child linked");
            setSelectedStudentId(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Link failed");
        } finally { setLoading(false); }
    };

    const handleUnlink = async (id: string) => {
        try {
            await axios.delete(`/guardian-students/${id}`);
            toast.success("Relationship removed");
            fetchData();
        } catch (err) { toast.error("Action failed"); }
    };

    const handleSetPrimary = async (studentId: string) => {
        try {
            await axios.put(`/guardian-students/set-primary/${guardianUser.guardian.id}/${studentId}`);
            toast.success("Primary status updated");
            fetchData();
        } catch (err) { toast.error("Action failed"); }
    };

    if (!isOpen) return null;

    const options = allStudents
        .filter(s => !children.some(c => c.studentId === s.student?.id))
        .map(s => ({ value: s.student?.id, label: `${s.firstName} ${s.lastName} (${s.email})` }));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-xl font-bold text-textMain">Manage Children for {guardianUser.firstName}</h2>
                    <button onClick={onClose} className="text-textMuted hover:text-textMain"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Select
                                options={options}
                                placeholder="Search student name..."
                                onChange={(opt: any) => setSelectedStudentId(opt?.value)}
                                classNamePrefix="react-select"
                            />
                        </div>
                        <button onClick={handleLink} disabled={loading || !selectedStudentId} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover disabled:opacity-50 transition-colors">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {children.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary"><User size={18} /></div>
                                    <div>
                                        <p className="font-medium text-textMain">{item.student.user.firstName} {item.student.user.lastName}</p>
                                        <p className="text-xs text-textMuted">{item.relationType}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSetPrimary(item.studentId)}
                                        className={`p-2 rounded-lg transition-colors ${item.isPrimary ? 'text-late bg-late/10' : 'text-textMuted hover:bg-gray-100'}`}
                                        title="Set as Primary Guardian">
                                        <Star size={18} fill={item.isPrimary ? "currentColor" : "none"} />
                                    </button>
                                    <button onClick={() => handleUnlink(item.id)} className="p-2 text-absent hover:bg-absent/10 rounded-lg"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardianChildrenModal;