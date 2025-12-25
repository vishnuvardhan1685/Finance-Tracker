import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wallet, User, Mail, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const SignupPage = () => {
  const [toast, setToast] = useState(null);
  
  const { signup, isLoading } = useAuthStore();
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
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await signup(data.name, data.email, data.password);
    
    if (result.success) {
      navigate('/');
    } else {
      const msg = result.message || 'Signup failed';
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
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[color:var(--ft-text)]">Create Account</h2>
          <p className="mt-2 text-[color:var(--ft-muted)]">Start tracking your finances today</p>
        </div>

        {/* Toast - Fixed positioning with stronger styling */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border-2 bg-red-500/20 border-red-500/60 text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Signup Form */}
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  placeholder="John Doe"
                  className={`pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

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
              <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-bold text-green-600 bg-green-700 hover:bg-green-700"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-green-500 hover:text-green-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-4 space-y-2 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Track all your expenses in one place</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>View statistics and spending patterns</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Secure and private - your data is protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
