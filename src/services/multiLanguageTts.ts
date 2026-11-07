/**
 * Multi-Language Text-to-Speech & Translation Engine for School Bells.
 * Provides rich 4-language announcements:
 * 1. 🇮🇩 Bahasa Indonesia (id-ID)
 * 2. 🇬🇧 Bahasa Inggris / English (en-US)
 * 3. 🇸🇦 Bahasa Arab / العربية (ar-SA)
 * 4. 🇨🇳 Bahasa Mandarin / 中文 (zh-CN)
 */

import { LanguageCode, MultiLanguageText, ScheduleCategory } from '../types';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  label: string;
  nativeName: string;
  shortName: string;
  shortLabel: string;
  flag: string;
  bcp47: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  id: {
    code: 'id',
    name: 'Bahasa Indonesia',
    label: 'Bahasa Indonesia',
    nativeName: 'Bahasa Indonesia',
    shortName: 'ID',
    shortLabel: 'ID',
    flag: '🇮🇩',
    bcp47: 'id-ID',
    badgeBg: 'bg-red-500/15',
    badgeBorder: 'border-red-500/30',
    badgeText: 'text-red-400',
  },
  en: {
    code: 'en',
    name: 'Bahasa Inggris',
    label: 'Bahasa Inggris',
    nativeName: 'English',
    shortName: 'EN',
    shortLabel: 'EN',
    flag: '🇬🇧',
    bcp47: 'en-US',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400',
  },
  ar: {
    code: 'ar',
    name: 'Bahasa Arab',
    label: 'Bahasa Arab',
    nativeName: 'العربية',
    shortName: 'AR',
    shortLabel: 'AR',
    flag: '🇸🇦',
    bcp47: 'ar-SA',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
  },
  zh: {
    code: 'zh',
    name: 'Bahasa Mandarin',
    label: 'Bahasa Mandarin',
    nativeName: '中文 (普通话)',
    shortName: 'ZH',
    shortLabel: 'ZH',
    flag: '🇨🇳',
    bcp47: 'zh-CN',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
  },
};

export const ORDERED_LANGUAGES: LanguageCode[] = ['id', 'en', 'ar', 'zh'];

export interface MultiLanguagePreset {
  id: string;
  label: string;
  category: ScheduleCategory;
  phrases: {
    id: string;
    en: string;
    ar: string;
    zh: string;
  };
}

export const MULTI_LANGUAGE_PRESETS: MultiLanguagePreset[] = [
  {
    id: 'masuk-sekolah',
    label: 'Masuk Sekolah & Pembiasaan Pagi',
    category: 'masuk',
    phrases: {
      id: 'Selamat pagi seluruh siswa. Saatnya masuk sekolah dan memulai kegiatan pembiasaan.',
      en: 'Good morning students. It is time to enter school and begin morning activities.',
      ar: 'صباح الخير جميع الطلاب. حان الآن موعد دخول المدرسة وبدء الأنشطة الصباحية.',
      zh: '同学们早上好。现在是入校时间，请开始晨读和早间活动。',
    },
  },
  {
    id: 'upacara-bendera',
    label: 'Upacara Bendera Hari Senin',
    category: 'upacara',
    phrases: {
      id: 'Perhatian seluruh siswa dan bapak ibu guru, dimohon segera menuju lapangan untuk upacara bendera.',
      en: 'Attention all students and teachers, please gather at the field for the flag ceremony.',
      ar: 'انتباه من فضلكم، يرجى من جميع الطلاب والمعلمين التوجه إلى الساحة لحضور مراسم رفع العلم.',
      zh: '请注意，请全体师生立即到操场集合，参加升旗仪式。',
    },
  },
  {
    id: 'pelajaran-1',
    label: 'Jam Pelajaran Ke-1 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran pertama dimulai.',
      en: 'It is time for the first period to begin.',
      ar: 'حان الآن موعد بدء الحصة الأولى.',
      zh: '现在是第一节课上课时间。',
    },
  },
  {
    id: 'pelajaran-2',
    label: 'Jam Pelajaran Ke-2 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran kedua dimulai.',
      en: 'It is time for the second period to begin.',
      ar: 'حان الآن موعد بدء الحصة الثانية.',
      zh: '现在是第二节课上课时间。',
    },
  },
  {
    id: 'pelajaran-3',
    label: 'Jam Pelajaran Ke-3 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran ketiga dimulai.',
      en: 'It is time for the third period to begin.',
      ar: 'حان الآن موعد بدء الحصة الثالثة.',
      zh: '现在是第三节课上课时间。',
    },
  },
  {
    id: 'pelajaran-4',
    label: 'Jam Pelajaran Ke-4 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran keempat dimulai.',
      en: 'It is time for the fourth period to begin.',
      ar: 'حان الآن موعد بدء الحصة الرابعة.',
      zh: '现在是第四节课上课时间。',
    },
  },
  {
    id: 'pelajaran-5',
    label: 'Jam Pelajaran Ke-5 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran kelima dimulai.',
      en: 'It is time for the fifth period to begin.',
      ar: 'حان الآن موعد بدء الحصة الخامسة.',
      zh: '现在是第五节课上课时间。',
    },
  },
  {
    id: 'pelajaran-6',
    label: 'Jam Pelajaran Ke-6 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran keenam dimulai.',
      en: 'It is time for the sixth period to begin.',
      ar: 'حان الآن موعد بدء الحصة السادسة.',
      zh: '现在是第六节课上课时间。',
    },
  },
  {
    id: 'pelajaran-7',
    label: 'Jam Pelajaran Ke-7 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran ketujuh dimulai.',
      en: 'It is time for the seventh period to begin.',
      ar: 'حان الآن موعد بدء الحصة السابعة.',
      zh: '现在是第七节课上课时间。',
    },
  },
  {
    id: 'pelajaran-8',
    label: 'Jam Pelajaran Ke-8 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran kedelapan dimulai.',
      en: 'It is time for the eighth period to begin.',
      ar: 'حان الآن موعد بدء الحصة الثامنة.',
      zh: '现在是第八节课上课时间。',
    },
  },
  {
    id: 'pelajaran-9',
    label: 'Jam Pelajaran Ke-9 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran kesembilan dimulai.',
      en: 'It is time for the ninth period to begin.',
      ar: 'حان الآن موعد بدء الحصة التاسعة.',
      zh: '现在是第九节课上课时间。',
    },
  },
  {
    id: 'pelajaran-10',
    label: 'Jam Pelajaran Ke-10 Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Saatnya jam pelajaran kesepuluh dimulai.',
      en: 'It is time for the tenth period to begin.',
      ar: 'حان الآن موعد بدء الحصة العاشرة.',
      zh: '现在是第十节课上课时间。',
    },
  },
  {
    id: 'istirahat-1',
    label: 'Istirahat Pertama',
    category: 'istirahat',
    phrases: {
      id: 'Saatnya istirahat pertama dimulai. Selamat beristirahat kepada seluruh siswa.',
      en: 'It is time for the first break. Enjoy your recess everyone.',
      ar: 'حان الآن موعد الاستراحة الأولى. نتمنى لكم استراحة سعيدة وممتعة.',
      zh: '现在是第一次课间休息时间。祝大家休息愉快。',
    },
  },
  {
    id: 'masuk-setelah-istirahat',
    label: 'Masuk Kembali Setelah Istirahat',
    category: 'pelajaran',
    phrases: {
      id: 'Waktu istirahat telah selesai. Seluruh siswa dimohon segera kembali ke ruang kelas.',
      en: 'The recess is over. All students please return to your classrooms.',
      ar: 'انتهت فترة الاستراحة. يرجى من جميع الطلاب العودة إلى فصولهم الدراسية فوراً.',
      zh: '课间休息结束。请全体同学立即回到教室上课。',
    },
  },
  {
    id: 'istirahat-2-sholat',
    label: 'Istirahat Kedua & Sholat Dzuhur',
    category: 'sholat',
    phrases: {
      id: 'Saatnya istirahat kedua dan pelaksanaan ibadah Sholat Dzuhur berjamaah.',
      en: 'It is time for the second recess and Dhuhr prayer.',
      ar: 'حان الآن موعد الاستراحة الثانية وأداء صلاة الظهر جماعة.',
      zh: '现在是第二次休息和午祷时间。',
    },
  },
  {
    id: 'sholat-jumat',
    label: 'Persiapan Sholat Jumat',
    category: 'sholat',
    phrases: {
      id: 'Saatnya persiapan pelaksanaan ibadah Sholat Jumat.',
      en: 'It is time to prepare for Friday prayer.',
      ar: 'حان الآن موعد الاستعداد لأداء صلاة الجمعة المباركة.',
      zh: '现在是准备周五礼拜的时间。',
    },
  },
  {
    id: 'pulang-sekolah',
    label: 'Bel Pulang Sekolah',
    category: 'pulang',
    phrases: {
      id: 'Saatnya jam pulang sekolah. Hati-hati di jalan dan sampai jumpa esok hari.',
      en: 'School is over for today. Have a safe trip home and see you tomorrow.',
      ar: 'حان الآن موعد الانصراف ونهاية اليوم الدراسي. رافقتكم السلامة ونراكم غداً.',
      zh: '今天的放学时间到了。路上请注意安全，明天见。',
    },
  },
  {
    id: 'ujian-mulai',
    label: 'Ujian / Asesmen Dimulai',
    category: 'pelajaran',
    phrases: {
      id: 'Waktu ujian telah dimulai. Selamat mengerjakan dan junjung tinggi kejujuran.',
      en: 'The examination has begun. Good luck and uphold honesty.',
      ar: 'بدأ الآن وقت الامتحان. بالتوفيق للجميع مع الالتزام بالأمانة والنزاهة.',
      zh: '考试时间开始。祝大家考试顺利，诚信应考。',
    },
  },
  {
    id: 'ujian-selesai',
    label: 'Waktu Ujian Selesai',
    category: 'istirahat',
    phrases: {
      id: 'Waktu ujian telah selesai. Silakan letakkan alat tulis dan kumpulkan lembar jawaban.',
      en: 'The examination time is finished. Please put down your pens and submit your answers.',
      ar: 'انتهى وقت الامتحان. يرجى التوقف عن الكتابة وتسليم أوراق الإجابة.',
      zh: '考试时间结束。请放下文具，交卷。',
    },
  },
];

const PERIOD_NUMBERS: Record<number, { id: string; en: string; ar: string; zh: string }> = {
  1: { id: 'pertama', en: 'first', ar: 'الأولى', zh: '第一节' },
  2: { id: 'kedua', en: 'second', ar: 'الثانية', zh: '第二节' },
  3: { id: 'ketiga', en: 'third', ar: 'الثالثة', zh: '第三节' },
  4: { id: 'keempat', en: 'fourth', ar: 'الرابعة', zh: '第四节' },
  5: { id: 'kelima', en: 'fifth', ar: 'الخامسة', zh: '第五节' },
  6: { id: 'keenam', en: 'sixth', ar: 'السادسة', zh: '第六节' },
  7: { id: 'ketujuh', en: 'seventh', ar: 'السابعة', zh: '第七节' },
  8: { id: 'kedelapan', en: 'eighth', ar: 'الثامنة', zh: '第八节' },
  9: { id: 'kesembilan', en: 'ninth', ar: 'التاسعة', zh: '第九节' },
  10: { id: 'kesepuluh', en: 'tenth', ar: 'العاشرة', zh: '第十节' },
  11: { id: 'kesebelas', en: 'eleventh', ar: 'الحادية عشرة', zh: '第十一节' },
  12: { id: 'keduabelas', en: 'twelfth', ar: 'الثانية عشرة', zh: '第十二节' },
};

/**
 * Intelligent 4-Language phrase generator based on label and category
 */
export function generate4LanguageText(
  label: string,
  category: ScheduleCategory,
  defaultIdText?: string
): MultiLanguageText {
  const lowerLabel = label.toLowerCase();

  // Check period number pattern (e.g., "Pelajaran 1", "Jam Ke-2", "Jam 3", "Period 1")
  const periodMatch = lowerLabel.match(/(?:pelajaran|jam ke|jam pelajaran|sesi|ke-)\s*(\d+)/i) ||
                      lowerLabel.match(/(\d+)/);

  if (category === 'pelajaran' && periodMatch) {
    const num = parseInt(periodMatch[1], 10);
    if (num >= 1 && num <= 12) {
      const p = PERIOD_NUMBERS[num];
      return {
        id: defaultIdText || `Saatnya jam pelajaran ${p.id} dimulai.`,
        en: `It is time for the ${p.en} period to begin.`,
        ar: `حان الآن موعد بدء الحصة ${p.ar}.`,
        zh: `现在是${p.zh}课上课时间。`,
      };
    }
  }

  // Check if it matches any predefined phrase
  if (lowerLabel.includes('upacara') || lowerLabel.includes('apel')) {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'upacara-bendera')!.phrases;
  }

  if (lowerLabel.includes('pulang') || category === 'pulang') {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'pulang-sekolah')!.phrases;
  }

  if (lowerLabel.includes('sholat') || lowerLabel.includes('dzuhur') || lowerLabel.includes('jumat') || category === 'sholat') {
    if (lowerLabel.includes('jumat')) {
      return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'sholat-jumat')!.phrases;
    }
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'istirahat-2-sholat')!.phrases;
  }

  if (lowerLabel.includes('masuk setelah') || lowerLabel.includes('selesai istirahat') || lowerLabel.includes('kembali')) {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'masuk-setelah-istirahat')!.phrases;
  }

  if (lowerLabel.includes('istirahat') || category === 'istirahat') {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'istirahat-1')!.phrases;
  }

  if (lowerLabel.includes('masuk') || category === 'masuk') {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'masuk-sekolah')!.phrases;
  }

  if (lowerLabel.includes('ujian selesai') || lowerLabel.includes('selesai ujian')) {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'ujian-selesai')!.phrases;
  }

  if (lowerLabel.includes('ujian') || lowerLabel.includes('asesmen') || lowerLabel.includes('pas') || lowerLabel.includes('pts')) {
    return MULTI_LANGUAGE_PRESETS.find((p) => p.id === 'ujian-mulai')!.phrases;
  }

  // Fallback if no specific match
  return {
    id: defaultIdText || label,
    en: `Attention: ${label}`,
    ar: `انتباه: ${label}`,
    zh: `请注意：${label}`,
  };
}

/**
 * Pre-compiled High-Quality Phonetic Arabic Transcriptions for Indonesian TTS voices.
 * Ensures that if a Chromebook, Windows, or Android device lacks a native Arabic TTS voice pack,
 * the Arabic announcement is still pronounced accurately, clearly, and audibly!
 */
export const ARABIC_PHONETIC_PRESETS: Record<string, string> = {
  'masuk-sekolah': 'Shobaahul khoiri jamii\'at thullaab. Haanal aana maw\'idu dukhuulil madrasati wa bad\'il ansyithotish shobaahiyyah.',
  'upacara-bendera': 'Intibaah min fadlikum, yurjaa min jamii\'ith thullaabi wal mu\'allimiinat tawajjuhu ilas saahati lihudhuuri maroosimi rof\'il \'alam.',
  'pelajaran-1': 'Haanal aana maw\'idu bad\'il hish-shatil uulaa.',
  'pelajaran-2': 'Haanal aana maw\'idu bad\'il hish-shatits tsaaniyah.',
  'pelajaran-3': 'Haanal aana maw\'idu bad\'il hish-shatits tsaalitsah.',
  'pelajaran-4': 'Haanal aana maw\'idu bad\'il hish-shatir roobi\'ah.',
  'pelajaran-5': 'Haanal aana maw\'idu bad\'il hish-shatil khoomisah.',
  'pelajaran-6': 'Haanal aana maw\'idu bad\'il hish-shatis saadisah.',
  'pelajaran-7': 'Haanal aana maw\'idu bad\'il hish-shatis saabi\'ah.',
  'pelajaran-8': 'Haanal aana maw\'idu bad\'il hish-shatits tsaaminah.',
  'pelajaran-9': 'Haanal aana maw\'idu bad\'il hish-shatit taasi\'ah.',
  'pelajaran-10': 'Haanal aana maw\'idu bad\'il hish-shatil \'aasyiroh.',
  'pelajaran-11': 'Haanal aana maw\'idu bad\'il hish-shatil haadiyata \'asyrata.',
  'pelajaran-12': 'Haanal aana maw\'idu bad\'il hish-shatits tsaaniyata \'asyrata.',
  'istirahat-1': 'Haanal aana maw\'idul istiroohatil uulaa. Natamannaa lakum istiroohatan sa\'iidataw wa mumti\'ah.',
  'masuk-setelah-istirahat': 'Intahat fatratul istiroohah. Yurjaa min jamii\'ith thullaabil \'awdatu ilaa fushuulihimud diroosiyyati fawran.',
  'istirahat-2-sholat': 'Haanal aana maw\'idul istiroohatits tsaaniyah wa adaa-u sholaatidz dzuhri jamaa\'atan.',
  'sholat-jumat': 'Haanal aana maw\'idul isti\'daadi li-adaa-i sholaatil jum\'atil mubaarokah.',
  'pulang-sekolah': 'Haanal aana maw\'idul inshiroofi wa nihaayatil yawmid diroosiyy. Roofaqotkumus salaamah wa narookum ghodan.',
  'ujian-mulai': 'Bada-al aana waqtul imtihaan. Bit-taufiiqi lil-jamii\' ma\'al iltizaami bil-amaanati wan-nazaahah.',
  'ujian-selesai': 'Intahaa waqtul imtihaan. Yurjat tawaqqufu \'anil kitaabah wa tasliimu awrooqil ijaabah.',
};

export const MANDARIN_PHONETIC_PRESETS: Record<string, string> = {
  'masuk-sekolah': 'Tongxue men zaoshang hao. Xianzai shi ruxiao shijian, qing kaishi chendu he zaojian huodong.',
  'upacara-bendera': 'Qing zhuyi, qing quanti shisheng liji dao caochang jihe, canjia shengqi yishi.',
  'pelajaran-1': 'Xianzai shi di yi jie ke shangke shijian.',
  'pelajaran-2': 'Xianzai shi di er jie ke shangke shijian.',
  'pelajaran-3': 'Xianzai shi di san jie ke shangke shijian.',
  'pelajaran-4': 'Xianzai shi di si jie ke shangke shijian.',
  'pelajaran-5': 'Xianzai shi di wu jie ke shangke shijian.',
  'pelajaran-6': 'Xianzai shi di liu jie ke shangke shijian.',
  'pelajaran-7': 'Xianzai shi di qi jie ke shangke shijian.',
  'pelajaran-8': 'Xianzai shi di ba jie ke shangke shijian.',
  'pelajaran-9': 'Xianzai shi di jiu jie ke shangke shijian.',
  'pelajaran-10': 'Xianzai shi di shi jie ke shangke shijian.',
  'pelajaran-11': 'Xianzai shi di shi yi jie ke shangke shijian.',
  'pelajaran-12': 'Xianzai shi di shi er jie ke shangke shijian.',
  'istirahat-1': 'Xianzai shi di yi ci kejian xiuxi shijian. Zhu dajia xiuxi yukuai.',
  'masuk-setelah-istirahat': 'Kejian xiuxi jieshu. Qing quanti tongxue liji hui dao jiaoshi shangke.',
  'istirahat-2-sholat': 'Xianzai shi di er ci xiuxi he wu dao shijian.',
  'sholat-jumat': 'Xianzai shi zhunbei zhouwu libai de shijian.',
  'pulang-sekolah': 'Jintian de fangxue shijian dao le. Lushang qing zhuyi anquan, mingtian jian.',
  'ujian-mulai': 'Kaoshi shijian kaishi. Zhu dajia kaoshi shunli, chengxin yingkao.',
  'ujian-selesai': 'Kaoshi shijian jieshu. Qing fangxia wenju, jiaojuan.',
};

/**
 * Checks if a string contains Arabic characters
 */
export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

/**
 * Checks if a string contains Chinese characters
 */
export function isChineseText(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * Common Arabic vocabulary mapping for school bell announcements
 */
const ARABIC_WORD_MAP: Array<[RegExp, string]> = [
  [/صباح الخير/gi, 'Shobaahul khoir'],
  [/جميع الطلاب/gi, "jamii'at thullaab"],
  [/والمعلمين/gi, "wal mu'allimiin"],
  [/المعلمين/gi, "al mu'allimiin"],
  [/الطلاب/gi, 'ath-thullaab'],
  [/حان الآن/gi, 'Haanal aana'],
  [/حان الان/gi, 'Haanal aana'],
  [/موعد بدء/gi, "maw'idu bad'il"],
  [/موعد دخول/gi, "maw'idu dukhuulil"],
  [/موعد الاستراحة/gi, "maw'idul istiroohatil"],
  [/موعد الانصراف/gi, "maw'idul inshiroofi"],
  [/موعد الاستعداد/gi, "maw'idul isti'daadi"],
  [/موعد/gi, "maw'idu"],
  [/الحصة الأولى/gi, 'hish-shatil uulaa'],
  [/الحصة الثانية عشرة/gi, 'hish-shatits tsaaniyata asyrata'],
  [/الحصة الحادية عشرة/gi, 'hish-shatil haadiyata asyrata'],
  [/الحصة الثانية/gi, 'hish-shatits tsaaniyah'],
  [/الحصة الثالثة/gi, 'hish-shatits tsaalitsah'],
  [/الحصة الرابعة/gi, 'hish-shatir roobi\'ah'],
  [/الحصة الخامسة/gi, 'hish-shatil khoomisah'],
  [/الحصة السادسة/gi, 'hish-shatis saadisah'],
  [/الحصة السابعة/gi, 'hish-shatis saabi\'ah'],
  [/الحصة الثامنة/gi, 'hish-shatits tsaaminah'],
  [/الحصة التاسعة/gi, 'hish-shatit taasi\'ah'],
  [/الحصة العاشرة/gi, 'hish-shatil aasyiroh'],
  [/الحصة/gi, 'hish-shah'],
  [/المدرسة/gi, 'madrosah'],
  [/الأنشطة الصباحية/gi, 'ansyithotish shobaahiyyah'],
  [/انتباه من فضلكم/gi, 'Intibaah min fadlikum'],
  [/انتباه/gi, 'Intibaah'],
  [/يرجى من/gi, 'yurjaa min'],
  [/يرجى/gi, 'yurjaa'],
  [/التوجه إلى الساحة/gi, 'at-tawajjuhu ilas saahah'],
  [/إلى الساحة/gi, 'ilas saahah'],
  [/لحضور مراسم رفع العلم/gi, "lihudhuuri maroosimi rof'il 'alam"],
  [/رفع العلم/gi, "rof'il 'alam"],
  [/الاستراحة الأولى/gi, 'istiroohatil uulaa'],
  [/الاستراحة الثانية/gi, 'istiroohatits tsaaniyah'],
  [/الاستراحة/gi, 'istiroohah'],
  [/فترة الاستراحة/gi, 'fatratul istiroohah'],
  [/انتهت/gi, 'intahat'],
  [/العودة إلى فصولهم/gi, "al-'awdatu ilaa fushuulihim"],
  [/فصولهم الدراسية/gi, 'fushuulihimud diroosiyyah'],
  [/فوراً|فورا/gi, 'fawron'],
  [/صلاة الظهر/gi, 'sholaatidz dzuhri'],
  [/صلاة الجمعة المباركة/gi, "sholaatil jum'atil mubaarokah"],
  [/صلاة الجمعة/gi, "sholaatil jum'ah"],
  [/صلاة/gi, 'sholaat'],
  [/جماعة/gi, "jamaa'atan"],
  [/نهاية اليوم الدراسي/gi, 'nihaayatil yawmid diroosiyy'],
  [/رافقتكم السلامة/gi, 'roofaqotkumus salaamah'],
  [/ونراكم غداً|ونراكم غدا/gi, 'wa narookum ghodan'],
  [/بدأ الآن/gi, "bada-al aana"],
  [/وقت الامتحان/gi, 'waqtul imtihaan'],
  [/بالتوفيق للجميع/gi, 'bit-taufiiqi lil jamii\''],
  [/مع الالتزام بالأمانة والنزاهة/gi, "ma'al iltizaami bil amaanati wan nazaahah"],
  [/انتهى/gi, 'intahaa'],
  [/التوقف عن الكتابة/gi, 'at-tawaqqufu anil kitaabah'],
  [/تسليم أوراق الإجابة/gi, 'tasliimu awrooqil ijaabah'],
  [/مدرسة الإمامة/gi, 'madrosatil imaamah'],
  [/الإمامة/gi, 'Al-Imaamah'],
  [/صلاة الضحى/gi, 'sholaatidh dhuhaa'],
  [/صلاة العصر/gi, 'sholaatil ashri'],
  [/صلاة الجماعة/gi, 'sholaatil jamaa-ah'],
  [/وتلاوة القرآن الكريم/gi, "wa tilaawatil qur'aanil kariim"],
  [/تلاوة القرآن الكريم/gi, "tilaawatil qur'aanil kariim"],
  [/وقراءة أسماء الله الحسنى/gi, "wa qiroo-ati asmaa-illaahil husnaa"],
  [/أسماء الله الحسنى/gi, "asmaa-illaahil husnaa"],
  [/سورة يس/gi, 'suuroti yaasiin'],
  [/في أمان الله وحفظه/gi, "fii amaanillaahi wa hifzhih"],
  [/في أمان الله/gi, "fii amaanillaah"],
  [/بنية خالصة لطلب العلم/gi, "bi-niyyatin khoolishoh litholabil 'ilm"],
  [/طلب العلم/gi, "tholabil 'ilm"],
  [/المحاضرة والخطابة/gi, "al-muhaadhoroti wal khithoobah"],
  [/حفظ القرآن الكريم/gi, "hifzhil qur'aanil kariim"],
  [/شهر رمضان المبارك/gi, "syahri romadhoonil mubaarok"],
  [/شهر رمضان/gi, "syahri romadhoon"],
  [/صياماً مقبولاً/gi, "shiyaaman maqbuulaa"],
  [/السلام عليكم ورحمة الله وبركاته/gi, "Assalaamu 'alaikum wa rohmatullaahi wa barokaatuh"],
  [/السلام عليكم/gi, "Assalaamu 'alaikum"],
];

/**
 * Intelligent character-level Arabic-to-Indonesian phonetic transliterator.
 * Transliterates Arabic script into Latin syllables that Indonesian TTS voices pronounce
 * with natural Arabic phonology.
 */
export function transliterateArabicToPhonetic(arabicText: string): string {
  if (!arabicText || !arabicText.trim()) return '';
  let text = arabicText.trim();

  // 1. Check known multi-word phrases first
  for (const [pattern, replacement] of ARABIC_WORD_MAP) {
    text = text.replace(pattern, replacement);
  }

  // If text already converted or mostly Latin
  if (!isArabicText(text)) {
    return text.replace(/\s+/g, ' ').trim();
  }

  // 2. Character-by-character mapping for remaining Arabic glyphs
  const charMap: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ء': "'", 'ؤ': "'u", 'ئ': "'i",
    'ب': 'b', 'ت': 't', 'ث': 'ts', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dz', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sy',
    'ص': 'sh', 'ض': 'dh', 'ط': 'th', 'ظ': 'zh', 'ع': "'a", 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'h',
    // Harakat
    '\u064E': 'a', // Fathah
    '\u0650': 'i', // Kasrah
    '\u064F': 'u', // Dammah
    '\u064B': 'an', // Fathatan
    '\u064D': 'in', // Kasratan
    '\u064C': 'un', // Dammatan
    '\u0652': '', // Sukun
    '\u0640': '', // Tatweel
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\u0651') {
      // Shaddah: duplicate previous consonant if possible
      const lastChar = result.slice(-1);
      if (lastChar && /[a-z]/i.test(lastChar)) {
        result += lastChar;
      }
    } else if (charMap[ch] !== undefined) {
      result += charMap[ch];
    } else {
      result += ch;
    }
  }

  // Clean up repeated vowels and spacing
  return result
    .replace(/aaa+/g, 'aa')
    .replace(/iii+/g, 'ii')
    .replace(/uuu+/g, 'uu')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns the best phonetic pronunciation for Arabic text.
 * Checks presets, period matches, and falls back to algorithmic transliteration.
 */
export function getPhoneticArabicText(text: string): string {
  if (!text) return '';

  // 1. Exact preset match
  for (const preset of MULTI_LANGUAGE_PRESETS) {
    if (preset.phrases.ar.trim() === text.trim()) {
      if (ARABIC_PHONETIC_PRESETS[preset.id]) {
        return ARABIC_PHONETIC_PRESETS[preset.id];
      }
    }
  }

  // 2. Period pattern match (e.g. "حان الآن موعد بدء الحصة الأولى")
  const periodMatch = text.match(/الحصة\s*(الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية\s*عشرة|الثانية\s*عشرة)/i);
  if (periodMatch) {
    const pWord = periodMatch[1].replace(/\s+/g, ' ');
    const numMap: Record<string, number> = {
      'الأولى': 1, 'الثانية': 2, 'الثالثة': 3, 'الرابعة': 4,
      'الخامسة': 5, 'السادسة': 6, 'السابعة': 7, 'الثامنة': 8,
      'التاسعة': 9, 'العاشرة': 10, 'الحادية عشرة': 11, 'الثانية عشرة': 12,
    };
    const num = numMap[pWord];
    if (num && ARABIC_PHONETIC_PRESETS[`pelajaran-${num}`]) {
      return ARABIC_PHONETIC_PRESETS[`pelajaran-${num}`];
    }
  }

  // 3. Fallback to algorithmic transliterator
  return transliterateArabicToPhonetic(text);
}

/**
 * Returns phonetic fallback for Mandarin (Pinyin)
 */
export function getPhoneticMandarinText(text: string): string {
  if (!text) return '';
  for (const preset of MULTI_LANGUAGE_PRESETS) {
    if (preset.phrases.zh.trim() === text.trim()) {
      if (MANDARIN_PHONETIC_PRESETS[preset.id]) {
        return MANDARIN_PHONETIC_PRESETS[preset.id];
      }
    }
  }
  // Period numbers
  const periodMatch = text.match(/第([一二三四五六七八九十]+)节/);
  if (periodMatch) {
    const zhNum = periodMatch[1];
    const map: Record<string, number> = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    };
    const num = map[zhNum];
    if (num && MANDARIN_PHONETIC_PRESETS[`pelajaran-${num}`]) {
      return MANDARIN_PHONETIC_PRESETS[`pelajaran-${num}`];
    }
  }
  return text;
}

/**
 * Cache of voices loaded by the browser
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Helper to retrieve SpeechSynthesis Voice for a given language code.
 * Searches across dialects, regional codes, voice names, and multilingual engines.
 */
export function getSpeechVoiceForLanguage(langCode: LanguageCode): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const voiceList = voices && voices.length > 0 ? voices : cachedVoices;
  if (!voiceList || voiceList.length === 0) return null;

  switch (langCode) {
    case 'id':
      return (
        voiceList.find((v) => v.lang === 'id-ID' || v.lang.toLowerCase().startsWith('id')) ||
        voiceList.find((v) => v.name.toLowerCase().includes('indonesia')) ||
        null
      );

    case 'en':
      return (
        voiceList.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.toLowerCase().startsWith('en')) ||
        voiceList.find((v) => v.name.toLowerCase().includes('english')) ||
        null
      );

    case 'ar': {
      // 1. Exact match ar-SA
      const saudi = voiceList.find((v) => {
        const lang = v.lang.toLowerCase().replace('_', '-');
        return lang === 'ar-sa' || lang === 'ar-eg' || lang === 'ar-ae';
      });
      if (saudi) return saudi;

      // 2. Any Arabic dialect tag (ar-*)
      const anyAr = voiceList.find((v) => {
        const lang = v.lang.toLowerCase().replace('_', '-');
        return lang === 'ar' || lang.startsWith('ar-') || lang.startsWith('ar_');
      });
      if (anyAr) return anyAr;

      // 3. Match by name
      const nameMatch = voiceList.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('arabic') ||
          name.includes('العربية') ||
          name.includes('saudi') ||
          /tarik|maged|laila|hoda|salma|shakir|hamed|zeina|mariam|yousef|naayf|nour|ayman|mona|halim|kamal|fatima/i.test(name)
        );
      });
      return nameMatch || null;
    }

    case 'zh': {
      const mainland = voiceList.find((v) => {
        const lang = v.lang.toLowerCase().replace('_', '-');
        return lang === 'zh-cn' || lang === 'zh-cmn' || lang === 'zh-hans';
      });
      if (mainland) return mainland;

      const anyZh = voiceList.find((v) => {
        const lang = v.lang.toLowerCase().replace('_', '-');
        return lang === 'zh' || lang.startsWith('zh-') || lang.startsWith('zh_');
      });
      if (anyZh) return anyZh;

      const nameMatch = voiceList.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('chinese') ||
          name.includes('mandarin') ||
          name.includes('putonghua') ||
          name.includes('中文') ||
          name.includes('普通话') ||
          /huihui|yaoyao|kangkang|xiaoxiao|yunyang|zhiwei/i.test(name)
        );
      });
      return nameMatch || null;
    }

    default:
      return null;
  }
}

/**
 * Checks whether a native system voice is installed for a language
 */
export function hasNativeVoiceForLanguage(langCode: LanguageCode): boolean {
  return getSpeechVoiceForLanguage(langCode) !== null;
}

/**
 * Returns voice status and operational mode for all supported languages
 */
export function getVoiceEngineStatus(): Record<LanguageCode, { hasNativeVoice: boolean; voiceName?: string; mode: 'native' | 'phonetic' }> {
  const result: Record<LanguageCode, { hasNativeVoice: boolean; voiceName?: string; mode: 'native' | 'phonetic' }> = {
    id: { hasNativeVoice: false, mode: 'native' },
    en: { hasNativeVoice: false, mode: 'native' },
    ar: { hasNativeVoice: false, mode: 'native' },
    zh: { hasNativeVoice: false, mode: 'native' },
  };

  const codes: LanguageCode[] = ['id', 'en', 'ar', 'zh'];
  for (const c of codes) {
    const v = getSpeechVoiceForLanguage(c);
    if (v) {
      result[c] = { hasNativeVoice: true, voiceName: v.name, mode: 'native' };
    } else {
      result[c] = { hasNativeVoice: false, mode: 'phonetic' };
    }
  }

  return result;
}

