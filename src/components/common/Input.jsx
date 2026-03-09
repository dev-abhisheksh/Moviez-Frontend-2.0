const Input = ({ label, ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
            <input
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-tmdbBlue focus:border-transparent outline-none transition duration-200"
                {...props}
            />
        </div>
    );
}

export default Input;