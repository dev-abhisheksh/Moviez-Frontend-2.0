const AdminLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-8">
                <h2 className="text-xl font-black text-brand">Admin<span>Panel</span></h2>
                <nav className="flex flex-col gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-brand rounded-xl font-bold">
                        📊 Dashboard
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition">
                        🎬 Manage Media
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition">
                        👥 User Moderation
                    </button>
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-10">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;