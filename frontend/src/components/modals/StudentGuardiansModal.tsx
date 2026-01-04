import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Heart, Star, ShieldCheck, Edit2 } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';
import Select from 'react-select';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    studentUser: any;
    onEditGuardian: (guardianUser: any) => void; // Added to handle editing
}

const StudentGuardiansModal: React.FC<Props> = ({ isOpen, onClose, studentUser, onEditGuardian }) => {
    const axios = useAxios();
    const [linkedGuardians, setLinkedGuardians] = useState<any[]>([]);
    const [allGuardians, setAllGuardians] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedGuardianId, setSelectedGuardianId] = useState<string | null>(null);
    const [relationType, setRelationType] = useState('PARENT');

    const fetchData = async () => {
        if (!studentUser?.student?.id) return;
        try {
            const [linkedRes, guardiansRes] = await Promise.all([
                axios.get(`/guardian-students/student/${studentUser.student.id}`),
                axios.get('/users?role=GUARDIAN&limit=1000')
            ]);
            setLinkedGuardians(linkedRes.data.guardians);
            setAllGuardians(guardiansRes.data.users);
        } catch (err) {
            toast.error("Failed to load guardian data");
        }
    };

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen, studentUser]);

    const handleLink = async () => {
        if (!selectedGuardianId) return;
        setLoading(true);
        try {
            await axios.post('/guardian-students', {
                studentId: studentUser.student.id,
                guardianId: selectedGuardianId,
                relationType,
                isPrimary: linkedGuardians.length === 0
            });
            toast.success("Guardian linked successfully");
            setSelectedGuardianId(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Link failed");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (id: string) => {
        try {
            await axios.delete(`/guardian-students/${id}`);
            toast.success("Guardian unlinked");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleSetPrimary = async (guardianId: string) => {
        try {
            await axios.put(`/guardian-students/set-primary/${guardianId}/${studentUser.student.id}`);
            toast.success("Primary guardian updated");
            fetchData();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const options = useMemo(() =>
        allGuardians
            .filter(g => !linkedGuardians.some(lg => lg.guardianId === g.guardian?.id))
            .map(g => ({
                value: g.guardian?.id,
                label: `${g.firstName} ${g.lastName} (${g.email})`
            })),
        [allGuardians, linkedGuardians]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                    <div>
                        <h2 className="text-xl font-bold text-textMain">Family & Guardians</h2>
                        <p className="text-sm text-textMuted">Managing for: {studentUser.firstName} {studentUser.lastName}</p>
                    </div>
                    <button onClick={onClose} className="text-textMuted hover:text-textMain transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-background p-4 rounded-lg border border-border">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-1">Relationship</label>
                            <select
                                value={relationType}
                                onChange={(e) => setRelationType(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="PARENT">Parent</option>
                                <option value="GRANDPARENT">Grandparent</option>
                                <option value="SIBLING">Sibling</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-1">Search Guardian</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select
                                        options={options}
                                        placeholder="Name or email..."
                                        onChange={(opt: any) => setSelectedGuardianId(opt?.value)}
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <button
                                    onClick={handleLink}
                                    disabled={loading || !selectedGuardianId}
                                    className="px-4 bg-primary text-white rounded-lg hover:bg-primaryHover disabled:opacity-50 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Current Guardians</h3>
                        {linkedGuardians.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-border rounded-lg">
                                <p className="text-textMuted text-sm">No guardians linked to this student yet.</p>
                            </div>
                        ) : (
                            linkedGuardians.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                            <Heart size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-textMain">{item.guardian.user.firstName} {item.guardian.user.lastName}</p>
                                            <div className="flex items-center gap-3 text-xs text-textMuted mt-0.5">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{item.relationType}</span>
                                                {item.isPrimary && (
                                                    <span className="text-present flex items-center gap-1 font-bold italic">
                                                        <ShieldCheck size={12} /> Emergency Contact
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {/* Edit Button */}
                                        <button 
                                            onClick={() => onEditGuardian(item.guardian.user)}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Edit Guardian Profile"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleSetPrimary(item.guardianId)}
                                            className={`p-2 rounded-lg transition-colors ${item.isPrimary ? 'text-late bg-late/10' : 'text-textMuted hover:bg-gray-100'}`}
                                            title={item.isPrimary ? "Primary Guardian" : "Set as Primary"}
                                        >
                                            <Star size={18} fill={item.isPrimary ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => handleUnlink(item.id)}
                                            className="p-2 text-absent hover:bg-absent/10 rounded-lg transition-colors"
                                            title="Remove Link"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentGuardiansModal;