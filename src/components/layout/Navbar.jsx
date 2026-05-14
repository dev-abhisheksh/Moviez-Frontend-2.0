import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
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

    // Track scroll for navbar background
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/search', label: 'Search' },
        ...(token ? [
            { to: '/favourites', label: 'My List' },
            { to: '/history', label: 'History' },
        ] : []),
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 lg:px-16 py-3 transition-all duration-300 ${
            scrolled
                ? 'bg-black/40 backdrop-blur-xl'
                : 'bg-gradient-to-b from-black/60 to-transparent'
        }`}>
            <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-black tracking-tighter text-brand">
                    MOVIE<span className="text-white">HUB</span>
                </Link>
            </div>

            {/* Desktop Nav */}
            <div className="flex gap-10 items-center">
                <ul className="hidden lg:flex gap-6 text-sm font-medium text-white/60">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`hover:text-white transition-colors duration-200 ${
                                    location.pathname === to ? 'text-white font-semibold' : ''
                                }`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <Link to="/admin/dashboard" className="hover:text-white transition-colors duration-200">
                                Dashboard
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Desktop Auth */}
                <div className="hidden lg:flex items-center gap-4">
                    {token ? (
                        <Link to="/profile">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=E50914&color=fff`}
                                className="w-9 h-9 rounded-full border-2 border-white/20 hover:border-brand/60 transition-colors"
                                alt="profile"
                            />
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-brand text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition shadow-lg shadow-brand/20">
                            Login
                        </Link>
                    )}
                </div>

                {/* Hamburger Button – mobile only */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative z-[110] flex lg:hidden flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none"
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    <span
                        className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-[5px]' : ''}`}
                    />
                    <span
                        className={`block h-0.5 w-5 bg-white rounded-full mt-[4px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-x-0' : ''}`}
                    />
                    <span
                        className={`block h-0.5 w-5 bg-white rounded-full mt-[4px] transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}
                    />
                </button>
            </div>
        </nav>

        {/* ===== Mobile Drawer ===== */}

            {/* Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Slide-out panel */}
            <div
                className={`fixed inset-y-0 right-0 w-72 bg-surfaceDark z-[100] shadow-2xl shadow-black/50 transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <span className="text-lg font-bold text-brand">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav links */}
                <ul className="flex flex-col px-4 py-4 gap-1">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                                    location.pathname === to
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <Link
                                to="/admin/dashboard"
                                className="block px-4 py-3 rounded-lg text-base font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors duration-200"
                            >
                                Dashboard
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Auth section */}
                <div className="px-4 mt-2 border-t border-white/10 pt-4">
                    {token ? (
                        <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=E50914&color=fff`}
                                className="w-9 h-9 rounded-full border-2 border-white/20"
                                alt="profile"
                            />
                            <span className="text-sm font-medium text-white/80">Profile</span>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="block w-full text-center bg-brand text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-red-600 transition shadow-lg shadow-brand/20"
                        >
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;