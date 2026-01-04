import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';
import { createClassSchema, updateClassSchema, type Class } from '@school/shared';
import { z } from 'zod';

type ClassFormData = {
    name: string;
    level: string;
    capacity: number;
    startDate: string;        // input type="date" expects string
    endDate?: string;
    status?: 'ACTIVE' | 'FINISHED';
};

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData: Class | null;
    onSave: () => void;
}

// Form validation schema for RHF (string-based dates)
const formSchema = z.object({
    name: z.string().min(1),
    level: z.string().min(1),
    capacity: z.number().int().positive(),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    status: z.enum(['ACTIVE', 'FINISHED']).optional(),
});

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, classData, onSave }) => {
    const axios = useAxios();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<ClassFormData>({
            resolver: zodResolver(formSchema),
        });

    useEffect(() => {
        if (classData && isOpen) {
            reset({
                name: classData.name,
                level: classData.level,
                capacity: classData.capacity,
                startDate: new Date(classData.startDate).toISOString().split('T')[0],
                endDate: classData.endDate ? new Date(classData.endDate).toISOString().split('T')[0] : undefined,
                status: classData.status,
            });
        } else if (isOpen) {
            reset({ name: '', level: '', capacity: 20, startDate: '', status: 'ACTIVE' });
        }
    }, [classData, isOpen, reset]);

    const onSubmit = async (data: ClassFormData) => {
        try {
            // Convert strings back to Dates for backend
            const payload = {
                ...data,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
            };

            // Validate using your shared Zod schema (optional, just to ensure backend consistency)
            if (classData) {
                updateClassSchema.parse(payload);
                await axios.put(`/classes/${classData.id}`, payload);
                toast.success('Class updated');
            } else {
                createClassSchema.parse(payload);
                await axios.post('/classes', payload);
                toast.success('Class created');
            }

            onSave();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Action failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-xl font-bold text-textMain">{classData ? 'Edit Class' : 'Create Class'}</h2>
                    <button onClick={onClose} className="text-textMuted hover:text-textMain"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 bg-surface">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Class Name</label>
                        <input
                            {...register('name')}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">Level</label>
                            <input
                                {...register('level')}
                                placeholder="e.g. Grade 10"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none" />
                            {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">Capacity</label>
                            <input
                                type="number"
                                {...register('capacity')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none" />
                            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">Start Date</label>
                            <input
                                type="date"
                                {...register('startDate')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none" />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">End Date (Optional)</label>
                            <input
                                type="date"
                                {...register('endDate')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-textMain font-medium hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primaryHover disabled:opacity-50 shadow-md flex items-center gap-2">
                            {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            {classData ? 'Update Class' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassModal;