import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import Test from '../pages/app/Test';
import PublicRoute from './PublicRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import ProtectedRoute from './ProtectedRoute';
import Classes from '@/pages/admin/Classes';
import Subjects from '@/pages/admin/Subjects';

// Lazy load pages
const Layout = lazy(() => import('../layout/Layout'));
const Login = lazy(() => import('../pages/auth/Login'));
const NotFound = lazy(() => import('../pages/app/NotFound'));

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
            <Route path='/test' element={<Test />} />
            {/*admin routes  */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/users' element={<Users />} />
              <Route path='/admin/classes' element={<Classes />} />
              <Route path='/admin/subjects' element={<Subjects />} />
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
