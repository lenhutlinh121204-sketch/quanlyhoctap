import React, { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Play, BrainCircuit, BookOpen,
  Trash2, Save, ArrowLeft, CheckCircle2, Award, Users,
  FileText, UploadCloud, Wand2, Key, Settings2
} from 'lucide-react';
import { db } from './firebase';
import catBookGif from './cat book GIF.gif';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Cấu hình PDF Worker dùng Vite import (không phụ thuộc CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

const DEFAULT_QUESTION = {
  questionText: '',
  options: ['', '', '', ''],
  correctIndex: 0
};

const WRONG_GIFS = [
  '/GIFT/cat_kitten.gif',
  '/GIFT/cat_stare.gif',
  '/GIFT/cockroach.gif',
  '/GIFT/horse_stare.gif',
  '/GIFT/instagram_horror.gif',
  '/GIFT/not_funny_smile.gif',
  '/GIFT/housewives_cat.gif'
];

export default function CommunityQuiz({ onClose, nickname, onActivityCreated, addXP, unlockBadge }) {
  const [view, setView] = useState('hub'); // 'hub', 'creator', 'player'
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showWrongOverlay, setShowWrongOverlay] = useState(false);
  const [wrongGif, setWrongGif] = useState('');
  const wrongTimeoutRef = React.useRef(null);

  // Preload Meme GIFs để hiển thị ngay lập tức khi sai
  useEffect(() => {
    WRONG_GIFS.forEach(gif => {
      const img = new Image();
      img.src = gif;
    });
  }, []);

  // Load quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'community_quizzes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = data.filter(quiz => quiz.isPublic !== false || quiz.author === nickname);
      setQuizzes(filtered);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu trắc nghiệm:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'hub') {
      fetchQuizzes();
    }
  }, [view]);

  // ==================== CREATOR VIEW ====================
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [questions, setQuestions] = useState([{ ...DEFAULT_QUESTION }]);
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null); // null = tạo mới, string = chỉnh sửa

  const openCreateNew = () => {
    setEditingQuizId(null);
    setCreateTitle('');
    setCreateDesc('');
    setQuestions([{ ...DEFAULT_QUESTION }]);
    setIsPublic(true);
    setView('creator');
  };

  const openEditQuiz = (quiz) => {
    setEditingQuizId(quiz.id);
    setCreateTitle(quiz.title);
    setCreateDesc(quiz.description || '');
    setQuestions(quiz.questions.map(q => ({ ...q, options: [...q.options] })));
    setIsPublic(quiz.isPublic !== false);
    setView('creator');
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { ...DEFAULT_QUESTION }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const handleSaveQuiz = async () => {
    if (!createTitle.trim()) return alert('Vui lòng nhập tên bộ câu hỏi!');
    if (questions.some(q => !q.questionText.trim() || q.options.some(o => !o.trim()))) {
      return alert('Vui lòng điền đầy đủ câu hỏi và 4 đáp án!');
    }
    setIsSaving(true);
    try {
      if (editingQuizId) {
        // CHỈNH SẬA
        await updateDoc(doc(db, 'community_quizzes', editingQuizId), {
          title: createTitle,
          description: createDesc,
          isPublic: isPublic,
          questions: questions,
          updatedAt: serverTimestamp(),
        });
        alert('Cập nhật bộ trắc nghiệm thành công!');
      } else {
        // TẠO MỚI
        await addDoc(collection(db, 'community_quizzes'), {
          title: createTitle,
          description: createDesc,
          author: nickname || 'Ẩn danh',
          plays: 0,
          isPublic: isPublic,
          createdAt: serverTimestamp(),
          questions: questions
        });
        alert('Tạo bộ trắc nghiệm thành công! Mọi người đã có thể xem.');
        if (onActivityCreated) {
          onActivityCreated('quiz_create', createTitle);
        }

        if (addXP) addXP(20);
        const createdCount = Number(localStorage.getItem('exam_master_created_quizzes_count') || 0) + 1;
        localStorage.setItem('exam_master_created_quizzes_count', createdCount);
        if (createdCount >= 3 && unlockBadge) {
          unlockBadge('Người kiến tạo');
        }
      }
      setView('hub');
      setCreateTitle('');
      setCreateDesc('');
      setQuestions([{ ...DEFAULT_QUESTION }]);
      setIsPublic(true);
      setEditingQuizId(null);
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      alert('LỖI FIREBASE:\n' + error.message);
    }
    setIsSaving(false);
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa bộ "“${quizTitle}”" không? Thao tác này không thể hoàn tác!`)) return;
    try {
      await deleteDoc(doc(db, 'community_quizzes', quizId));
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (error) {
      alert('Lỗi khi xóa: ' + error.message);
    }
  };

  // ==================== BULK IMPORT ====================
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleProcessImport = () => {
    if (!importText.trim()) return;

    const rawLines = importText.split('\n').map(l => l.trim());
    const newQs = [];
    let curQ = null;
    let currentTopic = '';
    let introText = [];
    let titleDetected = '';

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];
      if (!line) continue;

      // Nhận diện Tiêu đề / Chủ đề (chứa dấu # hoặc bắt đầu bằng PHẦN, CHỦ ĐỀ, CHƯƠNG)
      const isHeader = line.startsWith('#') || line.toUpperCase().startsWith('PHẦN') || line.toUpperCase().startsWith('CHỦ ĐỀ') || line.toUpperCase().startsWith('CHƯƠNG');
      
      // Xóa tất cả dấu * và # để làm sạch chuỗi
      let cleanLine = line.replace(/[\*\#]/g, '').trim();
      if (!cleanLine) continue;

      if (isHeader) {
        currentTopic = cleanLine;
        if (!titleDetected) {
          titleDetected = cleanLine;
        }
        continue;
      }

      // Nhận diện Lựa chọn (A, B, C, D)
      const optMatch = cleanLine.match(/^([A-D])[\.\:\)\-\s]+\s*(.+)/i);
      
      // Nhận diện Đáp án đúng
      const ansMatch = cleanLine.match(/^(?:Đáp\s*án|ĐA|Answer|Key)[\:\-\s]*([A-D])/i);

      if (ansMatch) {
        if (curQ) {
          curQ.correctIndex = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
        }
      } else if (optMatch) {
        if (curQ) {
          const idx = optMatch[1].toUpperCase().charCodeAt(0) - 65;
          if (idx >= 0 && idx < 4) {
            curQ.options[idx] = optMatch[2].trim();
          }
        }
      } else {
        // Dòng này là Câu hỏi hoặc Intro
        const isQuestionStart = cleanLine.match(/^(?:Câu\s*\d+|\d+)[\.\:\-\s]+/i);
        
        if (isQuestionStart) {
          if (curQ) {
            newQs.push(curQ);
          }
          
          let qText = cleanLine;
          if (currentTopic) {
            qText = `[${currentTopic}] ${cleanLine}`;
          }
          
          curQ = { 
            questionText: qText, 
            options: ['', '', '', ''], 
            correctIndex: 0 
          };
        } else {
          if (!curQ) {
            introText.push(cleanLine);
          } else {
            curQ.questionText += '\n' + cleanLine;
          }
        }
      }
    }
    
    if (curQ) {
      newQs.push(curQ);
    }

    if (newQs.length > 0) {
      // Tự động cập nhật mô tả và tiêu đề nếu còn trống
      if (introText.length > 0 && !createDesc) {
        setCreateDesc(introText.join('\n'));
      }
      if (titleDetected && !createTitle) {
        setCreateTitle(titleDetected);
      } else if (!createTitle) {
        setCreateTitle('Bộ trắc nghiệm nhập nhanh');
      }

      if (questions.length === 1 && !questions[0].questionText) {
        setQuestions(newQs);
      } else {
        setQuestions([...questions, ...newQs]);
      }

      setShowImport(false);
      setImportText('');
      alert(`🎉 Đã nhận diện thành công ${newQs.length} câu hỏi! Tự động phát hiện Tiêu đề/Chủ đề và nội dung giới thiệu.`);
    } else {
      alert('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra lại định dạng!');
    }
  };

  // ==================== AI GENERATOR ====================
  const [showAI, setShowAI] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiCount, setAiCount] = useState(10);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiKey, setAiKey] = useState(localStorage.getItem('apifree_api_key') || 'sk-pXHdrH3bQhbDsxJdah7yW9se2xYcf');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isReadingFile, setIsReadingFile] = useState(false);

  // Đọc file PDF
  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  // Đọc file DOCX
  const extractTextFromDOCX = async (arrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // Đọc file PPTX (là file ZIP chứa XML)
  const extractTextFromPPTX = async (arrayBuffer) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    let fullText = '';
    const slideFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort();
    for (const filename of slideFiles) {
      const xml = await zip.files[filename].async('string');
      // Lấy text từ thẻ <a:t> trong XML
      const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      const slideText = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
      fullText += slideText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsReadingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ext = file.name.split('.').pop().toLowerCase();
      let text = '';
      if (ext === 'pdf') {
        text = await extractTextFromPDF(arrayBuffer);
      } else if (ext === 'docx') {
        text = await extractTextFromDOCX(arrayBuffer);
      } else if (ext === 'pptx' || ext === 'ppt') {
        text = await extractTextFromPPTX(arrayBuffer);
      } else {
        text = new TextDecoder().decode(arrayBuffer);
      }
      setAiText(text);
    } catch (err) {
      alert('Không đọc được file: ' + err.message);
    }
    setIsReadingFile(false);
  };

  const handleGenerateAI = async () => {
    if (!aiKey.trim()) return alert('Vui lòng nhập API Key!');
    if (!aiText.trim()) return alert('Vui lòng cung cấp văn bản nguồn!');
    
    localStorage.setItem('apifree_api_key', aiKey);
    setIsGenerating(true);

    // Giới hạn văn bản tối đa 15000 ký tự
    const MAX_CHARS = 15000;
    const truncatedText = aiText.length > MAX_CHARS
      ? aiText.slice(0, MAX_CHARS) + '\n[... Văn bản đã bị rút gọn ...]'
      : aiText;

    const promptText = `Bạn là một hệ thống tạo câu hỏi trắc nghiệm tự động cực kỳ chính xác.
Dựa vào ĐÚNG nội dung được cung cấp bên dưới, hãy tạo ra ${aiCount} câu hỏi trắc nghiệm.
${aiPrompt ? `Yêu cầu thêm: ${aiPrompt}\n` : ''}
LUẬT LỆ:
1. TUYỆT ĐỐI CHỈ DÙNG THÔNG TIN TỪ VĂN BẢN ĐƯỢC CUNG CẤP. KHÔNG dùng kiến thức ngoài.
2. Trả về KHÔNG GÌ NGOÀI một mảng JSON hợp lệ. KHÔNG có markdown, KHÔNG có text khác.
3. Mỗi phần tử JSON có dạng:
{"questionText":"...","options":["Đáp án 1","Đáp án 2","Đáp án 3","Đáp án 4"],"correctIndex": X}
(Trong đó X là 0, 1, 2 hoặc 3 tương ứng với vị trí đáp án đúng. Hãy xếp vị trí đáp án đúng ngẫu nhiên giữa các câu).

NỘI DUNG:
${truncatedText}`;

    try {
      let rawText = '';
      const url = 'https://api.apifree.ai/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-5.5',
          messages: [{ role: 'user', content: promptText }],
          max_tokens: 16000,
          stream: false
        })
      });
      const rawResponse = await response.text();
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (err) {
        throw new Error('Lỗi từ máy chủ API: ' + rawResponse.slice(0, 100));
      }
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Phản hồi API không hợp lệ: ' + rawResponse.slice(0, 100));
      }
      rawText = data.choices[0].message.content;

      rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        rawText = arrayMatch[0];
      }
      
      let parsedQs;
      try {
        parsedQs = JSON.parse(rawText);
      } catch (err) {
        console.error('Lỗi parse JSON:', rawText);
        throw new Error('AI trả về dữ liệu không hoàn chỉnh hoặc quá dài. Vui lòng giảm số lượng câu hỏi và thử lại.');
      }
      if (!Array.isArray(parsedQs) || parsedQs.length === 0) throw new Error('Dữ liệu trả về không đúng cấu trúc mảng JSON.');

      // Đảo lộn ngẫu nhiên thứ tự các đáp án trong mỗi câu hỏi
      parsedQs.forEach(q => {
        if (!Array.isArray(q.options)) return;
        let opts = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctIndex }));
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        q.options = opts.map(o => o.text);
        q.correctIndex = opts.findIndex(o => o.isCorrect);
      });

      if (questions.length === 1 && !questions[0].questionText) {
        setQuestions(parsedQs);
      } else {
        setQuestions([...questions, ...parsedQs]);
      }
      setShowAI(false);
      setAiText('');
      alert(`🎉 Đã tạo thành công ${parsedQs.length} câu hỏi bằng AI!`);
    } catch (error) {
      console.error(error);
      const msg = error.message || '';
      if (msg.toLowerCase().includes('quota') || msg.includes('429') || msg.includes('rate') || msg.includes('limit: 0')) {
        alert('⚠️ Vượt giới hạn API miễn phí!\n\n✅ Cách khắc phục:\n1. Đợi 1-2 phút rồi thử lại.\n2. Giảm số câu xuống (3-5 câu).\n3. Thử model khác.\n4. Quota reset hàng ngày.');
      } else if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('Unauthorized') || msg.includes('401')) {
        alert('❌ API Key không hợp lệ! Vui lòng kiểm tra lại key.');
      } else {
        alert('LỖI KHI TẠO CÂU HỎI:\n' + msg);
      }
    }
    setIsGenerating(false);
  };

  // ==================== PLAYER VIEW ====================
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);

  // States cho bảng xếp hạng (Leaderboard)
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardQuiz, setLeaderboardQuiz] = useState(null);
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const startQuiz = (quiz) => {
    // Sao chép sâu và xáo trộn ngẫu nhiên các lựa chọn đáp án (A, B, C, D) của từng câu hỏi
    const questionsCloned = quiz.questions ? quiz.questions.map(q => {
      const originalOptions = [...q.options];
      const correctText = originalOptions[q.correctIndex] || '';
      
      // Fisher-Yates trộn các đáp án ngẫu nhiên
      const shuffledOptions = [...originalOptions];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      // Định vị lại chỉ số của đáp án đúng trong mảng đã trộn
      const newCorrectIndex = shuffledOptions.indexOf(correctText);
      
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : q.correctIndex
      };
    }) : [];
    
    // Thuật toán Fisher-Yates trộn câu hỏi ngẫu nhiên mỗi lần chơi
    for (let i = questionsCloned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionsCloned[i], questionsCloned[j]] = [questionsCloned[j], questionsCloned[i]];
    }

    setActiveQuiz({
      ...quiz,
      questions: questionsCloned
    });
    
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setUserAnswers({});
    setShowHint(false);
    setView('player');
  };

  const handleAnswer = (optIndex) => {
    if (userAnswers[currentQ] !== undefined) return; // Đã trả lời
    
    const updatedAnswers = { ...userAnswers, [currentQ]: optIndex };
    setUserAnswers(updatedAnswers);
    
    const isCorrect = optIndex === activeQuiz.questions[currentQ].correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      if (addXP) addXP(10);
    } else {
      const randomGif = WRONG_GIFS[Math.floor(Math.random() * WRONG_GIFS.length)];
      setWrongGif(randomGif);
      setShowWrongOverlay(true);
      
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = setTimeout(() => {
        setShowWrongOverlay(false);
      }, 30000); // Tự động ẩn sau 30 giây
    }
  };

  const handleCompleteQuiz = async () => {
    setShowResult(true);
    
    // 1. Tăng lượt làm (plays) của đề trắc nghiệm này lên 1
    try {
      await updateDoc(doc(db, 'community_quizzes', activeQuiz.id), {
        plays: (activeQuiz.plays || 0) + 1
      });
      // Cập nhật local state quizzes để hiển thị ngay lập tức
      setQuizzes(prev => prev.map(q => q.id === activeQuiz.id ? { ...q, plays: (q.plays || 0) + 1 } : q));
    } catch (error) {
      console.error("Lỗi cập nhật lượt chơi:", error);
    }

    // 2. Lưu điểm của người dùng vào collection `community_quiz_scores` để xếp hạng
    try {
      await addDoc(collection(db, 'community_quiz_scores'), {
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        nickname: nickname || 'Ẩn danh',
        score: score,
        totalQuestions: activeQuiz.questions.length,
        percentage: Math.round((score / activeQuiz.questions.length) * 100),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Lỗi lưu điểm bảng xếp hạng:", error);
    }
  };

  const fetchLeaderboard = async (quiz) => {
    setLoadingLeaderboard(true);
    setLeaderboardQuiz(quiz);
    setShowLeaderboard(true);
    try {
      const snapshot = await getDocs(collection(db, 'community_quiz_scores'));
      const allScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allScores
        .filter(s => s.quizId === quiz.id)
        .sort((a, b) => {
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage;
          }
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 10);
      setLeaderboardScores(filtered);
    } catch (error) {
      console.error("Lỗi lấy bảng xếp hạng:", error);
    }
    setLoadingLeaderboard(false);
  };

  const generateSmartHint = (qText) => {
    if (!qText) return '';
    const words = qText.split(/\s+/);
    const medicalTerms = words.filter(w => {
      const cleanWord = w.replace(/[^a-zA-ZÀ-ỹ]/g, '');
      return cleanWord.length > 3 && /[A-ZÀ-Ỹ]/.test(cleanWord);
    }).map(w => w.replace(/[^a-zA-ZÀ-ỹ]/g, ''));

    const uniqueTerms = [...new Set(medicalTerms)].filter(t => t.length > 2).slice(0, 3);
    
    if (uniqueTerms.length > 0) {
      return `Hãy chú ý đến thuật ngữ khoa học "${uniqueTerms.join(', ')}" trong câu hỏi. Hãy liên hệ với chức năng sinh hóa hoặc vai trò lâm sàng của chúng để đưa ra lập luận chính xác nhất.`;
    }
    return `Đọc kỹ câu hỏi và các phương án trả lời. Hãy loại trừ các đáp án quá cường điệu, quá chung chung hoặc không có cơ sở khoa học để tìm ra câu trả lời chuẩn xác.`;
  };

  // ==================== RENDERS ====================
  const activeQuestion = activeQuiz?.questions?.[currentQ];
  const rawQText = activeQuestion?.questionText || '';
  let displayTopic = activeQuestion?.topic || '';
  let cleanQuestionText = rawQText;

  if (rawQText) {
    const topicMatch = rawQText.match(/^\[(.*?)\]\s*(.*)/s);
    if (topicMatch) {
      displayTopic = topicMatch[1];
      cleanQuestionText = topicMatch[2];
    }
    // Loại bỏ "Câu X:" hoặc "Câu X." hoặc con số đầu dòng để tránh lặp lại
    cleanQuestionText = cleanQuestionText.replace(/^(?:Câu\s*\d+|\d+)[\.\:\-\s]+\s*/i, '');
    // Loại bỏ dấu gạch ngang thừa ở cuối câu
    cleanQuestionText = cleanQuestionText.trim().replace(/\s*[-—~_]+$/, '');
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* HEADER TỔNG */}
      {view !== 'player' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-lg relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl leading-tight">Trắc Nghiệm Cộng Đồng</h2>
              <p className="text-emerald-100 text-xs">Cùng làm bài và chia sẻ kiến thức</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* ==================== 1. HUB VIEW ==================== */}
        {view === 'hub' && (
          <div className="max-w-5xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bộ câu hỏi..."
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium shadow-sm transition-all"
                />
              </div>
              <button 
                onClick={openCreateNew}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" /> Soạn Đề Mới
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <img src={catBookGif} alt="Mèo đọc sách" className="w-40 h-40 object-cover rounded-2xl mx-auto mb-6 shadow-md" />
                <h3 className="text-xl font-bold text-slate-700">Chưa có bài trắc nghiệm nào</h3>
                <p className="text-slate-500 mt-2">Hãy là người đầu tiên tạo ra một bộ câu hỏi nhé!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group flex flex-col">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-3">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {quiz.questions?.length || 0} câu
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Users className="w-3 h-3" /> {quiz.plays || 0} lượt chơi
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{quiz.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{quiz.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-1.5 max-w-[100px] sm:max-w-xs">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {quiz.author?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate">{quiz.author}</span>
                        {quiz.author === nickname && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold hidden sm:inline shrink-0">Tôi</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {quiz.author === nickname && (
                          <>
                            <button
                              onClick={() => openEditQuiz(quiz)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shrink-0"
                              title="Chỉnh sửa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => fetchLeaderboard(quiz)}
                          className="flex items-center gap-0.5 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition-all text-[11px] shrink-0"
                          title="Bảng xếp hạng"
                        >
                          <Award className="w-3 h-3" /> BXH
                        </button>
                        <button 
                          onClick={() => startQuiz(quiz)}
                          className="flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition-all text-[11px] shrink-0"
                        >
                          <Play className="w-3 h-3" /> Chơi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 2. CREATOR VIEW ==================== */}
        {view === 'creator' && (
          <div className="max-w-4xl mx-auto p-6 pb-24">
            <button onClick={() => { setEditingQuizId(null); setView('hub'); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Quay lại Thư viện
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                {editingQuizId ? '✉️ Chỉnh Sửa Bộ Trắc Nghiệm' : 'Tạo Bộ Trắc Nghiệm Mới'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên bộ trắc nghiệm *</label>
                  <input 
                    type="text" value={createTitle} onChange={e => setCreateTitle(e.target.value)}
                    placeholder="VD: Ôn thi Lịch Sử 12 - Bài 1"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả ngắn (tuỳ chọn)</label>
                  <textarea 
                    value={createDesc} onChange={e => setCreateDesc(e.target.value)}
                    placeholder="VD: Làm nhanh trước giờ kiểm tra 15 phút..."
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                  <button 
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
                  </button>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">Công khai bộ câu hỏi</p>
                    <p className="text-xs text-slate-500">Nếu tắt, chỉ mình bạn có thể thấy bộ câu hỏi này trong thư viện.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative group">
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleRemoveQuestion(qIndex)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-lg font-bold text-slate-700">Câu hỏi</h4>
                  </div>

                  <input 
                    type="text" value={q.questionText} onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800 mb-6"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${q.correctIndex === oIndex ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                        <button 
                          onClick={() => handleQuestionChange(qIndex, 'correctIndex', oIndex)}
                          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-colors ${q.correctIndex === oIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}
                        >
                          {q.correctIndex === oIndex && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <input 
                          type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Đáp án ${['A', 'B', 'C', 'D'][oIndex]}`}
                          className="w-full bg-transparent outline-none font-medium text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={handleAddQuestion}
                  className="flex-1 md:flex-none px-6 py-4 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" /> Thêm 1 Câu
                </button>
                <button 
                  onClick={() => setShowImport(true)}
                  className="flex-1 md:flex-none px-6 py-4 bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 hover:text-indigo-600 text-indigo-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-5 h-5" /> Dán Văn Bản
                </button>
                <button 
                  onClick={() => setShowAI(true)}
                  className="flex-1 md:flex-none px-6 py-4 bg-fuchsia-50 border-2 border-fuchsia-100 hover:border-fuchsia-500 hover:text-fuchsia-600 text-fuchsia-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Wand2 className="w-5 h-5" /> Tạo bằng AI
                </button>
              </div>
              
              <button 
                onClick={handleSaveQuiz} disabled={isSaving}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:-translate-y-1 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
                Đăng Tải Lên Cộng Đồng
              </button>
            </div>
          </div>
        )}

        {/* ==================== 3. PLAYER VIEW ==================== */}
        {view === 'player' && activeQuiz && (
          <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-hidden min-h-full">
            {/* Header kiểu NotebookLM */}
            <div className="w-full bg-white border-b border-slate-100 px-6 md:px-8 py-5 flex justify-between items-center shrink-0 shadow-sm">
              <div className="flex flex-col">
                <h2 className="font-bold text-xl md:text-2xl text-slate-800 tracking-tight">{activeQuiz.title}</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Dựa trên tài liệu kiểm tra • Soạn bởi {activeQuiz.author || 'Ẩn danh'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all" title="Lựa chọn khác">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
                <button className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all" title="Toàn màn hình">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                </button>
                <button 
                  onClick={() => setView('hub')} 
                  className="p-2 md:p-2.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all ml-1 border border-slate-100 hover:border-red-100"
                  title="Thoát"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!showResult ? (
              <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-8 flex flex-col justify-between overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto w-full">
                  
                  {/* CỘT TRÁI: CÂU HỎI (5/12 CỘT) */}
                  <div className="lg:col-span-5 flex flex-col space-y-6">
                    {/* Tiến trình làm bài */}
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-400">
                        {currentQ + 1} / {activeQuiz.questions.length}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors" title="Chỉnh sửa câu hỏi (Trang trí)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                    </div>

                    {/* Nội dung câu hỏi */}
                    <h3 key={`question-${currentQ}`} className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed font-sans select-text">
                      {cleanQuestionText.split(" ").map((word, wIdx) => {
                        const cleanWord = word.replace(/[^a-zA-ZÀ-ỹ]/g, '');
                        const isScientificTerm = ['Creatinin', 'Glucose', 'Ure', 'AST', 'ALT', 'GGT', 'Bilirubin', 'Protein', 'Albumin', 'Lipase', 'Amylase', 'Troponin', 'CRP', 'ASLO', 'Suy'].some(term => cleanWord.toLowerCase() === term.toLowerCase());
                        
                        return isScientificTerm ? (
                          <span key={wIdx} className="italic text-slate-900 font-semibold">{word} </span>
                        ) : (
                          <span key={wIdx}>{word} </span>
                        );
                      })}
                    </h3>
                  </div>

                  {/* CỘT PHẢI: CÁC LỰA CHỌN TRẢ LỜI (7/12 CỘT) */}
                  <div className="lg:col-span-7 flex flex-col space-y-4 w-full">
                    {activeQuiz.questions[currentQ].options.map((opt, idx) => {
                      const isCorrect = idx === activeQuiz.questions[currentQ].correctIndex;
                      const hasAnswered = userAnswers[currentQ] !== undefined;
                      const isSelected = userAnswers[currentQ] === idx;
                      
                      let cardStyle = "w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 shadow-sm select-none cursor-pointer ";
                      
                      if (!hasAnswered) {
                        cardStyle += "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 text-slate-700 active:scale-[0.99]";
                      } else if (isCorrect) {
                        cardStyle += "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-emerald-50";
                      } else if (isSelected && !isCorrect) {
                        cardStyle += "bg-red-50 border-red-500 text-red-950 font-semibold shadow-red-50";
                      } else {
                        cardStyle += "bg-slate-50 border-slate-100 text-slate-400 opacity-60 pointer-events-none";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasAnswered}
                          onClick={() => handleAnswer(idx)}
                          className={cardStyle}
                        >
                          <span className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm ${
                            !hasAnswered 
                              ? 'bg-slate-100 text-slate-500' 
                              : isCorrect 
                                ? 'bg-emerald-600 text-white' 
                                : isSelected 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-slate-200 text-slate-400'
                          }`}>
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          
                          <span className="text-base leading-snug flex-1 font-medium pt-0.5">
                            {opt.split(" ").map((word, wIdx) => {
                              const cleanWord = word.replace(/[^a-zA-ZÀ-ỹ]/g, '');
                              const isScientificTerm = ['Creatinin', 'Glucose', 'Ure', 'AST', 'ALT', 'GGT', 'Bilirubin', 'Protein', 'Albumin', 'Lipase', 'Amylase', 'Troponin', 'CRP', 'ASLO', 'Suy'].some(term => cleanWord.toLowerCase() === term.toLowerCase());
                              return isScientificTerm ? (
                                <span key={wIdx} className="italic font-semibold text-slate-900">{word} </span>
                              ) : (
                                <span key={wIdx}>{word} </span>
                              );
                            })}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* KHU VỰC ĐIỀU HƯỚNG & GỢI Ý */}
                <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col space-y-4">
                  <div className="flex justify-between items-center w-full">
                    {/* Bên trái: Gợi ý dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowHint(!showHint)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <span>Gợi ý</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`w-4 h-4 transition-transform duration-200 ${showHint ? 'rotate-180' : ''}`} 
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>
                    </div>

                    {/* Bên phải: Nút Trước & Tiếp theo */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (currentQ > 0) {
                            setCurrentQ(currentQ - 1);
                            setShowHint(false);
                          }
                        }}
                        disabled={currentQ === 0}
                        className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-2.5 rounded-full text-sm shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => {
                          if (currentQ < activeQuiz.questions.length - 1) {
                            setCurrentQ(currentQ + 1);
                            setShowHint(false);
                          } else {
                            handleCompleteQuiz();
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md shadow-blue-200 transition-all hover:shadow-lg"
                      >
                        {currentQ === activeQuiz.questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                      </button>
                    </div>
                  </div>

                  {/* Ngăn kéo hiển thị Gợi ý */}
                  {showHint && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-900 leading-relaxed animate-in slide-in-from-top-4 duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="p-1 bg-blue-100 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                        </span>
                        <span className="font-bold text-blue-950 text-sm">Gợi ý học tập tự động</span>
                      </div>
                      <p>{generateSmartHint(activeQuiz.questions[currentQ].questionText)}</p>
                    </div>
                  )}
                </div>

                {/* THANH PHẢN HỒI VÀ THÔNG BÁO Ở CHÂN TRANG */}
                <div className="border-t border-slate-100 mt-10 pt-5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-full text-xs font-semibold shadow-sm transition-all" title="Nội dung hữu ích">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3l4-7.12A1.94 1.94 0 0 1 15 5.88z"/></svg>
                      <span>Nội dung hữu ích</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-full text-xs font-semibold shadow-sm transition-all" title="Nội dung không hữu ích">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-4 7.12M9 18.12A1.94 1.94 0 0 1 9 18.12z"/></svg>
                      <span>Nội dung không hữu ích</span>
                    </button>
                  </div>
                  
                  <span className="text-[11px] text-slate-400 font-medium text-center md:text-right">
                    Exam Master có thể đưa ra câu hỏi từ nguồn tài liệu học tập của bạn. Hãy luôn đối chiếu với kiến thức chuẩn khoa học.
                  </span>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 animate-in zoom-in duration-500 overflow-y-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-500 rounded-full flex items-center justify-center shadow-xl mb-6 shadow-orange-200">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Tuyệt vời!</h2>
                <p className="text-sm font-semibold text-slate-500 mb-8 text-center">Bạn đã xuất sắc hoàn thành bộ trắc nghiệm kiểm tra này.</p>
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 w-full max-w-sm mb-8 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ĐIỂM CỦA BẠN</p>
                  <p className="text-5xl font-black text-emerald-600">
                    {score}<span className="text-2xl text-slate-300">/{activeQuiz.questions.length}</span>
                  </p>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${(score / activeQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => startQuiz(activeQuiz)} className="px-6 py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-colors text-sm shadow-sm">
                    Làm lại
                  </button>
                  <button onClick={() => setView('hub')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm">
                    Về Thư viện
                  </button>
                </div>
              </div>
            )}

            {showWrongOverlay && wrongGif && (
              <div 
                onClick={() => {
                  setShowWrongOverlay(false);
                  if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
                }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-red-100 flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
                >
                  <span className="text-red-500 font-extrabold text-xl mb-2 flex items-center gap-2">
                    <span>❌ Sai rồi nha!</span>
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
        )}

        {/* ==================== IMPORT MODAL ==================== */}
        {showImport && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <UploadCloud className="w-6 h-6 text-indigo-600" />
                  Nhập nhanh từ văn bản
                </h3>
                <button onClick={() => setShowImport(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 mb-4 text-sm text-slate-600 font-medium">
                <p className="mb-2">Hãy copy và dán đề thi của bạn vào đây. Hệ thống sẽ tự động nhận diện!</p>
                <p className="font-bold text-slate-700">Cấu trúc mẫu:</p>
                <pre className="bg-white p-3 rounded-xl mt-2 border border-slate-200 text-xs text-slate-500 font-mono">
                  Câu 1: Thủ đô của Việt Nam là gì?{'\n'}
                  A. Hà Nội{'\n'}
                  B. TP.HCM{'\n'}
                  C. Đà Nẵng{'\n'}
                  D. Huế{'\n'}
                  Đáp án: A
                </pre>
              </div>

              <textarea 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Dán văn bản đề thi của bạn vào đây..."
                className="w-full h-64 p-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 resize-none mb-4"
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowImport(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Hủy</button>
                <button onClick={handleProcessImport} className="px-6 py-3 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition">Nhận diện câu hỏi</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== AI MODAL ==================== */}
        {showAI && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
            {/* Vỏ bìa cuốn sổ (Notebook cover) */}
            <div className="bg-[#4c3c30] p-4 rounded-[36px] shadow-2xl w-full max-w-4xl relative border-4 border-[#3a2e24] animate-in zoom-in-95 duration-200">
              
              {/* Trang sách mở đôi (Double Page Layout) */}
              <div className="bg-[#fcfbf7] rounded-[24px] overflow-hidden flex flex-col md:grid md:grid-cols-2 relative min-h-[560px] shadow-inner border border-[#dcd9ce]">
                
                {/* TRANG BÊN TRÁI (LEFT PAGE) - Tài liệu & File */}
                <div className="p-8 pb-10 border-b md:border-b-0 md:border-r border-[#d4d0c1]/50 relative flex flex-col">
                  {/* Lỗ đục giấy bên phải trang trái */}
                  <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-4 flex-col justify-around py-8 z-20 pointer-events-none gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-[#4c3c30] rounded-full -mr-1.5 shadow-inner"></div>
                    ))}
                  </div>

                  {/* Ribbon trang trí */}
                  <div className="absolute top-0 left-8 w-12 h-14 bg-[#5c4a3c] rounded-b-xl shadow-md z-10 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                    AI
                  </div>

                  {/* Header Trang Trái */}
                  <div className="pl-16 mb-6">
                    <h3 className="text-2xl font-black text-[#5c4a3c] flex items-center gap-2">
                      <Wand2 className="w-6 h-6 text-fuchsia-600 animate-pulse" />
                      AI Tự Động Tạo
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nguồn tài liệu học</p>
                  </div>

                  {/* Dòng kẻ dọc của vở (Lề đỏ) */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-200 pointer-events-none"></div>

                  {/* Content Trang Trái */}
                  <div className="space-y-5 flex-1 relative pl-4 z-10">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-[#5c4a3c] mb-2.5">
                        <FileText className="w-4.5 h-4.5 text-fuchsia-500" /> 1. Nội dung nguồn (Bắt buộc)
                      </label>
                      
                      <div className="bg-slate-50/50 p-4 rounded-2xl border-2 border-dashed border-[#dcd9ce] mb-3 flex flex-col gap-2.5 hover:bg-slate-100/50 transition-colors">
                        <input 
                          type="file" 
                          accept=".txt,.pdf,.docx,.pptx,.ppt"
                          onChange={handleFileUpload}
                          disabled={isReadingFile}
                          id="notebook-file-upload"
                          className="hidden"
                        />
                        <label 
                          htmlFor="notebook-file-upload"
                          className="flex items-center justify-center gap-2 bg-[#5c4a3c] hover:bg-[#4a3a2e] text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-sm text-xs transition-colors active:scale-95 disabled:opacity-50"
                        >
                          <UploadCloud className="w-4 h-4" />
                          {isReadingFile ? 'Đang đọc tệp...' : 'Chọn tệp từ máy'}
                        </label>
                        <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-wider">Hỗ trợ: .pdf, .docx, .pptx, .txt</p>
                      </div>

                      {/* Textarea giả trang vở */}
                      <div className="relative rounded-2xl border-2 border-[#d4d0c1] overflow-hidden shadow-inner bg-white">
                        {/* Các dòng kẻ ngang giả trang giấy */}
                        <div className="absolute inset-0 bg-white pointer-events-none opacity-50"
                          style={{
                            backgroundImage: 'linear-gradient(#f1efe6 1px, transparent 1px)',
                            backgroundSize: '100% 24px',
                          }}
                        />
                        <textarea 
                          value={aiText}
                          onChange={(e) => setAiText(e.target.value)}
                          placeholder="Nhập hoặc dán nội dung văn bản giáo khoa, ghi chép lớp học vào đây..."
                          className="w-full h-56 p-4 bg-transparent outline-none font-medium text-[#5c4a3c] text-sm relative z-10 resize-none leading-6 placeholder-[#b6b19e]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* GÁY LÒ XO XOẮN Ở CHÍNH GIỮA (SPIRAL BINDER) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-6 flex-col justify-around py-8 z-30 pointer-events-none gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-center">
                      <div className="w-8 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full shadow-md border border-slate-400/40"></div>
                    </div>
                  ))}
                </div>

                {/* TRANG BÊN PHẢI (RIGHT PAGE) - Cấu hình & Tạo đề */}
                <div className="p-8 pb-10 relative flex flex-col bg-[#fcfbf7]">
                  {/* Lỗ đục giấy bên trái trang phải */}
                  <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-4 flex-col justify-around py-8 z-20 pointer-events-none gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-[#4c3c30] rounded-full -ml-1.5 shadow-inner"></div>
                    ))}
                  </div>

                  {/* Nút đóng góc sổ tay */}
                  <button 
                    onClick={() => !isGenerating && setShowAI(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition text-[#5c4a3c]/60 hover:text-[#5c4a3c] z-20"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-[#5c4a3c]">Cấu Hình Đề</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cá nhân hóa bằng AI</p>
                  </div>

                  {/* Dòng kẻ dọc lề phải */}
                  <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-red-200 pointer-events-none"></div>

                  <div className="space-y-6 flex-1 pr-4 pl-2 z-10">
                    {/* Cài đặt tạo đề */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-[#5c4a3c] mb-2.5">
                        <Settings2 className="w-4.5 h-4.5 text-fuchsia-500" /> 2. Cài đặt tạo đề
                      </label>
                      <div className="flex items-center gap-3 mb-4 bg-slate-50/50 p-3 rounded-2xl border-2 border-[#dcd9ce]">
                        <span className="text-xs font-bold text-[#5c4a3c] uppercase tracking-wider">Số lượng câu:</span>
                        <input 
                          type="number" min="1" max="50" value={aiCount} onChange={e => setAiCount(e.target.value)}
                          className="w-16 p-2 bg-white border-2 border-[#d4d0c1] rounded-xl text-center font-black outline-none focus:border-fuchsia-500 text-sm text-[#5c4a3c]"
                        />
                      </div>
                      <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Yêu cầu cụ thể cho đề (Ví dụ: Tập trung vào các chỉ số gan, câu hỏi phân tích lâm sàng khó...)"
                        className="w-full h-24 p-3.5 bg-white border-2 border-[#d4d0c1] rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none font-medium text-slate-700 text-sm resize-none"
                      />
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-[#5c4a3c] mb-2.5">
                        <Key className="w-4.5 h-4.5 text-fuchsia-500" /> 3. API Key (APIFree)
                      </label>
                      <input 
                        type="password" value={aiKey} onChange={e => setAiKey(e.target.value)}
                        placeholder="Nhập API Key..."
                        className="w-full p-3.5 bg-white border-2 border-[#d4d0c1] rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none font-medium text-slate-700 text-sm"
                      />
                      <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider flex justify-between">
                        <span>Model: openai/gpt-5.5</span>
                        <span className="text-fuchsia-500">Auto-save Key</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Trang Phải (Các Nút Bấm) */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-[#d4d0c1]/50 mt-6 z-10">
                    <button 
                      onClick={() => !isGenerating && setShowAI(false)} 
                      className="px-5 py-3 font-extrabold text-slate-500 hover:bg-slate-100 rounded-2xl transition text-sm active:scale-95"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleGenerateAI} disabled={isGenerating}
                      className="px-6 py-3 font-black bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:shadow-lg text-white rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm active:scale-95 shadow-md"
                    >
                      {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Wand2 className="w-4 h-4" />}
                      {isGenerating ? 'Đang phân tích...' : 'Bắt đầu tạo'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
         {/* ==================== LEADERBOARD MODAL ==================== */}
        {showLeaderboard && leaderboardQuiz && (
          <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Bảng Xếp Hạng</h3>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-1">{leaderboardQuiz.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowLeaderboard(false); setLeaderboardQuiz(null); }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {loadingLeaderboard ? (
                  <div className="flex flex-col justify-center items-center py-20 gap-3">
                    <div className="animate-spin w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm font-semibold text-slate-500">Đang tải bảng xếp hạng...</span>
                  </div>
                ) : leaderboardScores.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                      <Award className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-700">Chưa có lượt xếp hạng nào</h4>
                    <p className="text-xs text-slate-400 mt-1">Hãy là người đầu tiên chinh phục đỉnh cao điểm số!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {leaderboardScores.map((entry, idx) => {
                      const bgMedal = idx === 0 ? 'bg-yellow-100 text-yellow-700 font-bold' : idx === 1 ? 'bg-slate-100 text-slate-700 font-bold' : idx === 2 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-50 text-slate-500 font-semibold';
                      
                      return (
                        <div 
                          key={entry.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            entry.nickname === nickname 
                              ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm ${bgMedal}`}>
                              {idx + 1}
                            </span>
                            
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                {entry.nickname}
                                {entry.nickname === nickname && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Bạn</span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-slate-800">{entry.score}</span>
                            <span className="text-xs text-slate-400 font-semibold">/{entry.totalQuestions} câu</span>
                            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                              Tỉ lệ: {entry.percentage}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => { setShowLeaderboard(false); setLeaderboardQuiz(null); }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors"
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
