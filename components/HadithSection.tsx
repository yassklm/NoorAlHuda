import React, { useState } from 'react';
import { fetchHadithWithExplanation } from '../services/gemini';
import { HadithResponse } from '../types';
import { Loading } from './Loading';

export const HadithSection: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [hadithData, setHadithData] = useState<HadithResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setHadithData(null);
    
    try {
      const result = await fetchHadithWithExplanation(topic);
      if (result) {
        setHadithData(result);
      } else {
        setError('تعذر جلب الحديث. حاول مرة أخرى.');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع.');
    } finally {
      setLoading(false);
    }
  };

  const isWeak = (grade: string) => {
    return grade.includes('ضعيف') || grade.includes('موضوع') || grade.toLowerCase().includes('weak') || grade.toLowerCase().includes('daif');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-kufi text-emerald-900 mb-4">الأحاديث النبوية وشرحها</h2>
        <p className="text-lg text-stone-600 font-amiri">اسأل عن موضوع معين أو احصل على حديث عشوائي مع الشرح</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-stone-200 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="اكتب موضوعاً (مثلاً: الصبر، الصلاة، بر الوالدين)..."
            className="flex-1 p-4 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-amiri text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 text-white px-8 py-4 rounded-lg hover:bg-emerald-800 transition-colors font-kufi font-bold shadow-sm disabled:opacity-50"
          >
            {loading ? 'جاري البحث...' : 'بحث عن حديث'}
          </button>
          <button
            type="button"
            onClick={() => { setTopic(''); handleSearch(); }}
            disabled={loading}
            className="bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors font-kufi font-bold shadow-sm disabled:opacity-50"
          >
            حديث عشوائي
          </button>
        </form>
      </div>

      {loading && <Loading />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 font-kufi">
          {error}
        </div>
      )}

      {hadithData && (
        <div 
          className={`border-2 rounded-xl overflow-hidden shadow-lg animate-slideUp transition-colors ${
            isWeak(hadithData.grade) ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-emerald-100'
          }`}
        >
          <div className={`px-6 py-4 border-b-4 ${
             isWeak(hadithData.grade) ? 'bg-red-900 border-red-500' : 'bg-emerald-900 border-amber-500'
          }`}>
             <div className="flex justify-between items-center">
               <h3 className="text-xl text-amber-400 font-kufi font-bold">الحديث الشريف</h3>
               <span className={`px-3 py-1 rounded-full text-sm font-bold font-kufi ${
                 isWeak(hadithData.grade) ? 'bg-red-800 text-white' : 'bg-emerald-800 text-emerald-100'
               }`}>
                 {hadithData.grade}
               </span>
             </div>
          </div>
          <div className="p-8">
            <p className="text-3xl leading-[2.5] text-center font-amiri text-stone-800 mb-6 font-bold">
              {hadithData.hadithArabic}
            </p>
            <div className="flex justify-center mb-8">
              <span className={`px-4 py-1 rounded-full text-sm font-kufi font-bold border ${
                 isWeak(hadithData.grade) ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                المصدر: {hadithData.source}
              </span>
            </div>
            
            <div className={`border-t pt-6 ${isWeak(hadithData.grade) ? 'border-red-200' : 'border-stone-200'}`}>
              <h4 className={`text-xl font-kufi mb-3 font-bold border-r-4 pr-3 ${
                isWeak(hadithData.grade) ? 'text-red-900 border-red-500' : 'text-emerald-800 border-amber-500'
              }`}>الشرح</h4>
              <p className="text-xl leading-relaxed text-stone-700 font-amiri text-justify">
                {hadithData.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
