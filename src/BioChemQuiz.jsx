import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Timer, Trophy, Flame, Play, RefreshCw, Stethoscope, BookOpen, ChevronRight, CheckCircle2, XCircle, X, Puzzle, UserCircle, UserPlus, LogOut } from 'lucide-react';

// ==================== TRỰC QUAN HÓA MINH HỌA BẰNG AI VÀ HÌNH VẼ ĐẸP ====================
const SubjectIllustration = ({ questionText }) => {
  const text = (questionText || '').toLowerCase();
  
  if (text.includes('hóa') || text.includes('axit') || text.includes('acid') || text.includes('brom') || text.includes('phản ứng') || text.includes('chemical') || text.includes('chất') || text.includes('dung dịch') || text.includes('coomassie') || text.includes('nhuộm')) {
    return (
      <svg className="w-14 h-14 text-emerald-500 animate-pulse" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <path d="M26 12H38V22L48 44C50 48 47 52 42 52H22C17 52 14 48 16 44L26 22V12Z" stroke="#059669" strokeWidth="3" strokeLinejoin="round" />
        <path d="M19.5 44C25 44 23 40 32 40C41 40 39 44 44.5 44L47.5 44L42 52H22L16.5 44H19.5Z" fill="url(#flaskGrad)" opacity="0.8" />
        <line x1="28" y1="28" x2="33" y2="28" stroke="#374151" strokeWidth="2" />
        <circle cx="32" cy="30" r="3" fill="#34D399" className="animate-ping" style={{ animationDuration: '2s' }} />
        <circle cx="28" cy="36" r="2" fill="#34D399" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="36" cy="35" r="2.5" fill="#6EE7B7" className="animate-bounce" />
      </svg>
    );
  }
  
  if (text.includes('dna') || text.includes('rna') || text.includes('gen') || text.includes('nhiễm sắc thể') || text.includes('di truyền') || text.includes('nucleotit') || text.includes('sinh học') || text.includes('tế bào') || text.includes('màng') || text.includes('vi khuẩn')) {
    return (
      <svg className="w-14 h-14 text-indigo-500 animate-[spin_15s_linear_infinite]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="dnaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <path d="M12 12C20 12 24 52 32 52C40 52 44 12 52 12" stroke="url(#dnaGrad1)" strokeWidth="4" strokeLinecap="round" />
        <path d="M12 52C20 52 24 12 32 12C40 12 44 52 52 52" stroke="url(#dnaGrad2)" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="24" x2="22" y2="40" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="32" y1="12" x2="32" y2="52" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="42" y1="24" x2="42" y2="40" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="22" cy="24" r="3.5" fill="#4F46E5" />
        <circle cx="22" cy="40" r="3.5" fill="#EC4899" />
        <circle cx="42" cy="24" r="3.5" fill="#EC4899" />
        <circle cx="42" cy="40" r="3.5" fill="#4F46E5" />
      </svg>
    );
  }
  
  if (text.includes('protein') || text.includes('enzyme') || text.includes('albumin') || text.includes('amin') || text.includes('peptid') || text.includes('globulin') || text.includes('hemoglobin')) {
    return (
      <svg className="w-14 h-14 text-rose-500 animate-pulse" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="protGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </linearGradient>
        </defs>
        <path d="M12 32C12 20 22 16 32 32C42 48 52 44 52 32" stroke="url(#protGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="24" r="5" fill="#FB7185" />
        <circle cx="32" cy="32" r="6" fill="#F43F5E" />
        <circle cx="42" cy="40" r="5.5" fill="#FDA4AF" />
        <circle cx="16" cy="34" r="4.5" fill="#E11D48" />
        <circle cx="48" cy="28" r="4" fill="#FECDD3" />
        <line x1="22" y1="24" x2="32" y2="32" stroke="#FDA4AF" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="42" y1="40" x2="32" y2="32" stroke="#FDA4AF" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }

  if (text.includes('toán') || text.includes('lý') || text.includes('vật lý') || text.includes('hình') || text.includes('số') || text.includes('phép tính') || text.includes('lực') || text.includes('điện') || text.includes('vận tốc') || text.includes('năng lượng')) {
    return (
      <svg className="w-14 h-14 text-blue-500" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="atomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(30 32 32)" stroke="#93C5FD" strokeWidth="2" />
        <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(-30 32 32)" stroke="#93C5FD" strokeWidth="2" />
        <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(90 32 32)" stroke="#93C5FD" strokeWidth="2" />
        <circle cx="32" cy="32" r="6.5" fill="url(#atomGrad)" />
        <circle cx="14" cy="22" r="3.5" fill="#2563EB" className="animate-[ping_1.5s_infinite]" />
        <circle cx="50" cy="42" r="3" fill="#3B82F6" className="animate-bounce" />
        <circle cx="32" cy="58" r="3" fill="#1D4ED8" />
      </svg>
    );
  }

  if (text.includes('tiếng anh') || text.includes('anh') || text.includes('từ vựng') || text.includes('ngữ pháp') || text.includes('dịch') || text.includes('english')) {
    return (
      <svg className="w-14 h-14 text-cyan-500 animate-bounce" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16H42C46.5 16 50 19.5 50 24V40C50 44.5 46.5 48 42 48H22L12 56V16Z" fill="#E0F7FA" stroke="#00ACC1" strokeWidth="3" strokeLinejoin="round" />
        <text x="16" y="38" fill="#006064" fontSize="16" fontWeight="extrabold" fontFamily="sans-serif">A B C</text>
        <circle cx="48" cy="18" r="4.5" fill="#00E5FF" />
      </svg>
    );
  }

  if (text.includes('văn') || text.includes('sử') || text.includes('địa') || text.includes('lịch sử') || text.includes('địa lý') || text.includes('nhà thơ') || text.includes('nhà văn') || text.includes('tác phẩm')) {
    return (
      <svg className="w-14 h-14 text-amber-600" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 12H44C48 12 50 15 50 18V46C50 49 48 52 44 52H14C10 52 8 49 8 46V18C8 15 10 12 14 12Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="2.5" />
        <path d="M46 16V48" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="16" y1="22" x2="38" y2="22" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="30" x2="34" y2="30" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="38" x2="38" y2="38" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="46" x2="28" y2="46" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 46L54 20C54.5 19 55.5 19 56 19.5C56.5 20 56.5 21 55.5 22L46 48L42 46Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg className="w-14 h-14 text-amber-500 animate-bounce" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mangoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path d="M32 8C44 8 50 18 50 32C50 48 40 56 32 56C24 56 14 48 14 32C14 18 20 8 32 8Z" fill="url(#mangoBodyGrad)" />
      <path d="M32 8C32 2 37 1 40 2C42 4 39 8 32 8Z" fill="#10B981" />
      <path d="M32 8V6" stroke="#78350F" strokeWidth="2" />
      <circle cx="26" cy="30" r="3" fill="#1F2937" />
      <circle cx="38" cy="30" r="3" fill="#1F2937" />
      <circle cx="27" cy="29" r="1" fill="#FFFFFF" />
      <circle cx="39" cy="29" r="1" fill="#FFFFFF" />
      <circle cx="22" cy="34" r="2.5" fill="#EF4444" opacity="0.6" />
      <circle cx="42" cy="34" r="2.5" fill="#EF4444" opacity="0.6" />
      <path d="M29 36C29 38 35 38 35 36" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20L12 22M12 20L10 22" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 24L54 26M54 24L52 26" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const renderLectureExplanation = (text, questionText = '') => {
  if (!text) return null;

  const sections = text.split(/###\s*/);
  const renderedSections = [];
  
  const parseInlineFormatting = (str) => {
    if (!str) return '';
    const parts = [];
    let currentIdx = 0;
    const regex = /\*\*([^*]+)\*\*/g;
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      const precedingText = str.slice(currentIdx, match.index);
      if (precedingText) {
        parts.push(precedingText);
      }
      parts.push(
        <strong key={match.index} className="font-black text-indigo-950 bg-indigo-50 px-1.5 py-0.5 rounded mx-0.5 border border-indigo-200/40">
          {match[1]}
        </strong>
      );
      currentIdx = regex.lastIndex;
    }
    
    const remainingText = str.slice(currentIdx);
    if (remainingText) {
      parts.push(remainingText);
    }
    
    return parts.length > 0 ? parts : str;
  };

  sections.forEach((section, idx) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n');
    const headingLine = lines[0].trim();
    const bodyText = lines.slice(1).join('\n').trim();

    let cardTheme = "indigo";
    let icon = "💡";
    let bgGradient = "from-slate-50 to-white";
    let borderColor = "border-slate-200/80";
    let titleColor = "text-slate-800";
    
    if (headingLine.toLowerCase().includes("sai") || headingLine.includes("❌")) {
      cardTheme = "red";
      icon = "🎯";
      bgGradient = "from-rose-50/60 to-white";
      borderColor = "border-rose-100";
      titleColor = "text-rose-950 font-black";
    } else if (headingLine.toLowerCase().includes("đúng") || headingLine.includes("✅")) {
      cardTheme = "emerald";
      icon = "🔬";
      bgGradient = "from-emerald-50/60 to-white";
      borderColor = "border-emerald-100";
      titleColor = "text-emerald-950 font-black";
    } else if (headingLine.toLowerCase().includes("mẹo") || headingLine.includes("💡") || headingLine.toLowerCase().includes("nhớ")) {
      cardTheme = "amber";
      icon = "💡";
      bgGradient = "from-amber-50/70 via-yellow-50/20 to-white";
      borderColor = "border-amber-200 shadow-md shadow-amber-50/20";
      titleColor = "text-amber-950 font-black";
    }

    const paragraphs = bodyText.split('\n').filter(p => p.trim() !== '');

    renderedSections.push(
      <div 
        key={idx} 
        className={`rounded-2xl border ${borderColor} bg-gradient-to-br ${bgGradient} p-5 space-y-3 shadow-sm hover:shadow transition-all duration-300 relative overflow-hidden`}
      >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-current pointer-events-none text-${cardTheme}-600`} />

        <h5 className={`text-sm md:text-base font-extrabold flex items-center gap-2 ${titleColor} border-b pb-2 ${borderColor}/50`}>
          <span className="text-xl">{icon}</span>
          <span>{headingLine}</span>
        </h5>
        
        <div className="text-slate-700 text-sm leading-relaxed space-y-2.5">
          {paragraphs.map((p, pIdx) => {
            const pTrim = p.trim();
            if (pTrim.startsWith('-') || pTrim.startsWith('👉') || pTrim.startsWith('•')) {
              const cleanedText = pTrim.replace(/^[-•👉]\s*/, '');
              return (
                <div key={pIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-indigo-500 mt-1 select-none">✦</span>
                  <p className="flex-1 text-slate-700 leading-relaxed">
                    {parseInlineFormatting(cleanedText)}
                  </p>
                </div>
              );
            }
            return (
              <p key={pIdx} className="leading-relaxed">
                {parseInlineFormatting(pTrim)}
              </p>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300 select-text">
      {questionText && (
        <div className="flex flex-col md:flex-row items-center gap-5 bg-gradient-to-br from-violet-50 to-indigo-50/40 rounded-2xl p-5 border border-indigo-100/60 shadow-sm shrink-0">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center bg-white rounded-2xl shadow-inner border border-indigo-50">
            <SubjectIllustration questionText={questionText} />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h6 className="font-bold text-slate-800 text-sm flex items-center justify-center md:justify-start gap-1">
              <span>🎨 Tranh Minh Họa AI Sinh Động</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 bg-indigo-100/80 px-2 py-0.5 rounded-full">Trực quan hóa</span>
            </h6>
            <p className="text-slate-500 text-xs leading-normal">
              Hình ảnh trực quan hóa chủ đề kiến thức của câu hỏi này giúp bạn kích thích bán cầu não phải để ghi nhớ thông tin nhanh gấp 3 lần!
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {renderedSections}
      </div>
    </div>
  );
};

const labData = [
  { category: "Đường", name: "Glucose", value: "75-115 mg/dL (4,2-6,4 mmol/L)" },
  { category: "Đường", name: "HbA1c", value: "> 6,5%" },
  { category: "Gan", name: "AST (GOT) - Nam", value: "≥ 45 U/L" },
  { category: "Gan", name: "AST (GOT) - Nữ", value: "≥ 34 U/L" },
  { category: "Gan", name: "ALT (GPT) - Nam", value: "≥ 35 U/L" },
  { category: "Gan", name: "ALT (GPT) - Nữ", value: "≥ 31 U/L" },
  { category: "Gan", name: "GGT - Nam", value: "11 – 50 IU/L" },
  { category: "Gan", name: "GGT - Nữ", value: "7 – 32 IU/L" },
  { category: "Gan", name: "Bilirubin Toàn phần (T)", value: "≤ 2 mg/dL" },
  { category: "Gan", name: "Bilirubin Trực tiếp (D)", value: "0 – 0,2 mg/dL" },
  { category: "Gan", name: "Protein", value: "60 – 80 g/L (6 – 8 g/dL)" },
  { category: "Gan", name: "Albumin", value: "35 – 48 g/L (3,5 – 4,8 g/dL)" },
  { category: "Gan", name: "NH3", value: "15 – 45 μg/dL" },
  { category: "Gout", name: "Acid uric - Nam", value: "3,5 – 7,2 mg/dL (210 – 432 mmol/L)" },
  { category: "Gout", name: "Acid uric - Nữ", value: "2,6 – 6,0 mg/dL (156 – 360 mmol/L)" },
  { category: "Thận", name: "Creatinin - Nam", value: "0,6 – 1,1 mg/dL (53 – 97 μmol/l)" },
  { category: "Thận", name: "Creatinin - Nữ", value: "0,5 – 0,9 mg/dL (44 – 80 μmol/l)" },
  { category: "Thận", name: "Ure", value: "17 – 43 mg/dL (2,8 – 7,2 mmol/L)" },
  { category: "Mỡ máu", name: "Cholesterol", value: "150 – 260 mg/dL (3,9 – 6,7 mmol/L)" },
  { category: "Mỡ máu", name: "Triglycerid", value: "150 – 200 mg/dL (1,7 – 2,29 mmol/L)" },
  { category: "Mỡ máu", name: "HDL-c - Nam", value: "40 – 50 mg/dL (1,0 – 1,3 mmol/L)" },
  { category: "Mỡ máu", name: "HDL-c - Nữ", value: "50 – 59 mg/dL (1,3 – 1,5 mmol/L)" },
  { category: "Mỡ máu", name: "LDL-c", value: "< 100 mg/dL" },
  { category: "Tụy", name: "Lipase", value: "0 – 50 U/L" },
  { category: "Tụy", name: "α-Amylase", value: "< 80 U/L" },
  { category: "Tuyến giáp", name: "FT3", value: "3,1 – 6,8 pmol/L" },
  { category: "Tuyến giáp", name: "FT4", value: "12 – 22 pmol/L" },
  { category: "Tuyến giáp", name: "TSH", value: "0,4 – 4,0 mIU/L" },
  { category: "Tim mạch", name: "Troponin I", value: "< 40 ng/L" },
  { category: "Tim mạch", name: "CKMB", value: "< 25 U/L" },
  { category: "Viêm", name: "CRP", value: "< 5 mg/l" },
  { category: "Viêm", name: "RF", value: "< 15 IU/mL" },
  { category: "Viêm", name: "ASLO", value: "< 200 IU/mL" },
  { category: "Điện giải", name: "K+", value: "3,5 – 5,0 mmol/L" },
  { category: "Điện giải", name: "Na+", value: "135 – 145 mmol/L" },
  { category: "Điện giải", name: "Cl-", value: "98 – 110 mmol/L" },
  { category: "Điện giải", name: "Ca2+", value: "4,6 - 5,3 mg/dL (1,15 – 1,3 mmol/L)" },
  { category: "Điện giải", name: "Calci toàn phần", value: "8,5 – 10,5 mg/dL (2,1 – 2,6 mmol/L)" },
  { category: "Nước tiểu", name: "Blood (Blo)", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Leukocytes (Leuk)", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Nitrite", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Glucose (Glu) NT", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Protein (Pro) NT", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Bilirubin (Bil) NT", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Cetone NT", value: "Âm tính (NEG)" },
  { category: "Nước tiểu", name: "Urobilinogen (Uro)", value: "0,2 mg/dl" },
  { category: "Nước tiểu", name: "pH", value: "5 – 6" },
  { category: "Nước tiểu", name: "Tỷ trọng (Sg)", value: "1,003 – 1,030" },
  { category: "Ung thư", name: "CA 15-3", value: "Ung thư vú" },
  { category: "Ung thư", name: "CA 19-9", value: "Ung thư đường tiêu hóa" },
  { category: "Ung thư", name: "CA 125", value: "Ung thư Cổ tử cung / Buồng trứng" },
  { category: "Ung thư", name: "PSA", value: "Ung thư tiền liệt tuyến" },
  { category: "Ung thư", name: "AFP", value: "Ung thư gan" },
  { category: "Ung thư", name: "CEA", value: "Ung thư đại trực tràng" },
];

const WRONG_GIFS = [
  '/GIFT/cat_kitten.gif',
  '/GIFT/cat_stare.gif',
  '/GIFT/cockroach.gif',
  '/GIFT/horse_stare.gif',
  '/GIFT/instagram_horror.gif',
  '/GIFT/not_funny_smile.gif',
  '/GIFT/housewives_cat.gif'
];

const GAME_TIME = 60;

export default function BioChemQuiz({ onClose, addXP, unlockBadge }) {
  const [gameState, setGameState] = useState('login');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [streak, setStreak] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showWrongOverlay, setShowWrongOverlay] = useState(false);
  const [wrongGif, setWrongGif] = useState('');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalQuestionsPlayed, setTotalQuestionsPlayed] = useState(0);
  const wrongTimeoutRef = useRef(null);

  // Preload Meme GIFs để hiển thị ngay lập tức khi sai
  useEffect(() => {
    WRONG_GIFS.forEach(gif => {
      const img = new Image();
      img.src = gif;
    });
  }, []);

  const [profiles, setProfiles] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isNewRecord, setIsNewRecord] = useState(false);
  const hasUpdatedStats = useRef(false);

  const [matchingCards, setMatchingCards] = useState([]);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [lastMode, setLastMode] = useState('playing');
  const MATCH_PAIRS_COUNT = 6;

  // --- STATE MEME SOUND & SMART ERROR NOTEBOOK ---
  const [wrongQuestions, setWrongQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('exam_master_biochem_errors');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('exam_master_biochem_muted') === 'true';
  });

  const playSound = (type) => {
    if (isMuted) return;
    try {
      let audio;
      if (type === 'correct') {
        audio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
        audio.volume = 0.4;
      } else {
        // Âm thanh buồn cười meme khi làm sai (sad trombone)
        audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2648/2648-preview.mp3');
        audio.volume = 0.5;
      }
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // --- LOGIC HỖ TRỢ GIẢI THÍCH LÂM SÀNG BẰNG AI ---
  const [aiExplanations, setAiExplanations] = useState(() => {
    try {
      const saved = localStorage.getItem('exam_master_biochem_ai_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [loadingAiId, setLoadingAiId] = useState(null);

  const handleGetAIExplanation = async (questionItem) => {
    if (aiExplanations[questionItem.name]) return;
    setLoadingAiId(questionItem.name);

    const apiKey = localStorage.getItem('apifree_api_key') || 'sk-psBHjnJjNm0p55Fk41tp3YwFFNfeB';
    const promptText = `Bạn là một chuyên gia sinh hóa y học lâm sàng và giáo viên thông thái.
Hãy giải thích thật ngắn gọn (dưới 80 từ), dễ hiểu và sinh động bằng tiếng Việt cho học sinh y khoa biết:
Chỉ số xét nghiệm "${questionItem.name}" thuộc nhóm "${questionItem.category}" có trị số bình thường là "${questionItem.value}".
Tại sao trị số này lại quan trọng và ý nghĩa lâm sàng của nó là gì khi tăng hoặc giảm? Hãy đưa ra một mẹo nhớ cực nhanh, hài hước để học sinh thuộc lòng ngay lập tức!`;

    try {
      const response = await fetch('https://api.apifree.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-5.5',
          messages: [{ role: 'user', content: promptText }],
          max_tokens: 300,
          stream: false
        })
      });
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      setAiExplanations(prev => {
        const updated = { ...prev, [questionItem.name]: content };
        localStorage.setItem('exam_master_biochem_ai_cache', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối với AI lúc này. Trị số bình thường của ' + questionItem.name + ' là ' + questionItem.value);
    }
    setLoadingAiId(null);
  };

  const categories = ['All', ...new Set(labData.map(item => item.category))];

  const handleLogin = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (!profiles[trimmedName]) {
      setProfiles(prev => ({
        ...prev,
        [trimmedName]: { playCount: 0, bestScore: 0 }
      }));
    }
    setCurrentUser(trimmedName);
    setGameState('menu');
    setNewUserName('');
  };

  const generateQuestion = useCallback(() => {
    let filteredData = labData;
    if (selectedCategory !== 'All') {
      filteredData = labData.filter(item => item.category === selectedCategory);
    }

    const questionItem = filteredData[Math.floor(Math.random() * filteredData.length)];
    const distractorSet = new Set([questionItem.value]);
    let sourceForDistractors = labData;

    if (questionItem.category === 'Ung thư') {
      sourceForDistractors = labData.filter(i => i.category === 'Ung thư');
    } else if (questionItem.value === 'Âm tính (NEG)') {
      sourceForDistractors = labData.filter(i => i.value !== 'Âm tính (NEG)' && i.category !== 'Ung thư');
    }

    let attempts = 0;
    while (distractorSet.size < 4 && attempts < 100) {
      const randomItem = sourceForDistractors[Math.floor(Math.random() * sourceForDistractors.length)];
      distractorSet.add(randomItem.value);
      attempts++;
    }

    if (distractorSet.size < 4) {
      distractorSet.add('100 - 150 mg/dL');
      distractorSet.add('< 50 U/L');
      distractorSet.add('Dương tính (POS)');
    }

    const optionsArray = Array.from(distractorSet).slice(0, 4);
    optionsArray.sort(() => Math.random() - 0.5);

    setCurrentQuestion(questionItem);
    setOptions(optionsArray);
    setFeedback(null);
    setSelectedAnswer(null);
  }, [selectedCategory]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_TIME);
    setCorrectAnswersCount(0);
    setTotalQuestionsPlayed(0);
    setLastMode('playing');
    setIsNewRecord(false);
    hasUpdatedStats.current = false;
    setGameState('playing');
    generateQuestion();
  };

  const generateMatchingRound = useCallback(() => {
    let filteredData = labData;
    if (selectedCategory !== 'All') {
      filteredData = labData.filter(item => item.category === selectedCategory);
    }

    const shuffled = [...filteredData].sort(() => 0.5 - Math.random());
    const maxPairs = Math.min(MATCH_PAIRS_COUNT, filteredData.length);
    const selectedItems = shuffled.slice(0, maxPairs);
    const newCards = [];

    selectedItems.forEach((item, index) => {
      newCards.push({ id: `name-${Date.now()}-${index}`, text: item.name, matchId: index, type: 'name', category: item.category });
      newCards.push({ id: `val-${Date.now()}-${index}`, text: item.value, matchId: index, type: 'value', category: item.category });
    });

    newCards.sort(() => 0.5 - Math.random());
    setMatchingCards(newCards);
    setSelectedCardIds([]);
    setMatchedPairIds([]);
  }, [selectedCategory]);

  const startMatchingGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_TIME + 30);
    setCorrectAnswersCount(0);
    setTotalQuestionsPlayed(0);
    setLastMode('matching');
    setIsNewRecord(false);
    hasUpdatedStats.current = false;
    setGameState('matching');
    generateMatchingRound();
  };

  const handleMatchingCardClick = (card) => {
    if (matchedPairIds.includes(card.matchId) || selectedCardIds.includes(card.id) || selectedCardIds.length >= 2) return;

    const newSelected = [...selectedCardIds, card.id];
    setSelectedCardIds(newSelected);

    if (newSelected.length === 2) {
      const card1 = matchingCards.find(c => c.id === newSelected[0]);
      const card2 = matchingCards.find(c => c.id === newSelected[1]);
      if (card1.matchId === card2.matchId && card1.type !== card2.type) {
        setTimeout(() => {
          setMatchedPairIds(prev => {
            const nextMatched = [...prev, card1.matchId];
            if (nextMatched.length >= matchingCards.length / 2) {
              setTimeout(() => {
                setTimeLeft(t => t + 10);
                generateMatchingRound();
              }, 600);
            }
            return nextMatched;
          });
          setSelectedCardIds([]);
          setScore(prev => prev + 15 + (streak * 5));
          setStreak(prev => prev + 1);
          setCorrectAnswersCount(prev => prev + 1);
        }, 500);
      } else {
        setStreak(0);
        setTimeout(() => {
          setSelectedCardIds([]);
          setTimeLeft(prev => Math.max(0, prev - 2));
        }, 800);
      }
    }
  };

  useEffect(() => {
    let timer;
    if ((gameState === 'playing' || gameState === 'matching') && timeLeft > 0 && !feedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && (gameState === 'playing' || gameState === 'matching')) {
      if (!hasUpdatedStats.current && currentUser) {
        setProfiles(prev => {
          const prevStats = prev[currentUser] || { playCount: 0, bestScore: 0 };
          if (score > prevStats.bestScore && score > 0) {
            setIsNewRecord(true);
          }
          return {
            ...prev,
            [currentUser]: {
              playCount: prevStats.playCount + 1,
              bestScore: Math.max(prevStats.bestScore, score)
            }
          };
        });
        hasUpdatedStats.current = true;
      }
      setGameState('gameover');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, feedback, currentUser, score]);

  const handleAnswerClick = (answer) => {
    if (feedback) return;
    setSelectedAnswer(answer);
    setTotalQuestionsPlayed(prev => prev + 1);
    
    const isCorrect = answer === currentQuestion.value;
    if (isCorrect) {
      setFeedback('correct');
      playSound('correct');
      const points = 10 + (streak * 2);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCorrectAnswersCount(prev => prev + 1);
      if ((streak + 1) % 5 === 0) setTimeLeft(prev => prev + 3);

      if (addXP) addXP(10);
      if (streak + 1 >= 15 && unlockBadge) {
        unlockBadge('Chiến thần Hóa Sinh');
      }
      
      setTimeout(() => {
        if (timeLeft > 0) generateQuestion();
      }, 1000);
    } else {
      setFeedback('wrong');
      setStreak(0);
      setTimeLeft(prev => Math.max(0, prev - 2));
      playSound('wrong');

      // Thêm câu hỏi vào Sổ tay lỗi sai
      setWrongQuestions(prev => {
        if (prev.some(q => q.name === currentQuestion.name)) return prev;
        const updated = [...prev, { ...currentQuestion, timestamp: Date.now() }];
        localStorage.setItem('exam_master_biochem_errors', JSON.stringify(updated));
        return updated;
      });
      
      const randomGif = WRONG_GIFS[Math.floor(Math.random() * WRONG_GIFS.length)];
      setWrongGif(randomGif);
      setShowWrongOverlay(true);
      
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = setTimeout(() => {
        setShowWrongOverlay(false);
        if (timeLeft > 0) generateQuestion();
      }, 30000); // Tự động chuyển câu sau 30s
    }
  };

  const getAccuracy = () => {
    if (totalQuestionsPlayed === 0) return 0;
    return Math.round((correctAnswersCount / totalQuestionsPlayed) * 100);
  };

  if (gameState === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 rounded-full p-2 bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
            <UserCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2 relative z-10">Hồ Sơ Bác Sĩ</h1>
          <p className="text-slate-500 mb-8 relative z-10">Tạo hoặc chọn hồ sơ để lưu lại quá trình học tập.</p>
          {Object.keys(profiles).length > 0 && (
            <div className="mb-6 text-left relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-3">Chọn hồ sơ có sẵn:</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(profiles).map(([name, stats]) => (
                  <button
                    key={name}
                    onClick={() => handleLogin(name)}
                    className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition-colors flex flex-col"
                  >
                    <span className="font-bold text-slate-800 truncate mb-1">{name}</span>
                    <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-md self-start">Kỷ lục: {stats.bestScore}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={`text-left relative z-10 ${Object.keys(profiles).length > 0 ? 'border-t border-slate-100 pt-6' : ''}`}>
            <label className="block text-sm font-bold text-slate-700 mb-3">Hoặc tạo người chơi mới:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin(newUserName)}
                placeholder="Nhập tên của bạn..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => handleLogin(newUserName)}
                disabled={!newUserName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl transition-colors shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'menu') {
    const userStats = profiles[currentUser] || { playCount: 0, bestScore: 0 };
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 relative pt-16">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button 
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                localStorage.setItem('exam_master_biochem_muted', String(nextMuted));
              }}
              className="text-slate-500 hover:text-slate-800 rounded-full p-2 bg-slate-100"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 rounded-full p-2 bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
            <UserCircle className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm text-slate-700 truncate max-w-[150px]">{currentUser}</span>
          </div>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner mt-4">
            <Stethoscope className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Bác Sĩ Tài Ba</h1>
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-blue-50 px-4 py-3 rounded-2xl w-full border border-blue-100">
              <div className="text-xs text-blue-500 font-bold uppercase mb-1">Số lần trực</div>
              <div className="text-xl font-black text-blue-700">{userStats.playCount}</div>
            </div>
            <div className="bg-yellow-50 px-4 py-3 rounded-2xl w-full border border-yellow-100">
              <div className="text-xs text-yellow-600 font-bold uppercase mb-1">Kỷ lục điểm</div>
              <div className="text-xl font-black text-yellow-700">{userStats.bestScore}</div>
            </div>
          </div>
          <div className="mb-6 text-left">
            <label className="block text-sm font-medium text-slate-700 mb-2">Chọn chủ đề muốn ôn tập:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Tất cả các hệ cơ quan' : cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200"
          >
            <Play className="w-5 h-5 fill-current" />
            Bắt đầu Kiểm Tra
          </button>
          <button
            onClick={startMatchingGame}
            className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 border border-indigo-200"
          >
            <Puzzle className="w-5 h-5" />
            Chơi Ghép Thẻ Trị Số
          </button>
          <button
            onClick={() => setGameState('errors')}
            className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 border border-red-200"
          >
            <span>📓</span>
            Sổ tay lỗi sai ({wrongQuestions.length})
          </button>
          <button
            onClick={() => setGameState('study')}
            className="w-full mt-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 border border-teal-200"
          >
            <BookOpen className="w-5 h-5" />
            Xem bảng chỉ số (Học bài)
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'study') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 flex justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
          <div className="p-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> Cẩm nang chỉ số
            </h2>
            <button
              onClick={() => setGameState('menu')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
          <div className="p-6 overflow-y-auto grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labData.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{item.category}</div>
                  <div className="font-semibold text-slate-800 text-lg">{item.name}</div>
                  <div className="text-teal-600 font-medium mt-1 bg-teal-50 inline-block px-2 py-1 rounded-md">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'errors') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 flex justify-center animate-in fade-in duration-200">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
          <div className="p-6 bg-red-500 text-white flex justify-between items-center shrink-0 shadow-md">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>📓</span> Sổ Tay Lỗi Sai & Giải Thích AI
            </h2>
            <button
              onClick={() => setGameState('menu')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              Quay lại Menu
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto grow space-y-5 bg-slate-50/50">
            {wrongQuestions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 p-8 shadow-sm">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 text-4xl shadow-inner">
                  🎉
                </div>
                <h4 className="font-extrabold text-slate-800 text-lg">Sổ tay trống hoàn hảo!</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium">Bạn chưa trả lời sai chỉ số nào hoặc đã xuất sắc học thuộc hết rồi!</p>
              </div>
            ) : (
              wrongQuestions.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4 hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
                    <h4 className="font-extrabold text-slate-800 text-xl">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Trị số đúng:</span>
                      <span className="text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">{item.value}</span>
                    </div>

                    {/* AI Explanation Section */}
                    {aiExplanations[item.name] ? (
                      <div className="p-5 bg-white rounded-3xl border-2 border-slate-100 shadow-sm text-xs text-slate-800 font-medium leading-relaxed animate-in slide-in-from-top duration-300 space-y-4">
                        {renderLectureExplanation(aiExplanations[item.name], item.name)}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGetAIExplanation(item)}
                        disabled={loadingAiId === item.name}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:scale-100"
                      >
                        {loadingAiId === item.name ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang nhờ AI giải thích...
                          </>
                        ) : (
                          <>
                            <span>🧠</span> AI Giải Thích & Mẹo Nhớ Lâm Sàng
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const updated = wrongQuestions.filter(q => q.name !== item.name);
                      setWrongQuestions(updated);
                      localStorage.setItem('exam_master_biochem_errors', JSON.stringify(updated));
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all border border-slate-200 shrink-0 self-start sm:self-center"
                    title="Đã thuộc, xóa khỏi sổ tay lỗi sai"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
        <div className="max-w-2xl w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-lg">{score}</span>
            </div>
            {streak > 2 && (
              <div className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 animate-pulse text-sm">
                <Flame className="w-4 h-4 fill-current" />
                Combo x{streak}
              </div>
            )}
          </div>
          <div className={`px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 border shadow-sm transition-colors ${timeLeft <= 10 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Timer className="w-5 h-5" />
            <span className="text-lg w-6 text-center">{timeLeft}s</span>
          </div>
        </div>
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 mb-6 border-t-4 border-t-blue-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-50 opacity-50 pointer-events-none"></div>
          <div className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Nhóm: {currentQuestion.category}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 mb-4">
            Trị số bình thường của <span className="text-blue-600">{currentQuestion.name}</span> là bao nhiêu?
          </h2>
        </div>
        <div className="max-w-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option, idx) => {
            let btnClass = "bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700";
            let icon = null;
            if (feedback && option === currentQuestion.value) {
              btnClass = "bg-green-100 border-2 border-green-500 text-green-800 font-bold scale-[1.02] z-10 shadow-md";
              icon = <CheckCircle2 className="w-6 h-6 text-green-600" />;
            } else if (feedback === 'wrong' && option === selectedAnswer) {
              btnClass = "bg-red-50 border-2 border-red-400 text-red-700 opacity-80 scale-95";
              icon = <XCircle className="w-6 h-6 text-red-500" />;
            } else if (feedback) {
              btnClass = "bg-slate-50 border-2 border-slate-100 text-slate-400 opacity-50";
            }
            return (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleAnswerClick(option)}
                className={`w-full text-left p-6 rounded-2xl text-lg font-medium transition-all duration-200 flex justify-between items-center group shadow-sm ${btnClass}`}
              >
                <span className="pr-2 leading-tight">{option}</span>
                {icon || <ChevronRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${feedback ? 'hidden' : ''} text-blue-400`} />}
              </button>
            );
          })}
        </div>

        {showWrongOverlay && wrongGif && (
          <div 
            onClick={() => {
              setShowWrongOverlay(false);
              if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
              if (timeLeft > 0) generateQuestion();
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-red-100 flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
            >
              <span className="text-red-500 font-extrabold text-xl mb-2 flex items-center gap-2">
                <span>❌ Sai mất rồi!</span>
              </span>
              <p className="text-slate-500 text-xs font-semibold mb-4 text-center">Hãy ngắm meme vui vẻ rồi tiếp tục nhé! 🫣</p>
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-red-200 mb-2">
                <img src={wrongGif} alt="Wrong Meme" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Bấm ra ngoài để tiếp tục ➜</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'matching') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
        <div className="max-w-4xl w-full flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-lg">{score}</span>
            </div>
            {streak > 2 && (
              <div className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 animate-pulse text-sm">
                <Flame className="w-4 h-4 fill-current" />
                Combo x{streak}
              </div>
            )}
          </div>
          <div className={`px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 border shadow-sm transition-colors ${timeLeft <= 10 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Timer className="w-5 h-5" />
            <span className="text-lg w-6 text-center">{timeLeft}s</span>
          </div>
        </div>
        <div className="max-w-4xl w-full text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Tìm và ghép đúng trị số</h2>
          <p className="text-slate-500 mt-2">Chọn 1 thẻ Tên và 1 thẻ Trị số tương ứng để ghép cặp. Hoàn thành bàn để cộng thêm giờ!</p>
        </div>
        <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {matchingCards.map(card => {
            const isSelected = selectedCardIds.includes(card.id);
            const isMatched = matchedPairIds.includes(card.matchId);
            let cardClass = "bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-md cursor-pointer";
            if (isMatched) {
              cardClass = "bg-green-50 border-2 border-green-200 text-green-700 opacity-0 pointer-events-none transform scale-95";
            } else if (isSelected) {
              cardClass = "bg-blue-100 border-2 border-blue-500 text-blue-900 shadow-md transform scale-[1.02]";
            }
            if (selectedCardIds.length === 2 && isSelected) {
              const c1 = matchingCards.find(c => c.id === selectedCardIds[0]);
              const c2 = matchingCards.find(c => c.id === selectedCardIds[1]);
              if (c1.matchId !== c2.matchId || c1.type === c2.type) {
                cardClass = "bg-red-50 border-2 border-red-400 text-red-700 transform scale-[0.98]";
              } else {
                cardClass = "bg-green-100 border-2 border-green-500 text-green-800 shadow-md transform scale-[1.05]";
              }
            }
            return (
              <button
                key={card.id}
                onClick={() => handleMatchingCardClick(card)}
                disabled={isMatched || isSelected || selectedCardIds.length === 2}
                className={`p-4 rounded-2xl text-center font-medium min-h-[100px] flex items-center justify-center transition-all duration-300 shadow-sm ${cardClass}`}
              >
                <span className="leading-tight text-[15px] md:text-lg">{card.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-100 to-white pointer-events-none opacity-50"></div>
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner relative z-10">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 relative z-10">Hết giờ!</h1>
          <p className="text-slate-500 mb-6 relative z-10">Buổi trực của bác sĩ <span className="font-bold">{currentUser}</span> đã kết thúc.</p>
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 relative">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Điểm số</div>
            <div className={`text-5xl font-black text-blue-600 ${isNewRecord ? 'mb-2' : 'mb-4'}`}>{score}</div>
            {isNewRecord && (
              <div className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4 flex items-center justify-center gap-1 animate-bounce">
                <Flame className="w-4 h-4 fill-current" /> Phá kỷ lục!
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 mt-2">
              <div>
                <div className="text-xs text-slate-500 uppercase">{lastMode === 'playing' ? 'Trả lời đúng' : 'Cặp ghép đúng'}</div>
                <div className="text-xl font-bold text-green-600">{lastMode === 'playing' ? `${correctAnswersCount}/${totalQuestionsPlayed}` : correctAnswersCount}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase">{lastMode === 'playing' ? 'Độ chính xác' : 'Điểm kỹ năng'}</div>
                <div className="text-xl font-bold text-teal-600">{lastMode === 'playing' ? `${getAccuracy()}%` : score}</div>
              </div>
            </div>
          </div>
          <button
            onClick={lastMode === 'matching' ? startMatchingGame : startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200 mb-3"
          >
            <RefreshCw className="w-5 h-5" />
            Chơi Lại Lần Nữa
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 px-6 rounded-xl transition-colors border border-slate-200"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return null;
}
