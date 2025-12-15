import { SurahMeta, SurahDetail } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchSurahList = async (): Promise<SurahMeta[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) throw new Error('Failed to fetch surah list');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchSurahDetail = async (surahNumber: number): Promise<SurahDetail | null> => {
  try {
    // requesting quran-uthmani edition for Ottoman script
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`);
    if (!response.ok) throw new Error('Failed to fetch surah detail');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
