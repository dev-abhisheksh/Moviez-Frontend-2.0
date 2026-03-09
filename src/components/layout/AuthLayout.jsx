const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-textMain tracking-tight">
                        {title}<span className="text-brand">.</span>
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm font-medium">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;