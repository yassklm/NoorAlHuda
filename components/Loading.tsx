import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-emerald-800 font-kufi text-lg">جاري التحميل...</p>
    </div>
  );
};
