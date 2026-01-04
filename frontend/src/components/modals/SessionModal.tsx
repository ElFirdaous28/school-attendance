import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Added Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { z } from 'zod';
import Select from 'react-select'; // Import react-select
import { useAxios } from '../../hooks/useAxios';
import { toast } from 'react-toastify';

const sessionFormSchema = z.object({
    classId: z.string().min(1, "Class is required"),
    teacherId: z.string().min(1, "Teacher is required"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    status: z.enum(["DRAFT", "VALIDATED"]).optional(),
}).superRefine((data, ctx) => {
    const start = new Date(`1970-01-01T${data.startTime}:00`);
    const end = new Date(`1970-01-01T${data.endTime}:00`);

    if (end <= start) {
        ctx.addIssue({
            path: ['endTime'],
            message: 'End time must be after start time',
            code: z.ZodIssueCode.custom,
        });
    }
});


type SessionFormData = z.infer<typeof sessionFormSchema>;

const SessionModal: React.FC<{ isOpen: boolean; onClose: () => void; sessionData: any; onSave: () => void; }> = ({ isOpen, onClose, sessionData, onSave }) => {
    const axios = useAxios();
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<SessionFormData>({
        resolver: zodResolver(sessionFormSchema)
    });

    useEffect(() => {
        if (isOpen) {
            axios.get('/classes?limit=100').then(res => setClasses(res.data.classes));
            axios.get('/users?role=TEACHER&limit=100').then(res => setTeachers(res.data.users));

            if (sessionData) {
                reset({
                    classId: sessionData.classId,
                    teacherId: sessionData.teacherId,
                    status: sessionData.status,
                    date: new Date(sessionData.date).toISOString().split('T')[0],
                    startTime: new Date(sessionData.startTime).toISOString().slice(11, 16),
                    endTime: new Date(sessionData.endTime).toISOString().slice(11, 16),
                });
            } else {
                reset({ classId: '', teacherId: '', date: '', startTime: '', endTime: '', status: 'DRAFT' });
            }
        }
    }, [isOpen, sessionData, reset]);

    // Map data to react-select format: { value: 'id', label: 'Name' }
    const classOptions = classes.map((c: any) => ({ value: c.id, label: c.name }));
    const teacherOptions = teachers.map((t: any) => ({ value: t.teacher.id, label: `${t.firstName} ${t.lastName}` }));

    const onSubmit = async (data: SessionFormData) => {
        try {
            // Convert date/time strings to Date objects
            const payload: any = {
                date: new Date(data.date),
                startTime: new Date(`${data.date}T${data.startTime}:00Z`),
                endTime: new Date(`${data.date}T${data.endTime}:00Z`),
                status: data.status,
            };

            if (!sessionData) {
                // Only include classId and teacherId when creating
                payload.classId = data.classId;
                payload.teacherId = data.teacherId;
                await axios.post('/sessions', payload);
                toast.success('Session created');
            } else {
                // On edit, do not include classId or teacherId
                await axios.put(`/sessions/${sessionData.id}`, payload);
                toast.success('Session updated');
            }

            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save session');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold">{sessionData ? 'Edit Session' : 'Schedule Session'}</h2>
                    <button onClick={onClose} className="text-textMuted"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {/* Class Searchable Select */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Class</label>
                        <Controller
                            name="classId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={classOptions}
                                    placeholder="Search and select class..."
                                    classNamePrefix="react-select"
                                    value={classOptions.find(opt => opt.value === field.value)}
                                    onChange={(val: any) => field.onChange(val.value)}
                                    isDisabled={!!sessionData} // Disable select if editing
                                />
                            )}
                        />
                        {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
                    </div>

                    {/* Teacher Searchable Select */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Teacher</label>
                        <Controller
                            name="teacherId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={teacherOptions}
                                    placeholder="Search teacher name..."
                                    classNamePrefix="react-select"
                                    value={teacherOptions.find(opt => opt.value === field.value)}
                                    onChange={(val: any) => field.onChange(val.value)}
                                    isDisabled={!!sessionData} // Disable select if editing
                                />
                            )}
                        />
                        {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId.message}</p>}
                    </div>

                    {/* Rest of the form remains the same */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input type="date" {...register('date')} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Time</label>
                            <input type="time" {...register('startTime')} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Time</label>
                            <input
                                type="time"
                                {...register('endTime')}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.endTime && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.endTime.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50">
                            {sessionData ? 'Update Session' : 'Create Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionModal;