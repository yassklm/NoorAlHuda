import React, { useEffect, useState } from 'react';
import { fetchSurahList } from '../services/api';
import { SurahMeta, Bookmark } from '../types';
import { Loading } from './Loading';

interface SurahListProps {
  onSelectSurah: (id: number) => void;
  bookmark: Bookmark | null;
}

export const SurahList: React.FC<SurahListProps> = ({ onSelectSurah, bookmark }) => {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchSurahList();
      setSurahs(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchTerm) || 
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.number.toString() === searchTerm
  );

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
      
      {/* Hero Section */}
      <div className="text-center mb-10 bg-emerald-900 rounded-2xl p-8 text-white shadow-xl bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]">
        <h1 className="text-4xl md:text-5xl font-kufi font-bold mb-4 text-amber-400">القرآن الكريم</h1>
        <p className="text-emerald-100 font-amiri text-xl max-w-2xl mx-auto">
          "كِتَـٰبٌ أَنزَلۡنَـٰهُ إِلَيۡكَ مُبَـٰرَكٞ لِّيَدَّبَّرُوٓاْ ءَايَـٰتِهِۦ وَلِيَتَذَكَّرَ أُوْلُواْ ٱلۡأَلۡبَـٰبِ"
        </p>

        {bookmark && (
          <div className="mt-6 bg-emerald-800/80 backdrop-blur-sm inline-block px-6 py-3 rounded-lg border border-emerald-600">
            <p className="text-sm text-emerald-200 font-kufi mb-1">آخر قراءة:</p>
            <div className="flex items-center gap-4">
               <span className="font-bold text-lg text-white font-amiri">{bookmark.surahName} - آية {bookmark.ayahNumber}</span>
               <button 
                onClick={() => onSelectSurah(bookmark.surahNumber)}
                className="bg-amber-500 hover:bg-amber-600 text-emerald-900 text-sm font-bold py-1 px-3 rounded transition-colors font-kufi"
               >
                 أكمل القراءة
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-8 max-w-md mx-auto relative">
        <input 
          type="text" 
          placeholder="ابحث عن اسم السورة..." 
          className="w-full p-4 pr-12 rounded-full border-2 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none shadow-sm font-amiri text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-4 top-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSurahs.map((surah) => (
          <div 
            key={surah.number} 
            onClick={() => onSelectSurah(surah.number)}
            className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-emerald-700 font-bold font-kufi border border-stone-200 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors relative">
                 {/* Decorative Star/Octagon shape via CSS or SVG usually, using simple circle for now but rotated square behind would be nice */}
                 <div className="absolute inset-0 border-2 border-stone-200 rotate-45 rounded-lg group-hover:border-emerald-200 transition-colors"></div>
                 <span className="relative z-10">{surah.number}</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-stone-800 font-kufi group-hover:text-emerald-700">{surah.name}</h3>
                <p className="text-stone-500 text-sm font-amiri">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آيات</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
