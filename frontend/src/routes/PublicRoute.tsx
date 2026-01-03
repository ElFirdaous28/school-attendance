import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '@school/shared';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Outlet />; // user not logged in, render public route
    }

    switch (user.role) {
        case UserRole.ADMIN:
            return <Navigate to="/admin/dashboard" replace />;

        default:
            return <Navigate to="/" replace />;
    }
};

export default PublicRoute;
