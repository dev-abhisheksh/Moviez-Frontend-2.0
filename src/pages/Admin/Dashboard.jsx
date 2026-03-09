import { useState } from 'react';
import MediaTable from '../../components/admin/MediaTable';
import UserTable from '../../components/admin/UserTable';

const tabs = [
    { key: 'media', label: 'Media Management', icon: '🎬' },
    { key: 'users', label: 'User Management', icon: '👥' },
];

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('media');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar for mobile */}
            <div className="lg:hidden flex items-center gap-2 px-4 pt-4 pb-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition
                            ${activeTab === tab.key
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex">
                {/* Sidebar – desktop only */}
                <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 p-4 gap-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Admin Panel</h3>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition
                                ${activeTab === tab.key
                                    ? 'bg-red-50 text-red-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 max-w-6xl">
                    {activeTab === 'media' && <MediaTable />}
                    {activeTab === 'users' && <UserTable />}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
