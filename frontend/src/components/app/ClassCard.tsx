import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Edit2, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';

interface ClassCardProps {
    cls: any;
    onEdit?: (cls: any) => void;
    onDelete?: (id: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ cls, onEdit, onDelete }) => {
    return (
        <Link
            to={`/admin/class-enrollments/${cls.id}`}
            className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group block"
        >
            <div
                className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-lg 
        ${cls.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
                {cls.status}
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-textMain truncate">{cls.name}</h3>
                <span className="text-sm text-primary font-medium">{cls.level}</span>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-textMuted">
                    <Users size={16} /> <span>Capacity: {cls.capacity} Students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-textMuted">
                    <Calendar size={16} /> <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                </div>
            </div>

            {(onEdit || onDelete) && (
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    {onEdit && (
                        <button
                            onClick={e => {
                                e.preventDefault(); // prevent Link navigation
                                e.stopPropagation(); // stop bubbling
                                onEdit(cls);
                            }}
                            className="p-2 text-primary hover:bg-primary/5 rounded-lg"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <ConfirmDialog
                            trigger={
                                <button
                                    onClick={e => e.stopPropagation()} // stop Link navigation
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            }
                            onConfirm={() => onDelete(cls.id)}
                            title="Delete Class?"
                            description="Are you sure you want to remove this class?"
                        />
                    )}
                </div>
            )}
        </Link>
    );
};

export default ClassCard;
