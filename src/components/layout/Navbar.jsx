import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const token = localStorage.getItem('token');
    let user = null;
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch (err) { }

    // Close drawer on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);


    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/search', label: 'Search' },
        { to: '/favourites', label: 'My List' },
    ];

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white text-black lg:bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-black tracking-tighter text-brand">
                    MOVIE<span className="text-tmdbBlue">HUB</span>
                </Link>
            </div>

            {/* Desktop Nav */}
            <div className="flex gap-10 items-center">
                <ul className="hidden lg:flex gap-6 text-sm font-medium text-gray-600">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <Link to={to} className="hover:text-brand transition">{label}</Link>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li><Link to="/admin/dashboard" className="hover:text-brand transition">Dashboard</Link></li>
                    )}
                </ul>

                {/* Desktop Auth */}
                <div className="hidden lg:flex items-center gap-4">
                    {token ? (
                        <Link to="/profile">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                                className="w-9 h-9 rounded-full border border-gray-200"
                                alt="profile"
                            />
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-brand text-white px-5 py-2 rounded-md font-semibold text-sm hover:bg-red-700 transition">
                            Login
                        </Link>
                    )}
                </div>

                {/* Hamburger Button – mobile only */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative z-[110] flex lg:hidden flex-col items-center justify-center w-10 h-10 rounded-md bg-white/80 backdrop-blur-sm focus:outline-none"
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    <span
                        className={`block h-0.5 w-6 bg-gray-800 rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-[5px]' : ''}`}
                    />
                    <span
                        className={`block h-0.5 w-6 bg-gray-800 rounded-full mt-[4px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-x-0' : ''}`}
                    />
                    <span
                        className={`block h-0.5 w-6 bg-gray-800 rounded-full mt-[4px] transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}
                    />
                </button>
            </div>

            {/* ===== Mobile Drawer ===== */}

            {/* Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Slide-out panel */}
            <div
                className={`fixed inset-y-0 right-0 w-64 bg-[#F8F9FA] z-[100] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-lg font-bold text-brand">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav links */}
                <ul className="flex flex-col bg-white px-4 py-4 gap-1">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className="block bg-white px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-brand transition"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <Link
                                to="/admin/dashboard"
                                className="block bg-white px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-brand transition"
                            >
                                Dashboard
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Auth section */}
                <div className="px-4 mt-2 border-t border-gray-100 pt-4">
                    {token ? (
                        <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                                className="w-9 h-9 rounded-full border border-gray-200"
                                alt="profile"
                            />
                            <span className="text-sm font-medium text-gray-700">Profile</span>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="block w-full text-center bg-brand text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-red-700 transition"
                        >
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;