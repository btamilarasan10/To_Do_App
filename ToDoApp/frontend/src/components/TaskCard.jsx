import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const TaskCard = ({ task, onRefresh }) => {
  const toggleComplete = async () => {
    try {
      await axios.patch(`${API_BASE}/tasks/${task.id}/`, { is_completed: true });
      onRefresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-emerald-500 to-teal-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <motion.div
      className="glass p-8 rounded-3xl h-full card-hover group"
      whileHover={{ y: -8 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getPriorityColor(task.priority)}`}></div>
        <button className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-white/30">⋮</button>
      </div>
      
      <h3 className={`text-2xl font-bold mb-4 leading-tight ${
        task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'
      }`}>
        {task.title}
      </h3>
      
      {task.description && (
        <p className={`text-slate-600 mb-8 leading-relaxed ${
          task.is_completed ? 'text-slate-400' : ''
        }`}>
          {task.description}
        </p>
      )}

      <div className="pt-8 border-t border-white/30">
        <div className="flex items-center justify-between">
          <span className={`px-4 py-2 rounded-2xl font-semibold text-sm ${
            task.is_completed 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {task.is_completed ? '✅ Completed' : '⏳ Pending'}
          </span>
          <motion.button
            onClick={toggleComplete}
            className={`px-8 py-3 rounded-2xl font-semibold transition-all ${
              task.is_completed
                ? 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-slate-100'
                : 'btn-primary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {task.is_completed ? 'Undo' : 'Complete'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
