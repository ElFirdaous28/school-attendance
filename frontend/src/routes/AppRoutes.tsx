import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import PublicRoute from './PublicRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import ClassEnrollments from '@/pages/admin/ClassEnrollments';
import Attendance from '@/pages/admin/Attendance';

// Lazy load pages
const Layout = lazy(() => import('../layout/Layout'));
const Login = lazy(() => import('../pages/auth/Login'));
const NotFound = lazy(() => import('../pages/app/NotFound'));
const Users = lazy(() => import('../pages/admin/Users'));
const Classes = lazy(() => import('../pages/admin/Classes'));
const Subjects = lazy(() => import('../pages/admin/Subjects'));
const Sessions = lazy(() => import('../pages/admin/Sessions'));
const StudentAttendance = lazy(() => import('../pages/student/Attendance'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />} >
            {/* Login route */}
            <Route path='/login' element={<Login />} />
          </Route>

          {/* routes tking layou */}
          <Route path="/" element={<Layout />}>
            {/*admin routes  */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']} />}>
              <Route path='/attendance/:sessionId' element={<Attendance />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/users' element={<Users />} />
              <Route path='/admin/classes' element={<Classes />} />
              <Route path='/admin/subjects' element={<Subjects />} />
              <Route path='/admin/sessions' element={<Sessions />} />
              <Route path='/admin/class-enrollments/:classId' element={<ClassEnrollments />} />
            </Route>

            {/* teacher routes */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route path='/teacher/dashboard' element={<AdminDashboard />} />
              <Route path='/teacher/sessions' element={<Sessions />} />
            </Route>

            {/* student routes */}
            <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
              <Route path='/student/attendance' element={<StudentAttendance />} />
            </Route>
          </Route>


          {/* catche unauthorized routes */}
          <Route path="/unauthorized" element="unauthorized" />
          {/* catche not found routes */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
