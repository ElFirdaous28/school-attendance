import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, Phone } from 'lucide-react';
import type { User } from '@school/shared';
import { ZodError } from 'zod';
import { createUserSchema, updateUserSchema } from '@school/shared';

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
    specialization?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (data: UserFormData) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'STUDENT',
        specialization: '',
        dateOfBirth: '',
        phoneNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fill form when modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                specialization: (user as any).teacher?.specialization || '',
                dateOfBirth: (user as any).student?.dateOfBirth
                    ? new Date((user as any).student.dateOfBirth)
                        .toISOString()
                        .split('T')[0] // <-- yyyy-MM-dd
                    : '',
                phoneNumber: (user as any).guardian?.phoneNumber || '',
                address: (user as any).guardian?.address || ''
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                role: 'STUDENT',
                specialization: '',
                dateOfBirth: '',
                phoneNumber: '',
                address: ''
            });
        }
        setErrors({});
    }, [user, isOpen]);

    const validate = (): boolean => {
        const schema = user ? updateUserSchema : createUserSchema;

        try {
            let dataToValidate;
            if (user) {
                const { role, ...rest } = formData;
                dataToValidate = rest;
            } else {
                dataToValidate = formData;
            }

            console.log('Validating data:', dataToValidate);

            schema.parse(dataToValidate);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach(e => {
                    if (e.path[0]) {
                        fieldErrors[e.path[0] as string] = e.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                setErrors({ general: 'Validation failed' });
            }
            return false;
        }
    };

    const handleSubmit = async () => {

        if (!validate()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error: any) {
            setErrors({ general: error.response.data.message || 'An error occurred while saving' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-textMain">
                        {user ? 'Edit User' : 'Create New User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-textMuted hover:text-textMain transition-colors"
                        type="button">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="john.doe@school.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password (only for new users)
                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Min 6 characters"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>
                    )} */}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            disabled={!!user}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed">
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="GUARDIAN">Guardian</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {user && (
                            <p className="text-textMuted text-xs mt-1">
                                Role cannot be changed after user creation
                            </p>
                        )}
                    </div>

                    {/* Role-specific fields */}
                    {formData.role === 'TEACHER' && (
                        <div className="border-t border-border pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen size={18} className="text-primary" />
                                <h3 className="font-medium text-textMain">Teacher Information</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Mathematics, Science, English"
                                />
                            </div>
                        </div>
                    )}

                    {formData.role === 'STUDENT' && (
                        <div className="border-t border-border pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={18} className="text-primary" />
                                <h3 className="font-medium text-textMain">Student Information</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth || ''}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />

                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {formData.role === 'GUARDIAN' && (
                        <div className="border-t border-border pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Phone size={18} className="text-primary" />
                                <h3 className="font-medium text-textMain">Guardian Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-textMain mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textMain mb-1">
                                        Address
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        rows={3}
                                        placeholder="123 Main St, City, State ZIP"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            onClick={onClose}
                            type="button"
                            className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-textMain font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            type="button"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Saving...
                                </span>
                            ) : (
                                user ? 'Update User' : 'Create User'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserModal;