import React, { useState } from 'react';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  ClipboardList,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react';


import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (open: boolean) => void }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = {
    ADMIN: [
      { title: 'Dashboard', path: '/admin/dashboard', icon: Home },

      // School referential
      { title: 'Classes', path: '/admin/classes', icon: GraduationCap },
      { title: 'Users', path: '/admin/users', icon: Users },
      { title: 'Subjects', path: '/admin/subjects', icon: BookOpen },

      // Attendance
      { title: 'Sessions', path: '/admin/sessions', icon: CalendarDays },
      // { title: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },

      // Reports
      { title: 'Reports', path: '/admin/reports', icon: BarChart3 },
    ],

    TEACHER: [
      { title: 'Dashboard', path: '/teacher/dashboard', icon: Home },

      // Teaching flow
      { title: 'My Sessions', path: '/teacher/sessions', icon: CalendarDays },
      { title: 'Take Attendance', path: '/teacher/attendance', icon: ClipboardList },
    ],

    STUDENT: [
      { title: 'My Attendance', path: '/student/attendance', icon: ClipboardCheck },
    ],

    GUARDIAN: [
      { title: 'Dashboard', path: '/guardian/dashboard', icon: Home },
      { title: 'Child Attendance', path: '/guardian/attendance', icon: ClipboardCheck },
      { title: 'Reports', path: '/guardian/reports', icon: BarChart3 },
    ],
  };

  const roleLinks = user ? links[user.role as keyof typeof links] ?? [] : [];

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          /* BASE STYLES */
          bg-primary z-40 transition-all duration-300 overflow-hidden flex flex-col
          
          /* MOBILE: Fixed position, slide-in logic */
          fixed inset-y-0 left-0 h-full
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}

          /* DESKTOP: Relative position (part of flex row), always visible */
          md:translate-x-0 md:relative md:inset-auto 
          
          /* WIDTH LOGIC (Both Mobile & Desktop) */
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Branding Section */}
          <div
            className={`flex items-center gap-2 h-20 pl-4 border-b border-border shadow-sm transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-xl text-white">
              <img className="w-10" src="/images/logo.png" alt="logo" />
            </div>

            <div className="flex flex-col">
              <Logo isExpanded={isExpanded} className={'text-white'} />

              {/* Slanted Badge */}
              {user?.role && isExpanded && (
                <span className={`text-xs py-0.5 rounded-full capitalize tracking-wider text-text-muted`}>
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 shadow-[0_6px_-1px_rgba(0,0,0,0.4)] border-r border-border">
            {/* Navigation: flex-1 allows it to grow/scroll within the parent */}
            <nav className="space-y-2 flex-1 p-4 overflow-y-auto">
              {roleLinks.map(({ title, path, icon: Icon }) => {
                const isActive = pathname === path;

                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-200 ${isActive ? 'bg-secondary' : 'hover:bg-secondaryHover hover:text-white'}`}>
                    <Icon className="w-5 h-5 min-w-5" />
                    <span
                      className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                      {title}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className={`flex p-4 mt-auto ${isExpanded ? 'justify-end' : 'justify-center'}`}>
              <button
                aria-label="Toggle Expand Sidebar"
                onClick={toggleExpanded}
                className="flex items-center justify-center w-10 h-10 bg-secondary text-white rounded-lg hover:bg-secondaryHover transition-colors">
                {isExpanded ? (
                  <ChevronsLeft className="w-5 h-5" />
                ) : (
                  <ChevronsRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default React.memo(Sidebar)