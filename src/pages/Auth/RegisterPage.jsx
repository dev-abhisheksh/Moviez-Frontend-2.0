import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth.api';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await register(formData);
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Join MovieHub" subtitle="Start your 100% free movie journey">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                />
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                />

                {/* Password with toggle */}
                <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-tmdbBlue focus:border-transparent outline-none transition duration-200 pr-16"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                />

                {/* Error message */}
                {error && (
                    <p className="text-red-500 text-sm font-semibold bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                )}

                {/* Terms */}
                <div className="flex items-start gap-2 mt-2">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-brand focus:ring-brand" required />
                    <p className="text-xs text-gray-500">
                        I agree to the <span className="text-tmdbBlue cursor-pointer">Terms of Service</span> and <span className="text-tmdbBlue cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>

                <Button className="w-full justify-center py-3 mt-4" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand font-bold hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;