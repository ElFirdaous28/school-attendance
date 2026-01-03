import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import HeroImage from '../../assets/images/hero.png';
import OwlImage from '../../assets/images/owl.png';
import { loginSchema } from '@school/shared';
import type { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [backendError, setBackendError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setBackendError('');
            const res = await login.mutateAsync(data);
            toast.success('Welcome back!');

            // redict based on role
            switch (res.user.role) {
                case 'ADMIN':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'TEACHER':
                    navigate('/teacher/dashboard', { replace: true });
                    break;
                case 'STUDENT':
                    navigate('/student/attendance', { replace: true });
                    break;
                case 'GUARDIAN':
                    navigate('/guardian/dashboard', { replace: true });
                    break;
                default:
                    navigate('/', { replace: true });
            };
        } catch (err: any) {
            const res = err.response;
            if (res?.data?.errors) {
                Object.entries(res.data.errors).forEach(([field, message]) => {
                    setError(field as keyof LoginFormData, { type: 'backend', message: message as string });
                });
            } else {
                setBackendError(res?.data?.message || 'Login failed. Please check your connection.');
            }
        }
    };

    return (
        <main className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left Side: Form */}
            <div className="flex items-center justify-center flex-col p-6 md:p-12">
                <img src={OwlImage} className='w-20 h-20 -mb-1' alt="owl iamge" />
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden text-center">
                        <h2 className="text-2xl font-bold text-primary">EdTech</h2>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-textMain">Sign In</h1>
                            <p className="text-textMuted mt-1">Please enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-textMain text-sm font-semibold mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    placeholder="name@school.com"
                                    className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain transition-all outline-none focus:ring-2 ${errors.email ? 'border-absent focus:ring-absent/20' : 'border-border focus:border-primary focus:ring-primary/10'
                                        }`}
                                />
                                {errors.email && <span className="text-absent text-xs mt-1 inline-block">{errors.email.message}</span>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-textMain text-sm font-semibold mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        placeholder="••••••••"
                                        className={`w-full bg-background border rounded-xl px-4 py-3 text-textMain transition-all outline-none focus:ring-2 ${errors.password ? 'border-absent focus:ring-absent/20' : 'border-border focus:border-primary focus:ring-primary/10'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors p-1">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <span className="text-absent text-xs mt-1 inline-block">{errors.password.message}</span>}
                            </div>

                            {backendError && (
                                <div className="bg-absent/10 border border-absent/20 text-absent text-sm p-3 rounded-lg text-center">
                                    {backendError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /><span>Signing in</span></>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual Hero */}
            <div
                className="hidden lg:flex flex-col items-center justify-center bg-red-800 p-12 relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${HeroImage})` }}>
                {/* Optional overlay / gradient */}
                <div className="absolute inset-0 opacity-20 bg-black"></div>
            </div>
        </main>
    );
};

export default Login;