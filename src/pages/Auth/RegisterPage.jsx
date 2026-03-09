import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';


const RegisterPage = () => {
    return (
        <AuthLayout title="Join MovieHub" subtitle="Start your 100% free movie journey">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <Input label="Full Name" type="text" placeholder="John Doe" required />
                <Input label="Email Address" type="email" placeholder="name@example.com" required />
                <Input label="Password" type="password" placeholder="Minimum 6 characters" required />

                <div className="flex items-start gap-2 mt-2">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-brand focus:ring-brand" required />
                    <p className="text-xs text-gray-500">
                        I agree to the <span className="text-tmdbBlue cursor-pointer">Terms of Service</span> and <span className="text-tmdbBlue cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>

                <Button className="w-full justify-center py-3 mt-4">Create Account</Button>

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