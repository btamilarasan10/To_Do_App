import React from 'react';
import { User, LogOut, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ profile, onLogout }) => {
  return (
    <motion.header 
      className="glass sticky top-0 z-40 px-8 py-6 shadow-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          TaskMaster
        </h1>
        
        <div className="flex items-center space-x-4">
          <motion.button className="glass p-3 rounded-2xl hover:bg-white/20" whileHover={{ scale: 1.05 }}>
            <Bell className="w-6 h-6 text-slate-600" />
          </motion.button>
          
          <motion.div 
            className="glass p-3 rounded-2xl flex items-center space-x-3 hover:bg-white/20 cursor-pointer" 
            whileHover={{ scale: 1.05 }}
            onClick={onLogout}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="font-bold text-slate-900">{profile?.username || 'Tamil'}</p>
              <p className="text-sm text-slate-600">{profile?.email}</p>
            </div>
            <LogOut className="w-5 h-5 text-slate-500" />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
