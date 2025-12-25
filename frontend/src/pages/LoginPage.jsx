import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wallet, Mail, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const LoginPage = () => {
    const [toast, setToast] = useState(null);
    
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError: setFormError,
    } = useForm({
        mode: 'all', // Validate on change, blur, and submit
        reValidateMode: 'onChange', // Re-validate on every change
        criteriaMode: 'all', // Show all errors
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);
        
        if (result.success) {
            navigate('/');
        } else {
            const msg = result.message || 'Invalid email or password';
            setFormError('root', { message: msg });
            setToast({ message: msg, type: 'error' });
            setTimeout(() => setToast(null), 5000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--ft-bg)] px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[color:var(--ft-text)]">Welcome Back</h2>
                    <p className="mt-2 text-[color:var(--ft-muted)]">Sign in to your Finance Tracker account</p>
                </div>

                {/* Toast - Fixed positioning with animation */}
                {toast && (
                    <div className="fixed z-50 flex items-center gap-3 px-4 py-3 text-white duration-300 border-2 rounded-lg shadow-xl top-4 right-4 bg-red-500/20 border-red-500/60 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
                        <span className="text-sm font-semibold">{toast.message}</span>
                    </div>
                )}

                                {/* Login Form */}
                                <div className="p-8 ft-surface rounded-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {errors.root && (
                            <div className="flex items-center gap-2 p-3 border rounded-lg bg-red-500/10 border-red-500/50">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-sm text-red-500">{errors.root.message}</p>
                            </div>
                        )}

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                <Input
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    placeholder="you@example.com"
                                    className={`pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                <Input
                                    type="password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    placeholder="••••••••"
                                    className={`pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                            </div>
                            {errors.password && (
                                <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full font-bold text-blue-600 bg-blue-700 hover:bg-blue-700"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-blue-500 hover:text-blue-400">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Info */}
                <div className="p-4 border rounded-lg bg-blue-500/10 border-blue-500/30">
                    <p className="text-sm text-center text-blue-400">
                        <strong>New user?</strong> Create an account to start tracking your expenses!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
