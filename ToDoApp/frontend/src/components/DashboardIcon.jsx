import React from 'react';
import { BarChart3, ChevronLeft } from 'lucide-react';

const DashboardIcon = ({ onClick }) => {
    return (
        <button
            onClick={onClick || (() => window.location.href = '/dashboard')}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all flex items-center space-x-2 group shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
            title="Analytics Dashboard"
        >
            <BarChart3 className="w-6 h-6 group-hover:rotate-12 transition-transform text-purple-300 group-hover:text-purple-400" />
            <span className="hidden md:inline font-semibold text-white tracking-wide">Dashboard</span>
        </button>
    );
};

export default DashboardIcon;
