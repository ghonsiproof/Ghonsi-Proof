import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress = 0, label = '', speed = '', showSpeed = true }) => {
  return (
    <div className="w-full space-y-2">
      {label && <p className="text-sm text-gray-300 font-medium">{label}</p>}
      
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-[#C19A4A] to-[#E8D5B7] h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span className="font-mono">{Math.round(progress)}%</span>
        {showSpeed && speed && <span className="text-yellow-400/80">{speed}</span>}
      </div>
    </div>
  );
};

export default ProgressBar;
