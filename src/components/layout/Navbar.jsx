import { Link } from 'react-router-dom';

const Navbar = () => {
    const token = localStorage.getItem('token');
    let user = null;
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch (err) { }

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-black tracking-tighter text-brand">
                    MOVIE<span className="text-tmdbBlue">HUB</span>
                </Link>

            </div>

            <div className='flex gap-10 items-center'>
                <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                    <li><Link to="/" className="hover:text-brand transition">Home</Link></li>
                    <li><Link to="/search" className="hover:text-brand transition">Search</Link></li>
                    <li><Link to="/favourites" className="hover:text-brand transition">My List</Link></li>
                    {user?.role === 'admin' && (
                        <li><Link to="/admin/upload" className="hover:text-brand transition">Upload</Link></li>
                    )}
                </ul>

                <div className="flex items-center gap-4">
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
            </div>

        </nav>
    );
};

export default Navbar;