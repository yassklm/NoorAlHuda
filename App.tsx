import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SurahList } from './components/SurahList';
import { SurahReader } from './components/SurahReader';
import { HadithSection } from './components/HadithSection';
import { Bookmark } from './types';

function App() {
  const [view, setView] = useState<'home' | 'hadith' | 'reader'>('home');
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('quran_bookmark');
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmark");
      }
    }
  }, []);

  const handleSelectSurah = (id: number) => {
    setSelectedSurahId(id);
    setView('reader');
    window.scrollTo(0, 0);
  };

  const handleBookmark = (bm: Bookmark) => {
    setBookmark(bm);
    localStorage.setItem('quran_bookmark', JSON.stringify(bm));
  };

  const handleNavChange = (newView: 'home' | 'hadith' | 'reader') => {
    if (newView === 'reader' && !selectedSurahId) {
      setView('home');
    } else {
      setView(newView);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-amiri selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar currentView={view} setView={handleNavChange} />
      
      <main className="flex-grow">
        {view === 'home' && (
          <SurahList onSelectSurah={handleSelectSurah} bookmark={bookmark} />
        )}
        
        {view === 'reader' && selectedSurahId && (
          <SurahReader 
            surahId={selectedSurahId} 
            onBack={() => setView('home')}
            onBookmark={handleBookmark}
            savedBookmark={bookmark}
          />
        )}

        {view === 'hadith' && (
          <HadithSection />
        )}
      </main>

      <footer className="bg-emerald-900 text-emerald-200 py-6 text-center font-kufi mt-auto">
        <p>نور الهدى &copy; {new Date().getFullYear()} • تطبيق إسلامي شامل</p>
      </footer>
    </div>
  );
}

export default App;
