import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, Trash2, Calendar, BookOpen, 
  Clock, Plus, BarChart3, Target, Award, BookMarked,
  Play, Pause, RotateCcw, Coffee, BrainCircuit, Sparkles, 
  Settings, Music, Bell, ListTree, CornerDownRight, Send,
  Users, MessageCircle, LogOut, Edit2, Check, X
} from 'lucide-react';
import io from 'socket.io-client';
import { db } from './firebase';
import {
  collection, addDoc, query, where, onSnapshot, updateDoc, doc,
  serverTimestamp, orderBy, limit, getDocs, deleteDoc
} from 'firebase/firestore';

export default function App() {
  // --- ANIMAL NICKNAMES ---
  const ANIMAL_EMOJIS = {
    '🐶 Chó': '🐶',
    '🐱 Mèo': '🐱',
    '🐻 Gấu': '🐻',
    '🐼 Gấu Trúc': '🐼',
    '🐨 Koala': '🐨',
    '🐯 Hổ': '🐯',
    '🦁 Sư tử': '🦁',
    '🐮 Bò': '🐮',
    '🐷 Lợn': '🐷',
    '🐸 Ếch': '🐸',
    '🐵 Khỉ': '🐵',
    '🦊 Cáo': '🦊',
    '🐰 Thỏ': '🐰',
    '🦄 Kỳ lân': '🦄',
    '🐝 Ong': '🐝',
    '🦋 Bướm': '🦋',
    '🐢 Rùa': '🐢',
    '🐍 Rắn': '🐍',
    '🦅 Đại bàng': '🦅',
    '🐬 Cá heo': '🐬',
  };

  const ANIMAL_NAMES = Object.keys(ANIMAL_EMOJIS);
  const DEFAULT_ANIMAL = ANIMAL_NAMES[0] || '🐶 Chó';

  // --- DỮ LIỆU KHỞI TẠO MẶC ĐỊNH ---
  const DEFAULT_TASKS = [
    { 
      id: 1, 
      title: 'Giải đề Toán Đại số 2024', 
      subject: 'Toán', 
      deadline: '2026-05-12', 
      priority: 'Cao', 
      completed: false,
      subtasks: [
        { id: 101, title: 'Làm trắc nghiệm (35 câu)', completed: true },
        { id: 102, title: 'Giải phần tự luận', completed: false },
        { id: 103, title: 'So đáp án và note lỗi sai', completed: false }
      ]
    },
    { id: 2, title: 'Ôn tập 5 tác phẩm Văn học', subject: 'Văn', deadline: '2026-05-15', priority: 'Trung bình', completed: true, subtasks: [] },
    { id: 3, title: 'Học 50 từ vựng Unit 10', subject: 'Anh', deadline: '2026-05-10', priority: 'Cao', completed: false, subtasks: [] },
  ];

  const DEFAULT_EXAMS = [
    { id: 1, name: 'THI THPT QUỐC GIA', date: '2026-06-25' }
  ];

  // --- STATE TÁC VỤ ---
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('exam_master_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch (e) {
      console.error('Lỗi khi load tasks:', e);
      return DEFAULT_TASKS;
    }
  });

  // --- STATE KỲ THI (ĐA KỲ THI) ---
  const [exams, setExams] = useState(() => {
    try {
      const saved = localStorage.getItem('exam_master_exams');
      return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
    } catch (e) {
      console.error('Lỗi khi load exams:', e);
      return DEFAULT_EXAMS;
    }
  });
  const [timeLefts, setTimeLefts] = useState({});

  const [filter, setFilter] = useState('all'); 

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Trung bình');

  // --- LƯU DỮ LIỆU VÀO LOCALSTORAGE ---
  useEffect(() => {
    try {
      localStorage.setItem('exam_master_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Lỗi khi lưu tasks:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('exam_master_exams', JSON.stringify(exams));
    } catch (e) {
      console.error('Lỗi khi lưu exams:', e);
    }
  }, [exams]);

  // --- STATE POMODORO ---
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' hoặc 'break'
  const [pomodoroTime, setPomodoroTime] = useState(workMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditingPomodoro, setIsEditingPomodoro] = useState(false);
  const [isAutoStart, setIsAutoStart] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [isAnimePomodoroMode, setIsAnimePomodoroMode] = useState(false);
  const [animeVideoId] = useState('98ZHcjHbXAs'); // Anime video ID

  // --- STATE NHIỆM VỤ NHỎ (SUBTASKS) ---
  const [activeSubtaskId, setActiveSubtaskId] = useState(null);
  const [subtaskInputValue, setSubtaskInputValue] = useState('');

  // --- STATE CHAT ONLINE & NICKNAME ---
  const [userNickname, setUserNickname] = useState(() => {
    return localStorage.getItem('exam_master_nickname') || '';
  });
  const [userAnimal, setUserAnimal] = useState(() => {
    return localStorage.getItem('exam_master_animal') || DEFAULT_ANIMAL;
  });
  const [isNicknameSet, setIsNicknameSet] = useState(() => {
    return !!localStorage.getItem('exam_master_nickname');
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersOnline, setUsersOnline] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [userId, setUserId] = useState(() => {
    let saved = localStorage.getItem('exam_master_user_id');
    if (!saved) {
      saved = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('exam_master_user_id', saved);
    }
    return saved;
  });

  // --- STATE SOCKET.IO CONNECTION ---
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState('');
  const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

  const priorities = ['Cao', 'Trung bình', 'Thấp'];

  // --- LOGIC TÁC VỤ (TÍNH TOÁN TRƯỚC) ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  // --- SOCKET.IO INITIALIZATION ---
  useEffect(() => {
    if (!isNicknameSet) return;

    let isActive = true;

    // Kết nối Socket.IO
    const newSocket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Lắng nghe kết nối
    newSocket.on('connect', async () => {
      console.log('✅ Socket connected:', newSocket.id);
      setSocketConnected(true);
      setSocketId(newSocket.id);

      // Gửi thông tin user join
      newSocket.emit('user-join', {
        nickname: userNickname,
        animalName: userAnimal,
        emoji: ANIMAL_EMOJIS[userAnimal],
        progress: Math.round((completedTasks / totalTasks) * 100) || 0,
      });

      // Load lịch sử tin nhắn
      try {
        const res = await fetch(`${SOCKET_SERVER_URL}/api/messages`);
        if (res.ok && isActive) {
          const history = await res.json();
          setMessages(history);
        }
      } catch (error) {
        console.error('❌ Lỗi khi load lịch sử tin nhắn:', error);
      }
    });

    // Lắng nghe ngắt kết nối
    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
      setSocketId('');
    });

    // Lắng nghe tin nhắn mới từ server
    newSocket.on('receive-message', (message) => {
      console.log('📨 New message:', message);
      setMessages(prev => [...prev, message]);

      // Desktop notification cho tin nhắn mới từ người khác
      if (message.userId !== newSocket.id && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${message.emoji || '💬'} ${message.nickname} vừa nhắn`, {
          body: message.message,
        });
      }
    });

    // Lắng nghe xác nhận gửi tin nhắn
    newSocket.on('message-sent', (data) => {
      console.log('✅ Message sent successfully:', data);
    });

    // Lắng nghe người dùng join
    newSocket.on('user-joined', (data) => {
      console.log('👤 User joined:', data);
      if (data && data.users) {
        setUsersOnline(data.users);
      }
    });

    // Lắng nghe cập nhật trạng thái user
    newSocket.on('user-status-updated', (data) => {
      console.log('🔄 User status updated:', data);
      setUsersOnline(data.users || []);
    });

    // Lắng nghe người dùng rời đi
    newSocket.on('user-left', (data) => {
      console.log('👋 User left:', data);
      setUsersOnline(data.users || []);
    });

    // Lắng nghe lỗi
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Lắng nghe connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ Connect error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      isActive = false;
      // Cleanup: cập nhật trạng thái offline trước khi disconnect
      newSocket.emit('update-status', { online: false });
      newSocket.disconnect();
    };
  }, [isNicknameSet, userNickname, userAnimal, SOCKET_SERVER_URL]);

  // --- LOGIC ĐẾM NGƯỢC NGÀY THI ---
  useEffect(() => {
    const calculateTimeLefts = () => {
      const newTimeLefts = {};
      exams.forEach(exam => {
        if (!exam.date) {
          newTimeLefts[exam.id] = { days: 0, hours: 0, minutes: 0 };
          return;
        }
        const difference = +new Date(exam.date) - +new Date();
        if (difference > 0) {
          newTimeLefts[exam.id] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
          };
        } else {
          newTimeLefts[exam.id] = { days: 0, hours: 0, minutes: 0 };
        }
      });
      return newTimeLefts;
    };

    setTimeLefts(calculateTimeLefts());
    const timer = setInterval(() => setTimeLefts(calculateTimeLefts()), 60000);
    return () => clearInterval(timer);
  }, [exams]);

  const handleAddExam = () => {
    setExams([...exams, { id: Date.now(), name: 'KỲ THI MỚI', date: '' }]);
  };

  const handleUpdateExam = (id, field, value) => {
    setExams(exams.map(exam => exam.id === id ? { ...exam, [field]: value } : exam));
  };

  const handleDeleteExam = (id) => {
    setExams(exams.filter(exam => exam.id !== id));
  };

  // --- HỖ TRỢ KHÔI PHỤC DỮ LIỆU ---
  const resetToDefaults = () => {
    if (confirm('Bạn có muốn khôi phục lại dữ liệu mặc định? Các thay đổi sẽ bị mất.')) {
      setTasks(DEFAULT_TASKS);
      setExams(DEFAULT_EXAMS);
      localStorage.setItem('exam_master_tasks', JSON.stringify(DEFAULT_TASKS));
      localStorage.setItem('exam_master_exams', JSON.stringify(DEFAULT_EXAMS));
      alert('✓ Dữ liệu đã được khôi phục!');
    }
  };

  const exportData = () => {
    const data = {
      tasks,
      exams,
      exportedAt: new Date().toLocaleString('vi-VN')
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam-master-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks && data.exams) {
            setTasks(data.tasks);
            setExams(data.exams);
            alert('✓ Dữ liệu đã được khôi phục từ file!');
          } else {
            alert('❌ File không hợp lệ. Vui lòng chọn file backup đúng.');
          }
        } catch (error) {
          alert('❌ Lỗi khi đọc file: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // --- LOGIC CHAT ONLINE & NICKNAME ---
  const handleSetNickname = (nickname, animal) => {
    if (!nickname.trim()) return;
    
    localStorage.setItem('exam_master_nickname', nickname);
    localStorage.setItem('exam_master_animal', animal);
    setUserNickname(nickname);
    setUserAnimal(animal);
    setIsNicknameSet(true);
    
    // Yêu cầu permission thông báo
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !socketConnected) return;

    try {
      // Gửi tin nhắn qua Socket.IO
      socket.emit('send-message', {
        text: newMessage,
        timestamp: Date.now(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      alert('❌ Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.');
    }
  };

  // Update user online status via Socket.IO
  useEffect(() => {
    if (!socket || !socketConnected) return;

    const updateUserStatus = () => {
      socket.emit('update-status', {
        online: true,
        progress: Math.round((completedTasks / totalTasks) * 100) || 0,
      });
    };

    updateUserStatus();
    const interval = setInterval(updateUserStatus, 30000); // Update mỗi 30 giây

    return () => clearInterval(interval);
  }, [socket, socketConnected, completedTasks, totalTasks]);

  // --- LOGIC POMODORO ---
  const playAlarmSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.8;
      audio.play();
    } catch (error) {
      console.log("Audio playback failed", error);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
        if (pomodoroMode === 'work') {
          setTotalStudySeconds(prev => prev + 1);
        }
      }, 1000);
    } else if (isTimerRunning && pomodoroTime === 0) {
      playAlarmSound();
      
      const nextMode = pomodoroMode === 'work' ? 'break' : 'work';
      setPomodoroMode(nextMode);
      setPomodoroTime(nextMode === 'work' ? workMinutes * 60 : breakMinutes * 60);
      
      if (!isAutoStart) {
        setIsTimerRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime, pomodoroMode, workMinutes, breakMinutes, isAutoStart]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatTotalStudyTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} phút`;
  };

  const switchPomodoroMode = (mode) => {
    setPomodoroMode(mode);
    setIsTimerRunning(false);
    setPomodoroTime(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const resetPomodoro = () => {
    setIsTimerRunning(false);
    setPomodoroTime(pomodoroMode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const applyCustomTimes = () => {
    setIsEditingPomodoro(false);
    resetPomodoro();
  };

  const handleYoutubeChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    if (match && match[1]) {
      setVideoId(match[1]);
    } else {
      setVideoId('');
    }
  };

  // --- LOGIC TÁC VỤ (ĐÃ TÍNH TOÁN BÊN TRÊN) ---
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(), 
      title: newTaskTitle, 
      subject: newTaskSubject || 'Chung',
      deadline: newTaskDeadline || 'Không có', 
      priority: newTaskPriority, 
      completed: false,
      subtasks: []
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskSubject('');
    setNewTaskDeadline('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id) => setTasks(tasks.filter(task => task.id !== id));

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // --- LOGIC TÁC VỤ CON (SUBTASKS) ---
  const handleAddSubtask = (taskId, e) => {
    e.preventDefault();
    if (!subtaskInputValue.trim()) return;
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          subtasks: [...(task.subtasks || []), { id: Date.now(), title: subtaskInputValue, completed: false }] 
        };
      }
      return task;
    }));
    setSubtaskInputValue('');
    setActiveSubtaskId(null);
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return task;
    }));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return task;
    }));
  };

  // TÍNH TOÁN THỐNG KÊ RIÊNG CHO TỪNG MÔN HỌC
  const subjectStats = tasks.reduce((acc, task) => {
    const subj = task.subject || 'Chung';
    if (!acc[subj]) acc[subj] = { total: 0, completed: 0 };
    acc[subj].total += 1;
    if (task.completed) acc[subj].completed += 1;
    return acc;
  }, {});

  // GOM NHÓM TÁC VỤ THEO MÔN HỌC (Đang hiển thị)
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const subj = task.subject || 'Chung';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(task);
    return acc;
  }, {});

  // --- GIAO DIỆN PHỤ TRỢ ---
  const getSubjectColor = (subject) => {
    const colors = {
      'Toán': 'bg-blue-100 text-blue-700 border-blue-200',
      'Văn': 'bg-pink-100 text-pink-700 border-pink-200',
      'Anh': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Vật lý': 'bg-purple-100 text-purple-700 border-purple-200',
      'Hóa học': 'bg-orange-100 text-orange-700 border-orange-200',
      'Sinh học': 'bg-teal-100 text-teal-700 border-teal-200',
      'Khác': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[subject] || colors['Khác'];
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'Cao') return <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></div>;
    if (priority === 'Trung bình') return <div className="w-2 h-2 rounded-full bg-orange-400"></div>;
    return <div className="w-2 h-2 rounded-full bg-slate-300"></div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50 font-sans text-slate-800 p-4 md:p-6 lg:p-8">
      
      {/* ANIME POMODORO FULLSCREEN MODE */}
      {isAnimePomodoroMode && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-hidden">
          {/* Video Background */}
          <iframe 
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${animeVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${animeVideoId}`}
            title="Anime Background"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none', pointerEvents: 'none' }}
          ></iframe>
          
          {/* Dark overlay for visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
          
          {/* Timer Display - Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
            {/* Main Timer Circle */}
            <div className="relative mb-8">
              <div className={`w-48 h-48 rounded-full flex items-center justify-center shadow-2xl ${pomodoroMode === 'work' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
                <div className="text-center">
                  <div className={`text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-lg`}>
                    {formatTime(pomodoroTime)}
                  </div>
                  <div className="text-white text-sm font-bold uppercase tracking-widest mt-2">
                    {pomodoroMode === 'work' ? '📚 Học Tập' : '☕ Nghỉ Ngơi'}
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6 mt-8">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transform transition hover:scale-110 active:scale-95 font-bold text-2xl ${pomodoroMode === 'work' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isTimerRunning ? '⏸️' : '▶️'}
              </button>
              <button 
                onClick={resetPomodoro}
                className="w-16 h-16 rounded-full bg-slate-600 hover:bg-slate-700 text-white shadow-2xl flex items-center justify-center transform transition hover:scale-110 active:scale-95 font-bold text-xl"
              >
                🔄
              </button>
              <button 
                onClick={() => setIsAnimePomodoroMode(false)}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transform transition hover:scale-110 active:scale-95 font-bold text-2xl"
                title="Thoát chế độ Anime"
              >
                ✕
              </button>
            </div>

            {/* Study Time Display */}
            {pomodoroMode === 'break' && (
              <div className="mt-8 text-white text-center backdrop-blur-sm bg-white/10 px-6 py-3 rounded-xl">
                <p className="text-lg font-bold">☕ Thư giãn xem anime một chút!</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center gap-3">
              <Award className="w-10 h-10 text-indigo-600" />
              Exam Master
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Kỷ luật là cầu nối giữa mục tiêu và thành tựu.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex gap-3 flex-col sm:flex-row">
              {/* Button Quiz */}
              <a 
                href="/quiz.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-lg text-white rounded-lg transition-all font-semibold text-sm"
                title="Làm bài trắc nghiệm"
              >
                <BrainCircuit className="w-4 h-4" />
                📝 Trắc nghiệm
              </a>

              {/* Button Chat */}
              {isNicknameSet && (
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg text-white rounded-lg transition-all font-semibold text-sm"
                  title="Mở chat"
                >
                  <MessageCircle className="w-4 h-4" />
                  💬 Chat
                  {usersOnline.length > 0 && (
                    <span className="ml-1 bg-white/30 px-2 py-0.5 rounded-full text-xs font-bold">
                      {usersOnline.length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Menu khôi phục dữ liệu */}
            <details className="group cursor-pointer">
              <summary className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-semibold text-slate-700 list-none">
                <Settings className="w-4 h-4" />
                Tùy chọn dữ liệu
                <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="absolute bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-50 min-w-[220px] right-0">
                <button 
                  onClick={exportData}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm font-medium text-slate-700 border-b border-slate-100 hover:text-indigo-600 transition-colors"
                  title="Tải file backup dữ liệu"
                >
                  📥 Xuất dữ liệu
                </button>
                <button 
                  onClick={importData}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm font-medium text-slate-700 border-b border-slate-100 hover:text-indigo-600 transition-colors"
                  title="Khôi phục từ file backup"
                >
                  📤 Nhập dữ liệu
                </button>
                <button 
                  onClick={resetToDefaults}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm font-medium text-slate-700 hover:text-red-600 transition-colors"
                  title="Khôi phục lại mặc định (mất dữ liệu hiện tại)"
                >
                  🔄 Khôi phục mặc định
                </button>
              </div>
            </details>

            {/* Thông báo dữ liệu được lưu */}
            <div className="text-xs text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Dữ liệu được lưu tự động
            </div>
          </div>
          
          <div className="mt-6 lg:mt-0 flex items-stretch gap-4 max-w-full overflow-x-auto pb-2 pt-2 scrollbar-thin scrollbar-thumb-indigo-200">
            {exams.map(exam => {
              const tl = timeLefts[exam.id] || { days: 0, hours: 0, minutes: 0 };
              return (
                <div key={exam.id} className="relative group flex items-center gap-4 bg-gradient-to-r from-indigo-500 to-violet-600 p-1 rounded-2xl shadow-lg shadow-indigo-200 shrink-0 min-w-[280px]">
                  {exams.length > 1 && (
                    <button 
                      onClick={() => handleDeleteExam(exam.id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                      title="Xóa kỳ thi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl text-white w-full">
                    <Calendar className="w-8 h-8 opacity-80 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input 
                        type="text" 
                        value={exam.name}
                        onChange={(e) => handleUpdateExam(exam.id, 'name', e.target.value)}
                        placeholder="Tên kỳ thi..."
                        className="bg-transparent border-none p-0 m-0 text-xs text-indigo-100 font-semibold uppercase tracking-wider w-full focus:ring-0 outline-none placeholder:text-indigo-200/50 truncate"
                      />
                      <div className="flex gap-2 font-bold text-2xl items-baseline mt-1">
                        <span>{tl.days} <span className="text-sm font-normal opacity-80">ngày</span></span>
                        <span className="opacity-50">:</span>
                        <span>{tl.hours} <span className="text-sm font-normal opacity-80">giờ</span></span>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-white/20 mx-1 shrink-0"></div>
                    <input 
                      type="date" 
                      value={exam.date}
                      onChange={(e) => handleUpdateExam(exam.id, 'date', e.target.value)}
                      className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert w-32 shrink-0"
                    />
                  </div>
                </div>
              );
            })}
            
            <button 
              onClick={handleAddExam}
              className="flex flex-col items-center justify-center gap-1 bg-indigo-50/50 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-400 hover:text-indigo-600 rounded-2xl px-5 shrink-0 transition-colors cursor-pointer"
              title="Thêm mục tiêu đếm ngược"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Thêm</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI: Widgets (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* WIDGET POMODORO */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-indigo-100"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-indigo-500" />
                    Pomodoro
                    <button 
                      onClick={() => setIsEditingPomodoro(!isEditingPomodoro)} 
                      className={`ml-1 transition-colors ${isEditingPomodoro ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
                      title="Tùy chỉnh thời gian"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </h2>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button 
                        onClick={() => switchPomodoroMode('work')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${pomodoroMode === 'work' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Học
                      </button>
                      <button 
                        onClick={() => switchPomodoroMode('break')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${pomodoroMode === 'break' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Nghỉ
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsAnimePomodoroMode(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAnimePomodoroMode ? 'bg-purple-500 text-white shadow-sm' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'}`}
                      title="Chế độ Anime"
                    >
                      🎨 Anime
                    </button>
                  </div>
                </div>

                {isEditingPomodoro ? (
                  <div className="py-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Học (phút)</label>
                        <input 
                          type="number" 
                          min="1" max="120" 
                          value={workMinutes} 
                          onChange={(e) => setWorkMinutes(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 text-center"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nghỉ (phút)</label>
                        <input 
                          type="number" 
                          min="1" max="60" 
                          value={breakMinutes} 
                          onChange={(e) => setBreakMinutes(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-700">Tự động chạy chu kỳ tiếp</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isAutoStart} onChange={() => setIsAutoStart(!isAutoStart)} />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Music className="w-3 h-3"/> Nhạc nền YouTube (Link)</label>
                      <input 
                        type="text" 
                        value={youtubeUrl} 
                        onChange={handleYoutubeChange}
                        placeholder="VD: https://youtube.com/watch?v=..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 mb-2"
                      />
                      <button 
                        onClick={() => {
                          setYoutubeUrl('https://www.youtube.com/watch?v=98ZHcjHbXAs');
                          setVideoId('98ZHcjHbXAs');
                        }}
                        className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-3 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        🎬 Gợi ý: Anime Cute
                      </button>
                    </div>

                    <button 
                      onClick={applyCustomTimes}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-2.5 rounded-lg transition-colors mt-2"
                    >
                      Lưu thiết lập
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className={`text-6xl font-black tabular-nums tracking-tighter mb-6 ${pomodoroMode === 'work' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                        {formatTime(pomodoroTime)}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className={`w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${pomodoroMode === 'work' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-500 shadow-emerald-200'}`}
                        >
                          {isTimerRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                        <button 
                          onClick={resetPomodoro}
                          className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {pomodoroMode === 'break' && (
                      <p className="text-center text-sm text-emerald-600 mt-4 flex items-center justify-center gap-2 font-medium">
                        <Coffee className="w-4 h-4" /> Thư giãn một chút nhé!
                      </p>
                    )}
                    
                    {/* YOUTUBE PLAYER WIDGET */}
                    {videoId && (
                      <div className="mt-6 relative group animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm">
                          <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-indigo-50 rounded-lg">
                                <Music className="w-3.5 h-3.5 text-indigo-500" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Không gian âm nhạc</span>
                            </div>
                            {/* Animated equalizer */}
                            <div className="flex gap-1 items-end h-3" title="Đang phát nhạc">
                              <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_100ms] h-full"></span>
                              <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_300ms] h-2/3"></span>
                              <span className="w-1 bg-indigo-300 rounded-full animate-[bounce_1s_infinite_500ms] h-full"></span>
                            </div>
                          </div>
                          <div className="rounded-lg overflow-hidden bg-slate-900 shadow-inner relative">
                            <iframe 
                              width="100%" 
                              height="160" 
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&fs=0&modestbranding=1`} 
                              title="YouTube music player" 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              className="w-full align-bottom"
                            ></iframe>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* WIDGET THỐNG KÊ */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-violet-500" />
                Tiến độ hôm nay
              </h2>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-500">Hoàn thành</span>
                <span className="text-2xl font-black text-violet-600">{progressPercentage}%</span>
              </div>
              
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner">
                <div 
                  style={{ width: `${progressPercentage}%` }} 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                  <div className="text-3xl font-bold text-indigo-600">{completedTasks}</div>
                  <div className="text-xs font-medium text-indigo-800 uppercase mt-1">Đã xong</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-3xl font-bold text-slate-600">{totalTasks - completedTasks}</div>
                  <div className="text-xs font-medium text-slate-500 uppercase mt-1">Còn lại</div>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{formatTotalStudyTime(totalStudySeconds)}</div>
                  <div className="text-xs font-medium text-emerald-800 uppercase mt-1">Thời gian học thực tế</div>
                </div>
                <div className="p-3 bg-emerald-100/50 rounded-xl">
                  <Clock className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Form & Danh sách (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* FORM THÊM NHIỆM VỤ */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <form onSubmit={handleAddTask} className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="w-full lg:flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nhiệm vụ mới</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="VD: Làm 3 bài tập mạch điện XC..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                    required
                  />
                </div>
                
                <div className="w-full lg:w-40">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Môn học</label>
                  <input 
                    type="text" 
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    placeholder="VD: Toán, IELTS..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="w-full lg:w-36">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ưu tiên</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full lg:w-auto bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-indigo-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="lg:hidden">Thêm công việc</span>
                </button>
              </form>
            </div>

            {/* DANH SÁCH TÁC VỤ */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[calc(100%-100px)] min-h-[400px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BookMarked className="w-6 h-6 text-indigo-500" />
                  Lộ trình học tập
                </h2>
                
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['all', 'active', 'completed'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {f === 'all' ? 'Tất cả' : f === 'active' ? 'Cần làm' : 'Đã xong'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-12 h-12 text-slate-300" />
                    </div>
                    <p className="font-medium text-lg text-slate-500">Mục tiêu hiện tại đã hoàn tất!</p>
                    <p className="text-sm mt-1">Hãy thêm nhiệm vụ mới để duy trì tiến độ nhé.</p>
                  </div>
                ) : (
                  Object.entries(groupedTasks).map(([subject, tasksInSubject]) => {
                    // Lấy số liệu thống kê (dựa trên tổng bài, không bị ảnh hưởng bởi bộ lọc)
                    const stats = subjectStats[subject];
                    const subjectProgress = stats && stats.total > 0 
                      ? Math.round((stats.completed / stats.total) * 100) 
                      : 0;

                    return (
                      <div key={subject} className="mb-6 last:mb-0 animate-in fade-in duration-300">
                        
                        {/* Tiêu đề Môn học & Thanh tiến độ */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getSubjectColor(subject)}`}>
                              {subject}
                            </span>
                            <span className="text-slate-400 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md">
                              {tasksInSubject.length} mục
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">Tiến độ:</span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${subjectProgress}%` }} 
                                className={`h-full transition-all duration-500 ${subjectProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold ${subjectProgress === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                              {subjectProgress}%
                            </span>
                          </div>
                        </div>

                        {/* Danh sách nhiệm vụ của môn */}
                        <div className="space-y-4 pl-2 border-l-2 border-indigo-50 ml-2">
                          {tasksInSubject.map((task) => {
                            const subtaskTotal = task.subtasks?.length || 0;
                            const subtaskCompleted = task.subtasks?.filter(st => st.completed).length || 0;

                            return (
                              <div 
                                key={task.id} 
                                className={`group p-4 pl-5 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-slate-50/50 border-slate-200/60 opacity-80' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50'}`}
                              >
                                {/* Dòng Nhiệm vụ Chính */}
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-start sm:items-center gap-4 w-full">
                                    <button 
                                      onClick={() => toggleTask(task.id)}
                                      className="mt-1 sm:mt-0 flex-shrink-0 text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none"
                                    >
                                      {task.completed ? (
                                        <CheckCircle className="w-7 h-7 text-emerald-500" />
                                      ) : (
                                        <Circle className="w-7 h-7" />
                                      )}
                                    </button>
                                    
                                    <div className="flex flex-col flex-1">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-base font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                          {task.title}
                                        </span>
                                        {/* Hiển thị số lượng subtasks (nếu có) */}
                                        {subtaskTotal > 0 && (
                                          <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${subtaskCompleted === subtaskTotal ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                            <ListTree className="w-3 h-3" />
                                            {subtaskCompleted}/{subtaskTotal}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md font-medium text-slate-500 border border-slate-100">
                                          {getPriorityIcon(task.priority)}
                                          <span>Ưu tiên {task.priority.toLowerCase()}</span>
                                        </div>
                                        {task.deadline !== 'Không có' && (
                                          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md font-medium text-slate-500 border border-slate-100">
                                            <Clock className="w-3.5 h-3.5" />
                                            {task.deadline}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="text-slate-300 hover:text-red-500 p-2 sm:p-3 bg-slate-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shrink-0"
                                    title="Xóa nhiệm vụ chính"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>

                                {/* KHU VỰC NHIỆM VỤ CON (SUBTASKS) */}
                                {(subtaskTotal > 0 || activeSubtaskId === task.id) && (
                                  <div className="mt-4 ml-11 pl-4 border-l-2 border-indigo-100/50 space-y-2 py-1">
                                    {/* Hiển thị danh sách subtasks */}
                                    {task.subtasks?.map(st => (
                                      <div key={st.id} className="flex items-center justify-between group/st gap-2">
                                        <div className="flex items-center gap-2.5 flex-1">
                                          <button onClick={() => toggleSubtask(task.id, st.id)}>
                                            {st.completed ? (
                                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                              <Circle className="w-4 h-4 text-slate-300 hover:text-indigo-400" />
                                            )}
                                          </button>
                                          <span className={`text-sm font-medium transition-colors ${st.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                            {st.title}
                                          </span>
                                        </div>
                                        <button 
                                          onClick={() => deleteSubtask(task.id, st.id)} 
                                          className="opacity-0 group-hover/st:opacity-100 text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-all"
                                          title="Xóa bước này"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}

                                    {/* Form nhập việc con mới */}
                                    {activeSubtaskId === task.id ? (
                                      <form onSubmit={(e) => handleAddSubtask(task.id, e)} className="flex items-center gap-2 mt-2">
                                        <CornerDownRight className="w-4 h-4 text-slate-300 shrink-0"/>
                                        <input 
                                          autoFocus 
                                          value={subtaskInputValue} 
                                          onChange={(e) => setSubtaskInputValue(e.target.value)} 
                                          placeholder="Nhập nội dung bước nhỏ..." 
                                          className="flex-1 p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                        />
                                        <button type="submit" className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors">
                                          Lưu
                                        </button>
                                        <button type="button" onClick={() => setActiveSubtaskId(null)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">
                                          Hủy
                                        </button>
                                      </form>
                                    ) : (
                                      <button 
                                        onClick={() => setActiveSubtaskId(task.id)} 
                                        className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1.5 mt-2 py-1 px-2 hover:bg-indigo-50 rounded-lg transition-colors w-fit"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Thêm việc nhỏ
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {/* Nút "Thêm việc nhỏ" hiển thị lúc task chưa có subtask nào và chưa bấm */}
                                {subtaskTotal === 0 && activeSubtaskId !== task.id && (
                                   <div className="ml-11 mt-2">
                                      <button 
                                        onClick={() => setActiveSubtaskId(task.id)} 
                                        className="text-xs text-slate-400 hover:text-indigo-500 font-semibold flex items-center gap-1 py-1 px-2 hover:bg-slate-50 rounded-lg transition-colors w-fit opacity-0 group-hover:opacity-100"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Tạo bước nhỏ
                                      </button>
                                   </div>
                                )}

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* MODAL CHATBOX */}
        {!isNicknameSet && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
                Đặt Nickname để Chat
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">📝 Nickname của bạn</label>
                  <input 
                    type="text" 
                    id="chatNickname"
                    placeholder="VD: An, Bình, Cường..."
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">🐾 Chọn con thú</label>
                  <select 
                    id="chatAnimal"
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700"
                  >
                    {ANIMAL_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => {
                    const nickname = document.getElementById('chatNickname').value;
                    const animal = document.getElementById('chatAnimal').value;
                    handleSetNickname(nickname, animal);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg text-white font-bold py-3 rounded-lg transition-all"
                >
                  ✓ Bắt đầu Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CHATBOX */}
        {isNicknameSet && showChat && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 flex flex-col animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 flex justify-between items-center rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-lg">💬 Chat Online</h3>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <span>{usersOnline.length} người đang online</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${socketConnected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-amber-500/20 text-amber-100'}`}>
                        <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-300' : 'bg-amber-300'}`}></span>
                        {socketConnected ? 'Đã kết nối' : 'Đang kết nối'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Users Online Panel */}
                {usersOnline.length > 0 && (
                  <div className="w-48 border-r border-slate-200 p-4 overflow-y-auto bg-slate-50">
                    <p className="text-xs font-bold text-slate-600 mb-3 uppercase">👥 Online</p>
                    <div className="space-y-2">
                      {usersOnline.map(user => (
                        <div key={user.id} className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-lg">{user.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">{user.nickname}</p>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${user.progress}%` }} 
                                className="h-full bg-indigo-500 transition-all"
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 w-8 text-right">{user.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Panel */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                    {messages.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">Chưa có tin nhắn nào</p>
                    ) : (
                      messages.map((msg, idx) => (
                        <div 
                          key={msg.id || idx} 
                          className={`flex gap-2.5 ${msg.userId === socketId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs ${msg.userId === socketId ? 'order-2' : 'order-1'}`}>
                            <div className={`text-xs font-semibold mb-1 ${msg.userId === socketId ? 'text-right text-indigo-600' : 'text-slate-700'}`}>
                              {(msg.emoji || ANIMAL_EMOJIS[msg.animalName] || '💬')} {msg.nickname} • {typeof msg.progress === 'number' ? msg.progress : 0}%
                            </div>
                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                              msg.userId === socketId 
                                ? 'bg-indigo-500 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-900 rounded-bl-none'
                            }`}>
                              {msg.message || msg.text}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 bg-slate-50 flex gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhắn tin..."
                      className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium"
                    />
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors font-bold flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Gửi
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
