import React, { useEffect, useState, useRef } from 'react';
import { fetchSurahDetail } from '../services/api';
import { fetchAyahExplanation } from '../services/gemini';
import { SurahDetail, Bookmark, Ayah } from '../types';
import { Loading } from './Loading';

interface SurahReaderProps {
  surahId: number;
  onBack: () => void;
  onBookmark: (bm: Bookmark) => void;
  savedBookmark: Bookmark | null;
}

const AYAHS_PER_PAGE = 25;

export const SurahReader: React.FC<SurahReaderProps> = ({ surahId, onBack, onBookmark, savedBookmark }) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const ayahRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const topRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Interaction State
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Appearance State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState<number>(36);
  const [lineHeight, setLineHeight] = useState<number>(2.5);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const loadSurah = async () => {
      setLoading(true);
      const data = await fetchSurahDetail(surahId);
      setSurah(data);
      setLoading(false);
      // Reset to page 1 when loading a new surah, unless there is a bookmark logic handled below
      setCurrentPage(1);
    };
    loadSurah();
  }, [surahId]);

  // Handle Bookmark positioning
  useEffect(() => {
    if (!loading && surah && savedBookmark && savedBookmark.surahNumber === surahId) {
      // Calculate which page the bookmark is on
      const targetPage = Math.ceil(savedBookmark.ayahNumber / AYAHS_PER_PAGE);
      setCurrentPage(targetPage);
      
      // Wait for render cycle to scroll
      setTimeout(() => {
        const el = ayahRefs.current[savedBookmark.ayahNumber];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, surah, savedBookmark, surahId]);

  // Scroll to top when page changes (unless it's the initial bookmark load)
  useEffect(() => {
    if (topRef.current && !loading) {
       topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, loading]);

  const handleAyahClick = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setExplanation(null); // Reset explanation when opening new ayah
  };

  const closeModal = () => {
    setSelectedAyah(null);
    setExplanation(null);
    setLoadingExplanation(false);
  };

  const handleSetBookmark = () => {
    if (!surah || !selectedAyah) return;
    
    const newBookmark: Bookmark = {
      surahNumber: surah.number,
      surahName: surah.name,
      ayahNumber: selectedAyah.numberInSurah,
      timestamp: Date.now()
    };
    onBookmark(newBookmark);
    closeModal();
  };

  const handleGetExplanation = async () => {
    if (!surah || !selectedAyah) return;
    
    setLoadingExplanation(true);
    const text = await fetchAyahExplanation(surah.name, selectedAyah.numberInSurah, selectedAyah.text);
    setExplanation(text);
    setLoadingExplanation(false);
  };

  const handleNextPage = () => {
    if (!surah) return;
    const totalPages = Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE);
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <Loading />;
  if (!surah) return <div className="text-center p-10 font-kufi text-red-600">تعذر تحميل السورة. يرجى التحقق من الاتصال بالإنترنت.</div>;

  // Pagination Logic
  const totalPages = Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE);
  const startIndex = (currentPage - 1) * AYAHS_PER_PAGE;
  const endIndex = Math.min(startIndex + AYAHS_PER_PAGE, surah.ayahs.length);
  const currentAyahs = surah.ayahs.slice(startIndex, endIndex);

  return (
    <div className={`min-h-full transition-colors duration-300 ${isDarkMode ? 'bg-stone-900 text-stone-100' : ''}`} ref={topRef}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn relative">
        <div className="mb-6 flex justify-between items-center relative z-20">
          <button 
            onClick={onBack}
            className={`flex items-center gap-2 transition-colors font-kufi font-bold ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-800 hover:text-emerald-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">العودة</span>
          </button>
          
          <div className="text-center">
              <h1 className={`text-2xl md:text-3xl font-kufi border-b-2 pb-2 inline-block ${isDarkMode ? 'text-emerald-100 border-amber-600' : 'text-emerald-900 border-amber-400'}`}>
              {surah.name}
              </h1>
              <p className={`text-sm mt-1 font-kufi ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                صفحة {currentPage} من {totalPages}
              </p>
          </div>

          <div className="relative">
             <button 
               onClick={() => setShowSettings(!showSettings)}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-colors ${isDarkMode ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-white text-stone-700 hover:bg-stone-100 shadow-sm border border-stone-200'}`}
               title="إعدادات النص"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
               </svg>
               <span className="font-kufi text-sm">تخصيص</span>
             </button>

             {/* Settings Panel */}
             {showSettings && (
               <div className={`absolute top-12 left-0 md:right-auto md:left-0 w-64 p-4 rounded-xl shadow-2xl z-50 animate-slideUp border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
                 <div className="space-y-4">
                    {/* Dark Mode */}
                    <div className="flex justify-between items-center">
                      <span className={`font-kufi text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>الوضع الليلي</span>
                      <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isDarkMode ? 'bg-emerald-600' : 'bg-stone-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-0' : '-translate-x-6'}`}></div>
                      </button>
                    </div>

                    <hr className={`border-t ${isDarkMode ? 'border-stone-700' : 'border-stone-100'}`} />

                    {/* Font Size */}
                    <div>
                      <span className={`font-kufi text-sm block mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>حجم الخط</span>
                      <div className="flex items-center gap-2 bg-stone-100/10 rounded-lg p-1">
                        <button onClick={() => setFontSize(Math.max(20, fontSize - 2))} className={`flex-1 p-2 rounded hover:bg-black/10 text-center font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>-</button>
                        <span className={`font-mono text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>{fontSize}</span>
                        <button onClick={() => setFontSize(Math.min(60, fontSize + 2))} className={`flex-1 p-2 rounded hover:bg-black/10 text-center font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>+</button>
                      </div>
                    </div>

                    {/* Line Height */}
                    <div>
                      <span className={`font-kufi text-sm block mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>تباعد الأسطر</span>
                      <div className="flex items-center gap-2 bg-stone-100/10 rounded-lg p-1">
                        <button onClick={() => setLineHeight(Math.max(1.5, lineHeight - 0.2))} className={`flex-1 p-2 rounded hover:bg-black/10 text-center font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>-</button>
                        <span className={`font-mono text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>{lineHeight.toFixed(1)}</span>
                        <button onClick={() => setLineHeight(Math.min(5, lineHeight + 0.2))} className={`flex-1 p-2 rounded hover:bg-black/10 text-center font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>+</button>
                      </div>
                    </div>

                    {/* Font Weight */}
                    <div className="flex justify-between items-center">
                       <span className={`font-kufi text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>خط عريض</span>
                       <button 
                        onClick={() => setIsBold(!isBold)}
                        className={`px-3 py-1 rounded text-xs font-kufi transition-colors ${isBold ? 'bg-emerald-600 text-white' : (isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-700')}`}
                      >
                        {isBold ? 'مفعل' : 'عادي'}
                      </button>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Bismillah Header - Only on Page 1 */}
        {surah.number !== 9 && currentPage === 1 && (
          <div className="text-center mb-10 mt-4">
            <p className={`text-4xl leading-relaxed font-amiri decoration-clone ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
              بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        <div className={`rounded-lg shadow-xl p-6 md:p-12 border transition-colors duration-300 
            ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}
        >
          <div 
            className={`text-right text-justify transition-all duration-300 ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`} 
            style={{ 
              direction: 'rtl', 
              textAlignLast: 'center',
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontWeight: isBold ? '700' : '400'
            }}
          >
            {currentAyahs.map((ayah) => {
              let text = ayah.text;
              // Clean Bismillah if it's included in text of first ayah (only happens on page 1 for surahs > 1)
              if (surah.number > 1 && ayah.numberInSurah === 1 && text.startsWith('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ')) {
                 text = text.replace('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', '').trim();
              }

              const isBookmarked = savedBookmark?.surahNumber === surah.number && savedBookmark.ayahNumber === ayah.numberInSurah;
              
              // Dynamic Classes
              const hoverClass = isDarkMode ? 'hover:bg-stone-700' : 'hover:bg-stone-50';
              const selectionClass = isDarkMode ? 'selection:bg-emerald-700 selection:text-white' : 'selection:bg-emerald-200';
              const bookmarkClass = isBookmarked 
                  ? (isDarkMode ? 'bg-amber-900/40 ring-2 ring-amber-600 rounded-md' : 'bg-amber-100 ring-2 ring-amber-300 ring-offset-2 rounded-md') 
                  : '';

              return (
                <span 
                  key={ayah.number}
                  ref={el => { if (el) ayahRefs.current[ayah.numberInSurah] = el; }}
                  className={`inline relative group transition-colors cursor-pointer rounded px-1 ${hoverClass} ${selectionClass} ${bookmarkClass}`}
                  onClick={() => handleAyahClick(ayah)}
                  title="اضغط للخيارات"
                >
                  {text}
                  <span className={`inline-flex items-center justify-center w-[1em] h-[1em] mx-2 align-middle text-[0.6em] font-kufi border-2 rounded-full select-none leading-none ${isDarkMode ? 'text-amber-400 border-amber-500' : 'text-amber-600 border-amber-600'}`} >
                    {ayah.numberInSurah.toLocaleString('ar-EG')}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-8 gap-4">
          <button 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`flex-1 py-3 px-4 rounded-xl font-kufi font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
              ${isDarkMode 
                ? 'bg-stone-800 text-emerald-400 hover:bg-stone-700 disabled:hover:bg-stone-800' 
                : 'bg-white text-emerald-800 border border-stone-200 hover:bg-stone-50'}`}
          >
            السابقة
          </button>
          
          <span className={`font-kufi font-bold text-lg ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            {currentPage} / {totalPages}
          </span>

          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex-1 py-3 px-4 rounded-xl font-kufi font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
              ${isDarkMode 
                ? 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700 disabled:hover:bg-emerald-800' 
                : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
          >
            التالية
          </button>
        </div>
        
        <div className="mt-6 flex justify-center">
           <p className={`font-kufi text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>اضغط على أي آية للتفسير أو وضع علامة</p>
        </div>

        {/* Modal / Action Sheet */}
        {selectedAyah && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ direction: 'rtl' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
            <div className={`rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[85vh] animate-slideUp ${isDarkMode ? 'bg-stone-800' : 'bg-white'}`}>
              
              {/* Header */}
              <div className="bg-emerald-900 p-4 flex justify-between items-center text-white">
                <h3 className="font-kufi text-lg font-bold text-amber-400">
                  {surah.name} - آية {selectedAyah.numberInSurah.toLocaleString('ar-EG')}
                </h3>
                <button onClick={closeModal} className="text-white/80 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {/* Ayah Preview */}
                <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                  <p className={`font-amiri text-2xl text-center leading-loose ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                    {selectedAyah.text}
                  </p>
                </div>

                {/* Actions */}
                {!explanation && !loadingExplanation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={handleSetBookmark}
                      className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-kufi font-bold transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      حفظ كآخر قراءة
                    </button>
                    <button 
                      onClick={handleGetExplanation}
                      className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 rounded-xl font-kufi font-bold transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      تفسير الآية
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {loadingExplanation && (
                   <div className="py-8 text-center">
                     <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                     <p className="text-emerald-800 font-kufi">جاري جلب التفسير...</p>
                   </div>
                )}

                {/* Explanation Content */}
                {explanation && (
                  <div className="animate-fadeIn">
                     <div className={`flex items-center gap-2 mb-3 border-b pb-2 ${isDarkMode ? 'text-emerald-400 border-emerald-900' : 'text-emerald-800 border-emerald-100'}`}>
                       <span className="font-kufi font-bold text-lg">التفسير الميسر:</span>
                     </div>
                     <p className={`font-amiri text-xl leading-relaxed text-justify ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                       {explanation}
                     </p>
                     <button 
                       onClick={() => setExplanation(null)}
                       className={`mt-6 text-sm underline font-kufi ${isDarkMode ? 'text-stone-400 hover:text-emerald-400' : 'text-stone-500 hover:text-emerald-600'}`}
                     >
                       العودة للخيارات
                     </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
