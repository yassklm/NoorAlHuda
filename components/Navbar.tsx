import React from 'react';

interface NavbarProps {
  currentView: 'home' | 'hadith' | 'reader';
  setView: (view: 'home' | 'hadith' | 'reader') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-emerald-900 text-amber-50 shadow-lg border-b-4 border-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
             {/* Simple Islamic Geometric Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.39 8.26L21 9.27L16.27 13.97L17.36 20.73L12 17.5L6.64 20.73L7.73 13.97L3 9.27L9.61 8.26L12 2Z" />
            </svg>
            <span className="font-kufi text-xl font-bold tracking-wider">نور الهدى</span>
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <button 
              onClick={() => setView('home')}
              className={`px-3 py-2 rounded-md font-kufi text-md transition-colors ${currentView === 'home' ? 'bg-emerald-800 text-amber-400 font-bold' : 'hover:bg-emerald-800'}`}
            >
              القرآن الكريم
            </button>
            <button 
              onClick={() => setView('hadith')}
              className={`px-3 py-2 rounded-md font-kufi text-md transition-colors ${currentView === 'hadith' ? 'bg-emerald-800 text-amber-400 font-bold' : 'hover:bg-emerald-800'}`}
            >
              الأحاديث الشريفة
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
