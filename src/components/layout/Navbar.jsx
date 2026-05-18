import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchModal from '../movies/SearchModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
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

    // Ctrl+K / Cmd+K shortcut to open search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navLinks = [
        { to: '/', label: 'Home' },
        ...(token ? [
            { to: '/favourites', label: 'My List' },
            { to: '/history', label: 'History' },
        ] : []),
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 lg:px-16 py-3 transition-all duration-300 ${scrolled
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
                    <ul className="hidden lg:flex gap-6 text-sm font-medium text-white/60 items-center">
                        {navLinks.map(({ to, label }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className={`hover:text-white transition-colors duration-200 ${location.pathname === to ? 'text-white font-semibold' : ''
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

                        {/* Search Button */}
                        <li>
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/15 transition-all duration-200 group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="11" cy="11" r="8" />
                                    <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                                </svg>
                                <span className="text-white/30 text-xs group-hover:text-white/50 transition">Search</span>
                                <kbd className="hidden sm:inline text-[10px] text-white/15 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono ml-2">⌘K</kbd>
                            </button>
                        </li>
                    </ul>

                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center gap-3">
                        {token ? (
                            <>
                                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=E50914&color=fff`}
                                        className="w-7 h-7 rounded-full"
                                        alt="avatar"
                                    />
                                    <span className="text-sm font-medium text-white/70">{user?.name?.split(' ')[0] || 'User'}</span>
                                </div>
                                <button
                                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-brand text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition shadow-lg shadow-brand/20">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile: search icon + hamburger */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm"
                            aria-label="Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="11" cy="11" r="8" />
                                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative z-[110] flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none"
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                        >
                            <span className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
                            <span className={`block h-0.5 w-5 bg-white rounded-full mt-[4px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
                            <span className={`block h-0.5 w-5 bg-white rounded-full mt-[4px] transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
                        </button>
                    </div>
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

                {/* Search in drawer */}
                <div className="px-4 py-3">
                    <button
                        onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-sm hover:bg-white/[0.08] transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="11" cy="11" r="8" />
                            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                        </svg>
                        Search...
                    </button>
                </div>

                {/* Nav links */}
                <ul className="flex flex-col px-4 py-2 gap-1">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${location.pathname === to
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
                        <button
                            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/5 transition text-left"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=E50914&color=fff`}
                                className="w-9 h-9 rounded-full border-2 border-white/20"
                                alt="avatar"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium text-white/80 block">{user?.name || 'User'}</span>
                                <span className="text-xs text-white/30">Tap to logout</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
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

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
};

export default Navbar;