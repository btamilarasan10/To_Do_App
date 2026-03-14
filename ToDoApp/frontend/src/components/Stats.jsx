import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const Stats = ({ stats }) => {
  const statsData = [
    { title: 'Today', value: stats.today || 0, icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Pending', value: stats.pending || 0, icon: Clock, color: 'from-orange-500 to-orange-600' },
    { title: 'Completed', value: stats.completed || 0, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Total', value: stats.total || 0, icon: TrendingUp, color: 'from-primary-500 to-primary-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="glass p-8 rounded-3xl card-hover flex items-center justify-between h-32"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{stat.title}</p>
            <p className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {stat.value}
            </p>
          </div>
          <div className={`w-20 h-20 ${stat.color} rounded-3xl flex items-center justify-center shadow-2xl`}>
            <stat.icon className="w-10 h-10 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Stats;
