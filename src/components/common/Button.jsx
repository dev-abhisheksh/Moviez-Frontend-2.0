const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-brand text-black hover:bg-red-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
    };

    return (
        <button
            className={`px-6 py-2.5 rounded-md font-semibold transition flex items-center gap-2 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;