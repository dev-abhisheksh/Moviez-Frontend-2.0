import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import Input from '../../components/common/Input';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';


const LoginPage = () => {
    // Login only needs email and password
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await login(formData);

            // Save the token and user object
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Log in to your MovieHub account">
            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{error}</p>}

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <Button type="submit" className="w-full justify-center py-3" disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign In'}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-6">
                    New to MovieHub?{' '}
                    <Link to="/signup" className="text-brand font-bold hover:underline">Create an account</Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;