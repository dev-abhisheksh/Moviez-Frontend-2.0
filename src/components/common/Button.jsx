const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-brand text-white hover:bg-red-700',
        secondary: 'bg-surfaceDark text-white hover:bg-gray-800',
        outline: 'border-2 border-gray-700 text-gray-300 hover:bg-cardDark hover:text-white'
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