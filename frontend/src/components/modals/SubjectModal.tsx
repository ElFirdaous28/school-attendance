import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { z } from 'zod';
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';

const subjectSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    code: z.string().min(2, "Code is required (e.g., MATH101)"),
    description: z.string().optional().nullable(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectData: any | null;
    onSave: () => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, subjectData, onSave }) => {
    const axios = useAxios();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubjectFormData>({
        resolver: zodResolver(subjectSchema)
    });

    useEffect(() => {
        if (subjectData && isOpen) {
            reset({
                name: subjectData.name,
                code: subjectData.code,
                description: subjectData.description || '',
            });
        } else if (isOpen) {
            reset({ name: '', code: '', description: '' });
        }
    }, [subjectData, isOpen, reset]);

    const onSubmit = async (data: SubjectFormData) => {
        try {
            if (subjectData) {
                await axios.put(`/subjects/${subjectData.id}`, data);
                toast.success('Subject updated');
            } else {
                await axios.post('/subjects', data);
                toast.success('Subject created');
            }
            onSave();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-xl font-bold text-textMain">{subjectData ? 'Edit Subject' : 'Create Subject'}</h2>
                    <button onClick={onClose} className="text-textMuted hover:text-textMain"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 bg-surface">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Subject Name</label>
                        <input
                            {...register('name')}
                            placeholder="e.g. Mathematics"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Subject Code</label>
                        <input
                            {...register('code')}
                            placeholder="e.g. MATH-101"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                        />
                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            placeholder="Briefly describe the subject curriculum..."
                            className="w-full px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-textMain font-medium hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primaryHover disabled:opacity-50 shadow-md flex items-center gap-2"
                        >
                            {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            {subjectData ? 'Update Subject' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubjectModal;