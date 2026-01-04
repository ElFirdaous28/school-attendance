import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { z } from 'zod';
import Select from 'react-select';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';
import { updateStudentClassSchema, createStudentClassSchema } from '@school/shared';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    enrollmentData?: any | null; // For edit mode
    onSave: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
    isOpen,
    onClose,
    classId,
    enrollmentData,
    onSave
}) => {
    const axios = useAxios();
    const [students, setStudents] = useState<any[]>([]);

    const isEdit = !!enrollmentData;
    const schema = isEdit ? updateStudentClassSchema : createStudentClassSchema.omit({ classId: true });
    type EnrollmentFormData = z.infer<typeof schema>;

    const { control, handleSubmit, reset, register, formState: { isSubmitting, errors } } = useForm<EnrollmentFormData>({
        resolver: zodResolver(schema as any)
    });

    useEffect(() => {
        if (!isOpen) return;

        // Fetch students only when creating a new enrollment
        if (!enrollmentData) {
            axios.get('/users?role=STUDENT&limit=1000').then(res => setStudents(res.data.users));
        }

        reset({
            status: enrollmentData?.status,
            notes: enrollmentData?.notes || '',
            enrollmentEnd: enrollmentData?.enrollmentEnd ? new Date(enrollmentData.enrollmentEnd) : undefined
        });
    }, [isOpen, enrollmentData, reset, axios]);

    const studentOptions = useMemo(() =>
        students.map(s => ({
            value: s.id,
            label: `${s.firstName} ${s.lastName} (${s.email})`
        })), [students]
    );

    const onSubmit = async (data: EnrollmentFormData) => {
        try {
            if (enrollmentData) {
                // Only update enrollment-specific fields, no studentId or classId needed
                await axios.put(`/student-classes/${enrollmentData.id}`, data);
                toast.success('Enrollment updated');
            } else {
                // New enrollment requires studentId and classId
                const createData = data as any;
                if (!createData.studentId) {
                    toast.error('Please select a student');
                    return;
                }
                await axios.post('/student-classes', { ...createData, classId });
                toast.success('Student enrolled successfully');
            }
            onSave();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-md shadow-2xl">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textMain">
                        {enrollmentData ? 'Edit Enrollment' : 'Enroll Student'}
                    </h2>
                    <button onClick={onClose} className="text-textMuted hover:text-textMain"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Student selection only for new enrollment */}
                    {!enrollmentData && (
                        <div>
                            <label className="block text-sm font-semibold text-textMain mb-1.5">Student</label>
                            <Controller
                                name="studentId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={studentOptions}
                                        placeholder="Search student..."
                                        classNamePrefix="react-select"
                                        value={studentOptions.find(opt => opt.value === field.value)}
                                        onChange={val => field.onChange(val?.value)}
                                    />
                                )}
                            />
                            {(errors as any).studentId && <p className="text-red-500 text-xs mt-1">{(errors as any).studentId.message}</p>}
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-textMain mb-1.5">Enrollment Status</label>
                        <select
                            {...register('status')}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="ENROLLED_LATE">Enrolled Late</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="DROPPED">Dropped</option>
                        </select>
                    </div>

                    {/* Enrollment End */}
                    <div>
                        <label className="block text-sm font-semibold text-textMain mb-1.5">Enrollment End (Optional)</label>
                        <input
                            type="date"
                            {...register('enrollmentEnd')}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-textMain mb-1.5">Notes (Optional)</label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Add notes about this enrollment..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-textMain font-medium hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primaryHover disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                            {enrollmentData ? 'Update Enrollment' : 'Enroll Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollmentModal;
