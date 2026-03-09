import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
    icon = "🎬",
    title = "Nothing to see here",
    message = "We couldn't find what you were looking for.",
    actionText = "Return Home",
    actionLink = "/",
    onAction = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="text-6xl md:text-8xl mb-6 opacity-80 filter grayscale drop-shadow-lg">
                {icon}
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-textMain tracking-tight mb-3">
                {title}
            </h2>
            <p className="text-gray-500 text-lg max-w-md mb-8">
                {message}
            </p>

            {onAction ? (
                <button
                    onClick={onAction}
                    className="bg-brand hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-red-500/20"
                >
                    {actionText}
                </button>
            ) : (
                <Link
                    to={actionLink}
                    className="bg-brand hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-red-500/20"
                >
                    {actionText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;
