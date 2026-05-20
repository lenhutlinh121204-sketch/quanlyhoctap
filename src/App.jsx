import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Circle, Trash2, Calendar, BookOpen, Stethoscope, 
  Clock, Plus, BarChart3, Target, Award, BookMarked,
  Play, Pause, RotateCcw, Coffee, BrainCircuit, Sparkles, 
  Settings, Music, Bell, ListTree, CornerDownRight, Send,
  Users, MessageCircle, LogOut, Edit2, Check, X, Hash, DoorOpen, Palette
} from 'lucide-react';
import io from 'socket.io-client';
import { db } from './firebase';
import {
  collection, addDoc, query, where, onSnapshot, updateDoc, doc,
  serverTimestamp, orderBy, limit, getDocs, deleteDoc, setDoc, increment
} from 'firebase/firestore';
import BioChemQuiz from './BioChemQuiz.jsx';
import Timetable from './Timetable.jsx';
import CommunityQuiz from './CommunityQuiz.jsx';
import FlashcardsHub from './FlashcardsHub.jsx';
import SharedStudyRoom from './SharedStudyRoom.jsx';
import bookReadGif from './Book Read GIF.gif';
import girlEatGif from './Girl Eat GIF.gif';
import demonSlayerGif from './Demonslayer Kimetsunoyaiba GIF by KonnichiwaFestival.gif';
import giphyGif from './giphy.gif';
import gifGif from './gif.gif';
import kimetsuSlayeriQiyiGif from './Kimetsu No Yaiba Demon Slayer GIF by iQiyi.gif';
import kimetsuSnakeXboxGif from './Kimetsu No Yaiba Snake GIF by Xbox.gif';
import gif1Gif from './gif (1).gif';
import kimetsuSlayerXboxGif from './Kimetsu No Yaiba Demon Slayer GIF by Xbox.gif';
import kimetsuWaterXboxGif from './Kimetsu No Yaiba Water GIF by Xbox.gif';
import lemmeThinkGif from './Lemme Think GIF.gif';
import nightSleepingGif from './Night Sleeping GIF.gif';
import ohNoFacepalmGif from './Oh No Facepalm GIF.gif';
import orekiHoutarouGif from './oreki houtarou GIF.gif';
import prepareLetsGoGif from './Prepare Lets Go GIF by Xbox.gif';
import scrollingLateNightGif from './Scrolling Late Night GIF.gif';
import tiredCatGif from './Tired Cat GIF.gif';
import whiteCatGif from './White Cat GIF.gif';
import cuteMangoLogo from './cute_mango_study_logo.png';

const sendSoundAudio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
const receiveSoundAudio = new Audio('https://actions.google.com/sounds/v1/alarms/pop_up_notification.ogg');

const playChatSound = (type) => {
  try {
    if (type === 'send') {
      sendSoundAudio.currentTime = 0;
      sendSoundAudio.volume = 0.4;
      sendSoundAudio.play().catch(() => {});
    } else {
      receiveSoundAudio.currentTime = 0;
      receiveSoundAudio.volume = 0.6;
      receiveSoundAudio.play().catch(() => {});
    }
  } catch (e) {}
};

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
  const [pomodoroMascot, setPomodoroMascot] = useState(() => {
    return localStorage.getItem('exam_master_mascot') || 'auto';
  });

  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const ALL_GIFS = [
    bookReadGif,
    girlEatGif,
    demonSlayerGif,
    giphyGif,
    gifGif,
    kimetsuSlayeriQiyiGif,
    kimetsuSnakeXboxGif,
    gif1Gif,
    kimetsuSlayerXboxGif,
    kimetsuWaterXboxGif,
    lemmeThinkGif,
    nightSleepingGif,
    ohNoFacepalmGif,
    orekiHoutarouGif,
    prepareLetsGoGif,
    scrollingLateNightGif,
    tiredCatGif,
    whiteCatGif,
  ];

  useEffect(() => {
    if (pomodoroMascot === 'rotate') {
      const interval = setInterval(() => {
        setCurrentGifIndex(prev => (prev + 1) % ALL_GIFS.length);
      }, 15000); // Tự động chuyển đổi mỗi 15 giây
      return () => clearInterval(interval);
    }
  }, [pomodoroMascot, ALL_GIFS.length]);

  const [pomodoroTime, setPomodoroTime] = useState(workMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditingPomodoro, setIsEditingPomodoro] = useState(false);
  const [showBioChem, setShowBioChem] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showCommunityQuiz, setShowCommunityQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showSharedStudyRoom, setShowSharedStudyRoom] = useState(false);
  const [studySession, setStudySession] = useState(null);
  const [isAutoStart, setIsAutoStart] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [totalStudySeconds, setTotalStudySeconds] = useState(() => {
    return parseInt(localStorage.getItem('totalStudySeconds') || '0', 10);
  });

  // States cho Bảng xếp hạng Học tập (Study Leaderboard)
  const [showStudyLeaderboard, setShowStudyLeaderboard] = useState(false);
  const [studyLeaderboardScores, setStudyLeaderboardScores] = useState([]);
  const [loadingStudyLeaderboard, setLoadingStudyLeaderboard] = useState(false);
  const [isAnimePomodoroMode, setIsAnimePomodoroMode] = useState(false);
  const [animeVideoId] = useState('98ZHcjHbXAs'); // Anime video ID

  // --- STATE NHIỆM VỤ NHỎ (SUBTASKS) ---
  const [activeSubtaskId, setActiveSubtaskId] = useState(null);
  const [subtaskInputValue, setSubtaskInputValue] = useState('');

  // --- STATE CHAT ONLINE & NICKNAME ---
  const [userNickname, setUserNickname] = useState(() => {
    return localStorage.getItem('exam_master_nickname') || '';
  });
  const [userStatus, setUserStatus] = useState('Đang học bài');
  const [customStatus, setCustomStatus] = useState('Đang học bài');
  const [userAnimal, setUserAnimal] = useState(() => {
    return localStorage.getItem('exam_master_animal') || DEFAULT_ANIMAL;
  });
  const [isNicknameSet, setIsNicknameSet] = useState(() => {
    return !!localStorage.getItem('exam_master_nickname');
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersOnline, setUsersOnline] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [selectedOnlineUser, setSelectedOnlineUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('exam_master_theme') || 'default';
  });
  const [dndMode, setDndMode] = useState(() => {
    return localStorage.getItem('exam_master_dnd') === 'true';
  });
  const dndModeRef = useRef(dndMode);
  useEffect(() => {
    dndModeRef.current = dndMode;
  }, [dndMode]);
  const [toastNotification, setToastNotification] = useState(null);
  const showChatRef = useRef(showChat);
  const messagesEndRef = useRef(null);
  const [createQuizAttempts, setCreateQuizAttempts] = useState(() => {
    return parseInt(localStorage.getItem('createQuizAttempts') || '3', 10);
  });
  const [takeQuizAttempts, setTakeQuizAttempts] = useState(() => {
    return parseInt(localStorage.getItem('takeQuizAttempts') || '5', 10);
  });

  const decrementCreateAttempts = () => {
    setCreateQuizAttempts(prev => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('createQuizAttempts', next);
      return next;
    });
  };

  const decrementTakeAttempts = () => {
    setTakeQuizAttempts(prev => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('takeQuizAttempts', next);
      return next;
    });
  };

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  // --- STATE GAMIFICATION (CAP BAC, XP, HUY HIEU, PET) ---
  const [userXP, setUserXP] = useState(() => {
    return parseInt(localStorage.getItem('exam_master_xp') || '0', 10);
  });
  const [userLevel, setUserLevel] = useState(() => {
    return parseInt(localStorage.getItem('exam_master_level') || '1', 10);
  });
  const [userBadges, setUserBadges] = useState(() => {
    const saved = localStorage.getItem('exam_master_badges');
    return saved ? saved.split(',').filter(Boolean) : [];
  });
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [lastLevelUp, setLastLevelUp] = useState(1);
  const [toastBadge, setToastBadge] = useState(null);

  useEffect(() => {
    localStorage.setItem('exam_master_xp', userXP.toString());
  }, [userXP]);

  useEffect(() => {
    localStorage.setItem('exam_master_level', userLevel.toString());
  }, [userLevel]);

  useEffect(() => {
    localStorage.setItem('exam_master_badges', userBadges.join(','));
  }, [userBadges]);

  const addXP = (amount) => {
    if (!localStorage.getItem('exam_master_nickname')) return;
    setUserXP(prevXP => {
      let newXP = prevXP + amount;
      let currentLevel = userLevel;
      let xpNeeded = currentLevel * 100;
      let didLevelUp = false;

      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        currentLevel += 1;
        xpNeeded = currentLevel * 100;
        didLevelUp = true;
      }

      if (didLevelUp) {
        setUserLevel(currentLevel);
        setLastLevelUp(currentLevel);
        setShowLevelUpModal(true);
        // Âm thanh thăng cấp vui nhộn
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {}
        addActivityToFeed('level_up', `đã xuất sắc thăng lên Cấp độ ${currentLevel}! 🎉`);
      }
      return newXP;
    });
  };

  const unlockBadge = (badgeName) => {
    setUserBadges(prev => {
      if (prev.includes(badgeName)) return prev;
      const updated = [...prev, badgeName];
      setToastBadge(badgeName);
      setTimeout(() => setToastBadge(null), 5000);
      
      // Âm thanh mở huy hiệu
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
      
      addActivityToFeed('badge', `đã xuất sắc mở khóa Huy hiệu danh giá: [${badgeName}]! 🏆`);
      return updated;
    });
  };

  const [pomodoroSessionCount, setPomodoroSessionCount] = useState(0);
  const [groupChallenge, setGroupChallenge] = useState({
    secondsEarned: 0,
    contributors: {}
  });



  useEffect(() => {
    showChatRef.current = showChat;
    if (showChat) {
      setUnreadCount(0);
    }
  }, [showChat]);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  useEffect(() => {
    if (showCommunityQuiz) {
      setUserStatus('📝 Đang làm trắc nghiệm');
    } else if (showBioChem) {
      setUserStatus('🧪 Đang học Hóa Sinh');
    } else if (showFlashcards) {
      setUserStatus('🗂️ Đang học Flashcards');
    } else if (showTimetable) {
      setUserStatus('📅 Đang xem Thời khóa biểu');
    } else {
      setUserStatus(customStatus);
    }
  }, [showCommunityQuiz, showBioChem, showFlashcards, showTimetable, customStatus]);

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

  // --- STATE STUDY ROOMS ---
  const [currentRoom, setCurrentRoom] = useState(() => {
    return localStorage.getItem('exam_master_room') || 'global';
  });
  const [showChangeRoom, setShowChangeRoom] = useState(false);
  const [roomInputModal, setRoomInputModal] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);

  useEffect(() => {
    if (!currentRoom) return;
    const docRef = doc(db, 'group_challenges', currentRoom);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setGroupChallenge(docSnap.data());
      } else {
        setDoc(docRef, {
          secondsEarned: 0,
          contributors: {},
          lastUpdated: serverTimestamp()
        }).catch(err => console.error("Lỗi khởi tạo thử thách nhóm:", err));
      }
    }, (error) => {
      console.error("Lỗi lắng nghe thử thách nhóm:", error);
    });
    return () => unsubscribe();
  }, [currentRoom]);

  const priorities = ['Cao', 'Trung bình', 'Thấp'];

  // --- STATE SMART SCRATCHPAD & STUDY MOOD ---
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem('exam_master_scratchpad') || '';
  });
  const [scratchpadColor, setScratchpadColor] = useState(() => {
    return localStorage.getItem('exam_master_scratchpad_color') || 'yellow';
  });
  const [studyMood, setStudyMood] = useState(() => {
    return localStorage.getItem('exam_master_study_mood') || '🌟';
  });

  useEffect(() => {
    localStorage.setItem('exam_master_scratchpad', scratchpadText);
  }, [scratchpadText]);

  useEffect(() => {
    localStorage.setItem('exam_master_scratchpad_color', scratchpadColor);
  }, [scratchpadColor]);

  useEffect(() => {
    localStorage.setItem('exam_master_study_mood', studyMood);
  }, [studyMood]);

  const MOODS = [
    { emoji: '🌟', label: 'Tập trung', color: 'bg-indigo-100 text-indigo-700', quote: 'Trạng thái tuyệt vời! Hãy giữ vững ngọn lửa này để chinh phục mọi mục tiêu nhé! 🔥' },
    { emoji: '☕', label: 'Thư thả', color: 'bg-emerald-100 text-emerald-700', quote: 'Học tập là một hành trình dài. Sự thư thái hôm nay chính là năng lượng cho ngày mai! 🌱' },
    { emoji: '🎯', label: 'Quyết tâm', color: 'bg-rose-100 text-rose-700', quote: 'Mục tiêu thi đỗ đang ở ngay trước mắt bạn rồi. Cố gắng thêm một chút nữa nào! 💪' },
    { emoji: '😵', label: 'Mệt mỏi', color: 'bg-amber-100 text-amber-700', quote: 'Bạn đã nỗ lực rất nhiều rồi. Hãy nhắm mắt thư giãn 5 phút, uống nước hoặc đi dạo nhé! 🥤' },
    { emoji: '😰', label: 'Lo lắng', color: 'bg-purple-100 text-purple-700', quote: 'Đừng quá lo lắng! Chia nhỏ nhiệm vụ lớn thành các bước nhỏ và xử lý từng phần một nha. Bạn làm được mà! 💖' },
  ];

  const currentMoodObj = MOODS.find(m => m.emoji === studyMood) || MOODS[0];

  // --- STATE DAILY ACTIVITY FEED ---
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'task', 'quiz', 'join'

  const addActivityToFeed = async (type, details) => {
    if (!userNickname) return;
    const emoji = ANIMAL_EMOJIS[userAnimal] || '🐾';
    
    // Gửi qua Socket.IO để các thành viên khác trong phòng nhận được tức thì
    if (socket && socketConnected) {
      socket.emit('new-activity', {
        nickname: userNickname,
        emoji: emoji,
        type: type,
        details: details || '',
        roomId: currentRoom
      });
    }

    try {
      await addDoc(collection(db, 'activity_feed'), {
        nickname: userNickname,
        emoji: emoji,
        type: type,
        details: details || '',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Lỗi khi thêm tin hoạt động:", error);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'activity_feed'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(list);
    }, (error) => {
      console.error("Lỗi khi lắng nghe bảng tin:", error);
    });
    return () => unsubscribe();
  }, []);

  // --- LOGIC TÁC VỤ (TÍNH TOÁN TRƯỚC) ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  const joinDataRef = useRef({
    nickname: userNickname,
    animalName: userAnimal,
    emoji: ANIMAL_EMOJIS[userAnimal] || '🙂',
    progress: 0,
    roomId: currentRoom,
    statusText: userStatus,
    isFocusing: false
  });

  useEffect(() => {
    joinDataRef.current = {
      nickname: userNickname,
      animalName: userAnimal,
      emoji: ANIMAL_EMOJIS[userAnimal] || '🙂',
      progress: Math.round((completedTasks / totalTasks) * 100) || 0,
      roomId: currentRoom,
      statusText: userStatus,
      isFocusing: isTimerRunning && pomodoroMode === 'work'
    };
  }, [userNickname, userAnimal, completedTasks, totalTasks, currentRoom, userStatus, isTimerRunning, pomodoroMode]);

  // --- SOCKET.IO INITIALIZATION ---
  useEffect(() => {
    if (!isNicknameSet) return;

    let isActive = true;

    // Kết nối Socket.IO
    const newSocket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Lắng nghe kết nối
    newSocket.on('connect', async () => {
      console.log('✅ Socket connected:', newSocket.id);
      setSocketConnected(true);
      setSocketId(newSocket.id);

      // Gửi thông tin user join (kèm roomId) từ ref mới nhất
      newSocket.emit('user-join', joinDataRef.current);

      // Load lịch sử tin nhắn theo phòng
      try {
        const res = await fetch(`${SOCKET_SERVER_URL}/api/rooms/${currentRoom}/messages`);
        if (res.ok && isActive) {
          const history = await res.json();
          setMessages(history);
        }
      } catch (error) {
        console.error('❌ Lỗi khi load lịch sử tin nhắn:', error);
      }

      // Load danh sách phòng đang hoạt động
      try {
        const roomsRes = await fetch(`${SOCKET_SERVER_URL}/api/rooms`);
        if (roomsRes.ok && isActive) setActiveRooms(await roomsRes.json());
      } catch (_) {}
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

      const isMe = message.nickname === userNickname || message.userId === newSocket.id;

      if (!isMe) {
        if (dndModeRef.current) {
          if (!showChatRef.current) {
            setUnreadCount(prev => prev + 1);
          }
        } else {
          playChatSound('receive');
          setShowChat(true);
        }
      }

      // Desktop notification cho tin nhắn mới từ người khác
      if (!isMe && !dndModeRef.current && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${message.emoji || '💬'} ${message.nickname} vừa nhắn`, {
          body: message.message || message.text,
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
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    });

    // Lắng nghe người dùng đang gõ
    newSocket.on('user-typing', (data) => {
      console.log('✍️ User typing:', data);
      const { userId, nickname, isTyping } = data;
      setTypingUsers(prev => {
        const next = { ...prev };
        if (isTyping) {
          next[userId] = nickname;
        } else {
          delete next[userId];
        }
        return next;
      });
    });

    // Lắng nghe lỗi
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Lắng nghe hoạt động trực tiếp từ người khác
    newSocket.on('receive-activity', (data) => {
      console.log('📢 Realtime activity:', data);
      playChatSound('receive');
      
      let actionText = '';
      if (data.type === 'join') {
        actionText = 'vừa gia nhập biệt đội!';
      } else if (data.type === 'task_complete') {
        actionText = 'đã hoàn thành nhiệm vụ:';
      } else if (data.type === 'quiz_create') {
        actionText = 'vừa tạo bộ đề mới:';
      } else if (data.type === 'flashcard_create') {
        actionText = 'vừa tạo bộ Flashcard mới:';
      } else {
        actionText = data.type || '';
      }

      setToastNotification({
        id: Date.now(),
        sender: data.nickname,
        emoji: data.emoji || '📢',
        text: `${actionText} ${data.details}`
      });
    });

    // Lắng nghe cập nhật học chung trong phòng
    newSocket.on('study-session-updated', (session) => {
      console.log('📖 Study session updated:', session);
      setStudySession(session);
    });

    newSocket.on('study-session-ended', () => {
      console.log('⏹️ Study session ended');
      setStudySession(null);
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
  const handleSetNickname = async (nickname, animal) => {
    if (!nickname.trim()) return;
    
    localStorage.setItem('exam_master_nickname', nickname);
    localStorage.setItem('exam_master_animal', animal);
    setUserNickname(nickname);
    setUserAnimal(animal);
    setIsNicknameSet(true);

    try {
      const emoji = ANIMAL_EMOJIS[animal] || '🐾';
      await addDoc(collection(db, 'activity_feed'), {
        nickname: nickname,
        emoji: emoji,
        type: 'join',
        details: 'Vừa tham gia cộng đồng!',
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Lỗi log activity join:", e);
    }
    
    // Yêu cầu permission thông báo
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !socketConnected) return;

    if (!typingTimeoutRef.current) {
      socket.emit('typing', { isTyping: true });
    } else {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { isTyping: false });
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleTagUser = (nickname) => {
    setNewMessage(prev => {
      const trimmed = prev.trim();
      return trimmed === '' ? `@${nickname} ` : `${trimmed} @${nickname} `;
    });
    setSelectedOnlineUser(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !socketConnected) return;

    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing', { isTyping: false });
        typingTimeoutRef.current = null;
      }

      socket.emit('send-message', {
        text: newMessage,
        timestamp: Date.now(),
      });
      playChatSound('send');
      setNewMessage('');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      alert('❌ Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.');
    }
  };

  // --- LOGIC ĐỔI PHÒNG ---
  const handleChangeRoom = async (newRoom) => {
    const roomId = (newRoom || '').trim() || 'global';
    if (roomId === currentRoom) {
      setShowChangeRoom(false);
      return;
    }
    localStorage.setItem('exam_master_room', roomId);
    setCurrentRoom(roomId);
    setMessages([]);
    setTypingUsers({});
    setShowChangeRoom(false);
    setRoomInputModal('');

    setStudySession(null); // Reset study session khi chuyển phòng để tránh hiển thị nhầm dữ liệu phòng cũ

    if (socket && socketConnected) {
      socket.emit('user-join', {
        nickname: userNickname,
        animalName: userAnimal,
        emoji: ANIMAL_EMOJIS[userAnimal],
        progress: Math.round((completedTasks / totalTasks) * 100) || 0,
        roomId,
      });
      try {
        const res = await fetch(`${SOCKET_SERVER_URL}/api/rooms/${roomId}/messages`);
        if (res.ok) setMessages(await res.json());
      } catch (_) {}

      // Lấy trạng thái học nhóm của phòng mới
      try {
        const sessionRes = await fetch(`${SOCKET_SERVER_URL}/api/rooms/${roomId}/study-session`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setStudySession(sessionData);
        }
      } catch (_) {}
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/rooms`);
      if (res.ok) setActiveRooms(await res.json());
    } catch (_) {}
  };

  // Update user online status via Socket.IO
  useEffect(() => {
    if (!socket || !socketConnected) return;

    const updateUserStatus = () => {
      socket.emit('update-status', {
        online: true,
        progress: Math.round((completedTasks / totalTasks) * 100) || 0,
        statusText: userStatus,
        isFocusing: isTimerRunning && pomodoroMode === 'work'
      });
    };

    updateUserStatus();
    const interval = setInterval(updateUserStatus, 30000); // Update mỗi 30 giây

    return () => clearInterval(interval);
  }, [socket, socketConnected, completedTasks, totalTasks, userStatus, isTimerRunning, pomodoroMode]);

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
          setTotalStudySeconds(prev => {
            const newSeconds = prev + 1;
            localStorage.setItem('totalStudySeconds', newSeconds);
            return newSeconds;
          });
        }
      }, 1000);
    } else if (isTimerRunning && pomodoroTime === 0) {
      playAlarmSound();
      
      if (pomodoroMode === 'work') {
        addXP(50);
        setCreateQuizAttempts(prev => {
          const next = prev + 1;
          localStorage.setItem('createQuizAttempts', next);
          return next;
        });
        setTakeQuizAttempts(prev => {
          const next = prev + 3;
          localStorage.setItem('takeQuizAttempts', next);
          return next;
        });
        setToastNotification({
          emoji: '🏆',
          title: 'Hoàn thành Pomodoro!',
          message: 'Bạn được cộng 50 XP, +1 lượt tạo đề & +3 lượt làm đề!'
        });
        setTimeout(() => setToastNotification(null), 5000);

        setPomodoroSessionCount(prev => {
          const next = prev + 1;
          if (next >= 4) {
            unlockBadge('Pomodoro Master');
          }
          return next;
        });
      }

      const nextMode = pomodoroMode === 'work' ? 'break' : 'work';
      setPomodoroMode(nextMode);
      setPomodoroTime(nextMode === 'work' ? workMinutes * 60 : breakMinutes * 60);
      
      if (!isAutoStart) {
        setIsTimerRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime, pomodoroMode, workMinutes, breakMinutes, isAutoStart]);

  // Tự động đồng bộ thời gian học lên Firebase và Thử thách đồng đội mỗi 10 giây học thực tế
  useEffect(() => {
    if (isTimerRunning && pomodoroMode === 'work' && userNickname) {
      if (totalStudySeconds > 0 && totalStudySeconds % 10 === 0) {
        const syncStudyTime = async () => {
          try {
            const docRef = doc(db, 'user_study_times', userNickname);
            await setDoc(docRef, {
              nickname: userNickname,
              totalSeconds: totalStudySeconds,
              updatedAt: serverTimestamp()
            }, { merge: true });

            // Đồng bộ Thử thách nhóm
            if (currentRoom) {
              const groupChallengeRef = doc(db, 'group_challenges', currentRoom);
              await setDoc(groupChallengeRef, {
                secondsEarned: increment(10),
                [`contributors.${userNickname}`]: increment(10),
                lastUpdated: serverTimestamp()
              }, { merge: true });
            }
          } catch (error) {
            console.error("Lỗi đồng bộ thời gian học:", error);
          }
        };
        syncStudyTime();
      }
    }
  }, [totalStudySeconds, isTimerRunning, pomodoroMode, userNickname, currentRoom]);

  // Đồng bộ thời gian học từ local lên Firebase lúc khởi động hoặc đổi nickname
  useEffect(() => {
    if (userNickname && totalStudySeconds > 0) {
      const syncInitialTime = async () => {
        try {
          const docRef = doc(db, 'user_study_times', userNickname);
          await setDoc(docRef, {
            nickname: userNickname,
            totalSeconds: totalStudySeconds,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Lỗi đồng bộ ban đầu:", error);
        }
      };
      syncInitialTime();
    }
  }, [userNickname]);

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

  const fetchStudyLeaderboard = async () => {
    setLoadingStudyLeaderboard(true);
    setShowStudyLeaderboard(true);
    try {
      const q = query(
        collection(db, 'user_study_times'),
        orderBy('totalSeconds', 'desc'),
        limit(15)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudyLeaderboardScores(data);
    } catch (error) {
      console.error("Lỗi lấy BXH học tập:", error);
    }
    setLoadingStudyLeaderboard(false);
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
    localStorage.setItem('exam_master_mascot', pomodoroMascot);
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
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Vừa xong';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'task') return act.type === 'task_complete';
    if (activityFilter === 'quiz') return act.type === 'quiz_create' || act.type === 'flashcard_create';
    if (activityFilter === 'join') return act.type === 'join';
    return true;
  });

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
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        if (newCompleted && userNickname) {
          addActivityToFeed('task_complete', task.title);
          addXP(10);
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
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
          subtasks: task.subtasks.map(st => {
            if (st.id === subtaskId) {
              const nextCompleted = !st.completed;
              if (nextCompleted && userNickname) {
                addXP(5);
              }
              return { ...st, completed: nextCompleted };
            }
            return st;
          })
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

  const BADGES_LIST = [
    { name: 'Chiến thần Hóa Sinh', emoji: '🍎', desc: 'Trả lời đúng liên tục 15 câu hóa sinh.' },
    { name: 'Pomodoro Master', emoji: '🍅', desc: 'Hoàn thành 4 chu kỳ Pomodoro liên tục không dừng.' },
    { name: 'Người kiến tạo', emoji: '🤝', desc: 'Đóng góp 3 bộ đề trắc nghiệm cho cộng đồng.' }
  ];

  const getPetDisplay = () => {
    let petMascot = '🥚';
    let petStage = 'Ấu Trùng Trứng Pet';
    if (userLevel >= 3 && userLevel <= 5) {
      petMascot = '🐰';
      petStage = 'Thỏ Thiếu Niên Cute';
    } else if (userLevel >= 6) {
      petMascot = '🐇⚔️';
      petStage = 'Chiến Binh Thỏ Thần';
    }

    let petStatus = 'Đang nghỉ ngơi';
    let petActionEmoji = '💤';
    if (isTimerRunning && pomodoroMode === 'work') {
      petActionEmoji = '📚✍️';
      petStatus = 'Đang cùng bạn học tập cực kỳ chăm chỉ';
    } else if (isTimerRunning && pomodoroMode === 'break') {
      petActionEmoji = '☕🌱';
      petStatus = 'Đang cùng bạn thưởng trà nghỉ ngơi';
    } else {
      petActionEmoji = '💤';
      petStatus = 'Đang ngủ say nạp năng lượng';
    }

    return { mascot: petMascot, stage: petStage, status: petStatus, actionEmoji: petActionEmoji };
  };

  const petInfo = getPetDisplay();

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

  // Quản lý các view qua conditional rendering trong khối return chính để giữ Chat widget luôn hoạt động
  const getThemeClasses = () => {
    switch (appTheme) {
      case 'white':
        return 'bg-white text-slate-900';
      case 'black':
        return 'dark-theme';
      case 'pink':
        return 'pink-theme';
      case 'mint':
        return 'mint-theme';
      case 'sunset':
        return 'sunset-theme';
      case 'cosmic':
        return 'cosmic-theme';
      case 'cyberpunk':
        return 'cyberpunk-theme';
      case 'default':
      default:
        return 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50 text-slate-800';
    }
  };

  return (
    <div className={`min-h-screen font-sans p-4 md:p-6 lg:p-8 transition-colors duration-500 ${getThemeClasses()}`}>
      
      {/* TOAST ACHIEVEMENT HUY HIỆU */}
      {toastBadge && (
        <div className="fixed top-4 right-4 z-[999] bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3 border border-amber-300 animate-bounce max-w-sm">
          <div className="text-3xl">🏆</div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">Thành Tựu Mới!</div>
            <div className="font-bold text-sm">Bạn đã mở khóa huy hiệu:</div>
            <div className="font-black text-lg underline">{toastBadge}</div>
          </div>
        </div>
      )}

      {/* LEVEL UP MODAL CỰC KỲ LỘNG LẪY */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-indigo-900 to-purple-900 text-white rounded-3xl p-8 max-w-md w-full border border-indigo-400 shadow-2xl relative text-center overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Pháo hoa giả lập bằng css */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden animate-[pulse_3s_infinite]">
              <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-20 right-10 w-3 h-3 bg-pink-500 rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-700"></div>
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="text-7xl animate-[bounce_1.5s_infinite]">🎉</div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent uppercase tracking-wider">
                  Thăng Cấp!
                </h3>
                <p className="text-sm font-semibold text-indigo-200">
                  Chúc mừng {userNickname || 'Học viên'} đã vươn lên tầm cao mới!
                </p>
              </div>

              <div className="flex justify-center items-center gap-6 py-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center w-24">
                  <div className="text-xs text-slate-300 font-bold uppercase">Trước</div>
                  <div className="text-3xl font-black text-slate-400">{lastLevelUp - 1}</div>
                </div>
                <div className="text-3xl">➡️</div>
                <div className="bg-amber-500/20 rounded-2xl p-4 border border-amber-400/30 text-center w-24 animate-[pulse_2s_infinite]">
                  <div className="text-xs text-amber-300 font-bold uppercase">Sau</div>
                  <div className="text-3xl font-black text-yellow-300">{lastLevelUp}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3 text-left">
                <span className="text-3xl">🦊</span>
                <div>
                  <div className="text-xs font-bold text-slate-400">Trạng thái Thú Cưng</div>
                  <div className="text-sm font-bold text-slate-200">
                    {lastLevelUp >= 6 ? 'Thú cưng đã tiến hóa thành Chiến Binh Dũng Mãnh! ⚔️' : lastLevelUp >= 3 ? 'Thú cưng đã tiến hóa thành Thỏ Thiếu Niên Dễ Thương! 🐰' : 'Ấu trùng Trứng Thú Cưng đang lớn dần! 🥚'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-black py-3 rounded-2xl transition-all shadow-lg active:scale-95 animate-pulse"
              >
                Tuyệt vời, Tiếp tục thôi! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        {/* CONDITIONAL SUB-PAGES */}
        {showSharedStudyRoom ? (
          <SharedStudyRoom
            socket={socket}
            socketConnected={socketConnected}
            currentRoom={currentRoom}
            userNickname={userNickname}
            userAnimal={userAnimal}
            addXP={addXP}
            onClose={() => { setShowSharedStudyRoom(false); handleChangeRoom('global'); }}
            studySession={studySession}
            setStudySession={setStudySession}
            handleChangeRoom={handleChangeRoom}
          />
        ) : showTimetable ? (
          <Timetable onClose={() => setShowTimetable(false)} />
        ) : showCommunityQuiz ? (
          <CommunityQuiz 
            onClose={() => setShowCommunityQuiz(false)} 
            nickname={userNickname} 
            onActivityCreated={addActivityToFeed} 
            addXP={addXP} 
            unlockBadge={unlockBadge} 
            createQuizAttempts={createQuizAttempts}
            takeQuizAttempts={takeQuizAttempts}
            decrementCreateAttempts={decrementCreateAttempts}
            decrementTakeAttempts={decrementTakeAttempts}
          />
        ) : showBioChem ? (
          <BioChemQuiz onClose={() => setShowBioChem(false)} addXP={addXP} unlockBadge={unlockBadge} />
        ) : showFlashcards ? (
          <FlashcardsHub onClose={() => setShowFlashcards(false)} nickname={userNickname} onActivityCreated={addActivityToFeed} />
        ) : (
          <>
            {/* HEADER */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 shadow-sm overflow-hidden shrink-0">
                <img src={cuteMangoLogo} className="w-full h-full object-cover" alt="Cute Mango Logo" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Exam Master</h1>
                <p className="text-sm text-slate-500 mt-1">Kỷ luật là cầu nối giữa mục tiêu và thành tựu.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap gap-3">
              {/* Button Quiz Cộng Đồng */}
              <button 
                onClick={() => setShowCommunityQuiz(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition font-semibold text-sm shadow-md"
                title="Kho Trắc Nghiệm Cộng Đồng"
              >
                <BrainCircuit className="w-4 h-4" />
                Kho Đề
              </button>

              {/* Shortcut Thời Khóa Biểu */}
              <button 
                onClick={() => setShowTimetable(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition font-semibold text-sm"
                title="Xem thời khóa biểu"
              >
                <Calendar className="w-4 h-4" />
                TKB
              </button>

              {/* Shortcut Học Hóa Sinh */}
              <a 
                href="/hoacsinh-game.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition font-semibold text-sm shadow-md"
                title="Game học Hóa Sinh"
              >
                <Stethoscope className="w-4 h-4" />
                Hóa Sinh
              </a>

              {/* Shortcut Góc Flashcard */}
              <button 
                onClick={() => setShowFlashcards(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl transition font-semibold text-sm shadow-md"
                title="Góc Ghi Chú / Flashcard"
              >
                <BookOpen className="w-4 h-4" />
                Flashcard
              </button>

              {/* Button Tùy Biến Giao Diện & Cài Đặt */}
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-2xl transition font-semibold text-sm shadow-md"
                title="Cài đặt & Tùy biến màu sắc"
              >
                <Palette className="w-4 h-4" />
                🎨 Tùy biến
              </button>

              {/* Button Phòng Học Chung */}
              <button 
                onClick={() => setShowSharedStudyRoom(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition font-semibold text-sm shadow-md animate-pulse"
                title="Phòng Học Nhóm & Vote bài tập"
              >
                <Users className="w-4 h-4" />
                Phòng Học
              </button>

              {/* Button Chat */}
              {isNicknameSet && (
                <button 
                  onClick={() => { setShowChat(!showChat); if (!showChat) setUnreadCount(0); }}
                  className="relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition font-semibold text-sm"
                  title="Mở chat"
                >
                  <MessageCircle className="w-4 h-4" />
                  💬 Chat
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : usersOnline.length > 0 ? (
                    <span className="ml-1 bg-white/30 px-2 py-0.5 rounded-full text-xs font-bold">
                      {usersOnline.length}
                    </span>
                  ) : null}
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
            <div className="text-xs text-emerald-600 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Dữ liệu được lưu tự động
            </div>
          </div>
        </header>

        <div className="mt-4 overflow-x-auto">
          <div className="flex gap-4 min-w-[420px] pb-2 pt-2 scrollbar-thin scrollbar-thumb-indigo-200">
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
        </div>

        {/* BẢNG THÔNG BÁO HOẠT ĐỘNG HÀNG NGÀY (DAILY ACTIVITY BULLETIN BOARD) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h3 className="text-lg lg:text-xl font-black text-white flex items-center gap-2">
                  📢 Bảng Thông Báo Hoạt Động Hàng Ngày
                </h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/20">Trực Tiếp</span>
              </div>

              {/* Filter Tabs in banner */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'task', label: 'Nhiệm vụ' },
                  { id: 'quiz', label: 'Tạo đề' },
                  { id: 'join', label: 'Thành viên' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivityFilter(tab.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      activityFilter === tab.id
                        ? 'bg-white text-indigo-950 border-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-indigo-200 border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Displaying 3 most recent filtered activities in a gorgeous grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredActivities.length === 0 ? (
                <div className="col-span-3 text-center py-6 text-indigo-200/60 font-medium italic text-xs">
                  📡 Chưa có hoạt động nào trong ngày. Hãy bắt đầu hoạt động để bảng tin sinh động hơn nhé! 🌟
                </div>
              ) : (
                filteredActivities.slice(0, 3).map(act => {
                  let actionText = '';
                  let cardBg = 'bg-white/5 border-white/5';
                  let iconBg = 'bg-white/10 text-slate-200';
                  let detailText = act.details;

                  if (act.type === 'join') {
                    actionText = 'vừa gia nhập biệt đội!';
                    cardBg = 'bg-blue-500/10 border-blue-500/10';
                    iconBg = 'bg-blue-500/20 text-blue-300 border border-blue-500/20';
                  } else if (act.type === 'task_complete') {
                    actionText = 'đã hoàn thành nhiệm vụ:';
                    cardBg = 'bg-emerald-500/10 border-emerald-500/10';
                    iconBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20';
                  } else if (act.type === 'quiz_create') {
                    actionText = 'vừa tạo bộ đề mới:';
                    cardBg = 'bg-fuchsia-500/10 border-fuchsia-500/10';
                    iconBg = 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/20';
                  } else if (act.type === 'flashcard_create') {
                    actionText = 'vừa tạo bộ Flashcard mới:';
                    cardBg = 'bg-pink-500/10 border-pink-500/10';
                    iconBg = 'bg-pink-500/20 text-pink-300 border border-pink-500/20';
                  }

                  return (
                    <div key={act.id} className={`flex gap-3 p-3.5 border rounded-2xl transition-all hover:bg-white/10 ${cardBg}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold ${iconBg}`}>
                        {act.emoji || '🐾'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-bold text-white text-xs truncate flex items-center gap-1">
                            {act.nickname}
                            {act.nickname === userNickname && (
                              <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">Bạn</span>
                            )}
                          </span>
                          <span className="text-[9px] text-indigo-300 font-semibold shrink-0">
                            {getRelativeTime(act.timestamp)}
                          </span>
                        </div>
                        <p className="text-indigo-200/70 text-xs mt-1 font-medium leading-relaxed">
                          {actionText} {detailText && <span className="font-bold text-white block mt-0.5 truncate" title={detailText}>{detailText}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

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

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">🦊 Thú cưng / Nhân vật đồng hành</label>
                      <select 
                        value={pomodoroMascot}
                        onChange={(e) => setPomodoroMascot(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 font-bold mb-2 cursor-pointer"
                      >
                        <option value="auto">Tự động (Học: Sách / Nghỉ: Bé Gái)</option>
                        <option value="rotate">Luân phiên (Tự động đổi mỗi 15s)</option>
                        <option value="book">Sách Ma Thuật</option>
                        <option value="girl">Bé Gái Thư Giãn</option>
                        <option value="demon">Demon Slayer (Gươm Diệt Quỷ)</option>
                        <option value="lofi">Lofi Anime Girl</option>
                      </select>
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
                      <img 
                        src={
                          pomodoroMascot === 'auto' 
                            ? (pomodoroMode === 'work' ? bookReadGif : girlEatGif)
                            : pomodoroMascot === 'rotate' ? ALL_GIFS[currentGifIndex]
                            : pomodoroMascot === 'book' ? bookReadGif
                            : pomodoroMascot === 'girl' ? girlEatGif
                            : pomodoroMascot === 'demon' ? demonSlayerGif
                            : giphyGif
                        } 
                        alt="Pomodoro mascot" 
                        className="w-40 h-40 object-cover rounded-3xl mb-4 shadow-sm border-2 border-white"
                      />
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
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={fetchStudyLeaderboard}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-2 rounded-xl transition-all shadow-md text-xs shrink-0 active:scale-95"
                    title="Bảng xếp hạng học tập"
                  >
                    🏆 BXH
                  </button>
                  <div className="p-2.5 bg-emerald-100/50 rounded-xl shrink-0">
                    <Clock className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET THÚ CƯNG & CẤP ĐỘ HỌC TẬP GAMIFICATION */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6 relative overflow-hidden group">
              {/* Decorative gradient blur */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-6 -mt-6 transition-all duration-500 group-hover:bg-purple-100"></div>
              
              <div className="relative z-10 space-y-5">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">🦊</span>
                  Thú Cưng & Cấp Độ
                </h2>

                {/* Level and XP Section */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md animate-pulse">
                        Lv{userLevel}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Học viên</div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-slate-700 truncate max-w-[120px]" title={userNickname || 'Khách'}>
                            {userNickname || 'Khách'}
                          </span>
                          <button 
                            onClick={() => setShowSettingsModal(true)} 
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                            title="Đổi tên & cấu hình"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      {userXP} / {userLevel * 100} XP
                    </span>
                  </div>

                  {/* XP Bar */}
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
                    <div 
                      style={{ width: `${Math.min(100, Math.round((userXP / (userLevel * 100)) * 100))}%` }} 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Pet Interactivity Box */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 rounded-2xl border border-indigo-100/50 flex items-center gap-4">
                  <div className="text-5xl animate-[bounce_2s_infinite] shrink-0 select-none">
                    {petInfo.mascot}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-indigo-700 uppercase tracking-widest">{petInfo.stage}</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{petInfo.status}</div>
                    <div className="inline-flex items-center gap-1 bg-white/80 border border-indigo-100/50 px-2 py-0.5 rounded-lg mt-2 text-[10px] font-bold text-slate-600">
                      <span>{petInfo.actionEmoji}</span>
                      <span>Hoạt động</span>
                    </div>
                  </div>
                </div>

                {/* Badges Box */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏆</span> Huy hiệu danh giá
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {BADGES_LIST.map((badge, idx) => {
                      const hasBadge = userBadges.includes(badge.name);
                      return (
                        <div 
                          key={idx}
                          className={`relative group/badge p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            hasBadge 
                              ? 'bg-amber-50/40 border-amber-200 shadow-sm' 
                              : 'bg-slate-50/60 border-slate-100 opacity-40 grayscale'
                          }`}
                          title={`${badge.name}: ${badge.desc}`}
                        >
                          <span className="text-2xl mb-1">{badge.emoji}</span>
                          <span className="text-[9px] font-extrabold leading-tight text-slate-600 line-clamp-1">{badge.name}</span>
                          
                          {/* Rich Tooltip on Hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover/badge:block w-40 bg-slate-800 text-white rounded-lg p-2 text-[9px] font-bold z-50 shadow-xl border border-slate-700 leading-normal pointer-events-none">
                            <div className="text-amber-400 font-black">{badge.name}</div>
                            <div className="text-slate-300 mt-0.5">{badge.desc}</div>
                            <div className="text-[8px] mt-1 text-slate-400 italic">
                              {hasBadge ? '✓ Đã mở khóa' : '○ Chưa hoàn thành'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET GHI CHÚ NHANH & TÂM TRẠNG HỌC TẬP */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>📒</span>
                Góc Tập Trung & Ghi Chú Nháp
              </h2>

              {/* Mood Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tâm trạng hiện tại</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentMoodObj.color}`}>
                    {currentMoodObj.label}
                  </span>
                </div>
                
                <div className="flex justify-between gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  {MOODS.map(m => (
                    <button
                      key={m.emoji}
                      type="button"
                      onClick={() => setStudyMood(m.emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                        studyMood === m.emoji 
                          ? 'bg-white shadow-md border-2 border-indigo-400 scale-110 active:scale-95' 
                          : 'hover:bg-slate-100 hover:scale-105 active:scale-95 opacity-70'
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 text-[11px] font-medium text-indigo-900 italic leading-relaxed">
                  {currentMoodObj.quote}
                </div>
              </div>

              {/* Smart Scratchpad */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú nháp thông minh</label>
                  <div className="flex gap-1.5 items-center">
                    {/* Color chooser */}
                    {[
                      { id: 'yellow', class: 'bg-amber-100 border-amber-300' },
                      { id: 'rose', class: 'bg-rose-100 border-rose-300' },
                      { id: 'emerald', class: 'bg-emerald-100 border-emerald-300' },
                      { id: 'sky', class: 'bg-sky-100 border-sky-300' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setScratchpadColor(c.id)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${c.class} ${
                          scratchpadColor === c.id ? 'ring-2 ring-indigo-500 scale-125' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative group/note">
                  <textarea
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    placeholder="Ghi nhanh công thức, từ vựng hoặc ý tưởng vào đây... Dữ liệu tự động lưu!"
                    rows={4}
                    className={`w-full p-4 rounded-2xl border text-sm font-medium focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all resize-none shadow-inner ${
                      scratchpadColor === 'yellow' ? 'bg-amber-50/50 text-amber-900 border-amber-200' :
                      scratchpadColor === 'rose' ? 'bg-rose-50/50 text-rose-900 border-rose-200' :
                      scratchpadColor === 'emerald' ? 'bg-emerald-50/50 text-emerald-900 border-emerald-200' :
                      'bg-sky-50/50 text-sky-900 border-sky-200'
                    }`}
                  />
                  
                  {/* Floating Action Buttons inside textarea wrapper */}
                  <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover/note:opacity-100 transition-opacity duration-300">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scratchpadText);
                        alert('✓ Đã copy ghi chú vào bộ nhớ tạm!');
                      }}
                      disabled={!scratchpadText}
                      className="px-2.5 py-1.5 bg-white/95 hover:bg-indigo-500 hover:text-white rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 shadow-sm transition-colors active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600"
                      title="Sao chép toàn bộ ghi chú"
                    >
                      📋 Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn xoá nháp này?')) setScratchpadText('');
                      }}
                      disabled={!scratchpadText}
                      className="px-2.5 py-1.5 bg-white/95 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 shadow-sm transition-colors active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600"
                      title="Xóa nháp"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET THỬ THÁCH ĐỒNG ĐỘI (SIDEBAR GROUP STUDY CHALLENGE) */}
            {currentRoom && (
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-400/20">
                      ⚔️ Thử thách nhóm
                    </div>
                    <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold">Phòng: {currentRoom}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white leading-snug">Chung sức tích lũy 10 giờ học Pomodoro!</h4>
                    <p className="text-[10px] text-indigo-200/80 font-medium leading-relaxed">Mỗi giây bạn tập trung học Pomodoro trong phòng sẽ đóng góp vào mục tiêu chung thời gian thực.</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-baseline text-[10px] font-bold">
                      <span className="text-indigo-300">Đã tích lũy:</span>
                      <span className="text-xs font-black text-amber-400">
                        {Math.round(groupChallenge.secondsEarned / 60)} phút / 600 phút
                      </span>
                    </div>
                    
                    {/* 3D Gradient Progress Bar */}
                    <div className="h-3.5 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-indigo-500/30 shadow-inner relative">
                      <div 
                        style={{ width: `${Math.min(100, Math.round((groupChallenge.secondsEarned / 36000) * 100))}%` }} 
                        className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite]"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>0%</span>
                      <span className="text-amber-400 animate-pulse font-black">
                        {Math.min(100, Math.round((groupChallenge.secondsEarned / 36000) * 100))}% Hoàn thành
                      </span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Contributors Box */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-2 pt-2">
                    <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                      <span>🏆</span> Bảng vàng đóng góp
                    </div>
                    
                    <div className="space-y-1.5 max-h-[85px] overflow-y-auto scrollbar-thin">
                      {Object.entries(groupChallenge.contributors || {}).length === 0 ? (
                        <div className="text-[10px] text-slate-400 italic text-center py-2">Chưa có ai đóng góp.</div>
                      ) : (
                        Object.entries(groupChallenge.contributors || {})
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([name, seconds], idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-bold py-0.5 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                                <span className="text-[10px] text-amber-400">
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                </span>
                                <span className="text-slate-200 truncate">{name}</span>
                              </div>
                              <span className="text-[10px] text-indigo-300 font-black">{Math.round(seconds / 60)}p</span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          </>
        )}

        {/* MODAL NHẬP NICKNAME & PHÒNG */}
        {!isNicknameSet && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
                Tham gia Chat
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
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">🚪 Mã phòng học (tuỳ chọn)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        id="chatRoom"
                        defaultValue={currentRoom === 'global' ? '' : currentRoom}
                        placeholder="Để trống = phòng chung"
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700 uppercase"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Ví dụ: NHOM-A, TOAN12, ON-THI-DH...</p>
                </div>
                <button 
                  onClick={() => {
                    const nickname = document.getElementById('chatNickname').value;
                    const animal = document.getElementById('chatAnimal').value;
                    const roomRaw = (document.getElementById('chatRoom').value || '').trim();
                    const roomId = roomRaw === '' ? 'global' : roomRaw;
                    localStorage.setItem('exam_master_room', roomId);
                    setCurrentRoom(roomId);
                    handleSetNickname(nickname, animal);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <DoorOpen className="w-5 h-5" />
                  Vào phòng học!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CÀI ĐẶT & TÙY BIẾN GIAO DIỆN */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg border border-slate-100 animate-in zoom-in-95 duration-300 relative overflow-hidden text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Palette className="w-6 h-6 text-indigo-600 animate-pulse" />
                  Cài đặt & Tùy biến giao diện
                </h3>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body Content */}
              <div className="py-5 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                {/* 1. TÊN & THÚ CƯNG */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">👤 Thông tin cá nhân</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Nickname của bạn</label>
                      <input 
                        type="text" 
                        id="settingNickname"
                        defaultValue={userNickname}
                        placeholder="Nhập tên..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Con thú đại diện</label>
                      <select 
                        id="settingAnimal"
                        defaultValue={userAnimal}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 text-sm"
                      >
                        {ANIMAL_NAMES.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const nickname = document.getElementById('settingNickname').value.trim();
                      const animal = document.getElementById('settingAnimal').value;
                      if (!nickname) {
                        alert("Nickname không được để trống!");
                        return;
                      }
                      // Update nickname & animal
                      localStorage.setItem('exam_master_nickname', nickname);
                      localStorage.setItem('exam_master_animal', animal);
                      setUserNickname(nickname);
                      setUserAnimal(animal);
                      setIsNicknameSet(true);
                      
                      // Notify user
                      setToastNotification({
                        title: "Thành công!",
                        message: "Đã cập nhật thông tin cá nhân của bạn.",
                        type: "success"
                      });
                      setTimeout(() => setToastNotification(null), 3000);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
                  >
                    Lưu thông tin cá nhân
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* 2. CHẾ ĐỘ KHÔNG LÀM PHIỀN */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">🔕 Chế độ làm phiền</h4>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                        {dndMode ? "🔕 Không làm phiền đang BẬT" : "🔔 Không làm phiền đang TẮT"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Khi bật: Tin nhắn mới đến sẽ không tự động bật cửa sổ chat, không phát tiếng chuông báo và không hiển thị thông báo.
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newVal = !dndMode;
                        setDndMode(newVal);
                        localStorage.setItem('exam_master_dnd', String(newVal));
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${dndMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dndMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 3. TÙY CHỌN MÀU NỀN HỌC TẬP */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">🎨 Màu nền ứng dụng (Theme)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'default', name: 'Lavender', color: 'bg-indigo-100 border-indigo-300 text-indigo-700', preview: 'linear-gradient(to right, #6366f1, #8b5cf6)' },
                      { id: 'white', name: 'Trắng Sáng', color: 'bg-slate-50 border-slate-300 text-slate-800', preview: '#ffffff' },
                      { id: 'black', name: 'Đen Huyền', color: 'bg-slate-900 border-slate-700 text-slate-100', preview: '#090d16' },
                      { id: 'pink', name: 'Hồng Cute', color: 'bg-pink-100 border-pink-300 text-pink-700', preview: '#fff1f2' },
                      { id: 'mint', name: 'Bạc Hà', color: 'bg-emerald-100 border-emerald-300 text-emerald-700', preview: '#f0fdf4' },
                      { id: 'sunset', name: 'Hoàng Hôn', color: 'bg-amber-100 border-amber-300 text-amber-700', preview: '#fffbeb' },
                      { id: 'cosmic', name: 'Vũ Trụ', color: 'bg-indigo-950 border-indigo-900 text-indigo-200', preview: '#0b0720' },
                      { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-zinc-950 border-pink-500 text-yellow-400', preview: 'linear-gradient(45deg, #09090b, #ec4899)' },
                    ].map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setAppTheme(theme.id);
                          localStorage.setItem('exam_master_theme', theme.id);
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-center relative overflow-hidden group ${
                          appTheme === theme.id ? 'border-indigo-600 scale-[1.02] shadow-md bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300 bg-white hover:scale-[1.01]'
                        }`}
                      >
                        <div 
                          style={{ background: theme.preview }}
                          className="w-10 h-10 rounded-full border border-slate-200 shadow-sm shrink-0 flex items-center justify-center font-bold text-xs text-white"
                        >
                          {appTheme === theme.id && '✓'}
                        </div>
                        <span className="text-xs font-black tracking-tight">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET CHATBOX */}
        {isNicknameSet && showChat && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col bg-white rounded-2xl shadow-2xl w-[360px] max-h-[550px] h-[calc(100vh-32px)] border border-slate-200 animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-2xl shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1">
                    Phòng: {currentRoom}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] opacity-90 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                    {socketConnected ? `${usersOnline.length} người đang online` : 'Đang kết nối...'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setShowChangeRoom(true); fetchActiveRooms(); }}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  title="Đổi phòng học"
                >
                  <DoorOpen className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Users Online Panel - Horizontal Scroll */}
            {usersOnline.length > 0 && (
              <>
                {/* Cài đặt trạng thái cá nhân */}
                <div className="bg-white border-b border-slate-100 p-2 flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Trạng thái:</span>
                  <input 
                    type="text" 
                    value={userStatus}
                    onChange={(e) => {
                      setUserStatus(e.target.value);
                      setCustomStatus(e.target.value);
                    }}
                    placeholder="VD: Đang cày cuốc, Nghỉ ngơi..."
                    className="flex-1 text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-slate-600 font-medium"
                  />
                </div>

                <div className="bg-slate-50 border-b border-slate-100 p-3 flex gap-4 overflow-x-auto scrollbar-hide shrink-0 shadow-inner">
                  {usersOnline.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedOnlineUser(user)}
                      className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer group" 
                      title={`${user.nickname} - Hoàn thành ${user.progress}%`}
                    >
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Bánh xe tiến độ SVG */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-0">
                          <circle
                            cx="24"
                            cy="24"
                            r="21"
                            stroke="#e2e8f0"
                            strokeWidth="2.5"
                            fill="transparent"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="21"
                            stroke={user.isFocusing ? "#ef4444" : "#10b981"}
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 21}
                            strokeDashoffset={2 * Math.PI * 21 * (1 - (user.progress || 0) / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>

                        {/* Emoji Avatar ở giữa */}
                        <div className={`w-9 h-9 bg-white rounded-full flex items-center justify-center text-xl shadow-sm z-10 relative transition-transform group-hover:scale-105 ${user.isFocusing ? 'ring-2 ring-red-400 ring-offset-1 animate-pulse' : 'ring-1 ring-slate-100'}`}>
                          {user.emoji}
                        </div>

                        {/* Chấm Online */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-20"></div>

                        {/* Biểu tượng tập trung */}
                        {user.isFocusing && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-md z-20 animate-bounce" title="Đang tập trung học (Pomodoro)">
                            ⏱️
                          </div>
                        )}
                      </div>
                      
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center mt-0.5 flex items-center justify-center gap-0.5">
                        {user.nickname}
                        {user.progress > 0 && (
                          <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                            {user.progress}%
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate w-full text-center max-w-[60px]" title={`${user.statusText || 'Online'} (Phòng: ${user.roomId || 'global'})`}>
                        {user.statusText || (user.isFocusing ? 'Tập trung' : 'Online')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Messages Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ecef]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                  <MessageCircle className="w-12 h-12 mb-2" />
                  <p className="text-sm">Bắt đầu trò chuyện</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.nickname === userNickname || (socketId && msg.userId === socketId);
                  return (
                    <div key={msg.id || idx} className={`flex gap-2 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar for others */}
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-white flex flex-shrink-0 items-center justify-center shadow-sm text-sm border border-slate-200 mt-auto">
                          {msg.emoji || ANIMAL_EMOJIS[msg.animalName] || '💬'}
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-[11px] text-slate-500 font-medium mb-1 ml-1">{msg.nickname}</span>
                        )}
                        <div className={`px-3.5 py-2 shadow-sm text-[14px] leading-relaxed break-words ${
                          isMe 
                            ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm' 
                            : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-100'
                        }`}>
                          {msg.message || msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Chỉ báo đang gõ chữ (Typing Indicator) */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white/75 backdrop-blur-xs px-3 py-1.5 rounded-xl w-fit shadow-sm animate-pulse">
                  <span className="flex gap-0.5 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                  <span>
                    {Object.values(typingUsers).join(', ')} đang nhập...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
              <input 
                type="text" 
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 bg-slate-100 text-[14px] rounded-full focus:ring-0 focus:bg-slate-200 outline-none transition-colors text-slate-700"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-colors ${newMessage.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-slate-100 text-slate-400'}`}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>

            {/* Popup xem thông tin nhanh & Nhắc tên (Tag) */}
            {selectedOnlineUser && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs rounded-2xl flex items-center justify-center p-4 z-30 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl p-4 w-full max-w-[280px] shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in scale-in-95 duration-150">
                  <div className="relative mb-3 w-16 h-16 flex items-center justify-center">
                    {/* Vòng tiến độ SVG lớn */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="3" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={selectedOnlineUser.isFocusing ? "#ef4444" : "#10b981"}
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - (selectedOnlineUser.progress || 0) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-slate-100 z-10">
                      {selectedOnlineUser.emoji}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-base leading-tight">{selectedOnlineUser.nickname}</h4>
                  <p className="text-xs text-slate-400 font-medium mb-3">🐾 {selectedOnlineUser.animalName}</p>

                  <div className="w-full bg-slate-50 rounded-xl p-3 mb-4 text-left space-y-2 border border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Trạng thái:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]" title={selectedOnlineUser.statusText}>
                        {selectedOnlineUser.isFocusing ? '⏱️ Đang tập trung học' : (selectedOnlineUser.statusText || 'Đang học bài')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Phòng chat:</span>
                      <span className="font-bold text-indigo-600 truncate max-w-[140px] uppercase">
                        {selectedOnlineUser.roomId || 'global'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Tiến độ nhiệm vụ:</span>
                      <span className="font-bold text-emerald-600">{selectedOnlineUser.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${selectedOnlineUser.progress || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleTagUser(selectedOnlineUser.nickname)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      Nhắc tên
                    </button>
                    <button
                      onClick={() => setSelectedOnlineUser(null)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLOATING CHAT BUTTON (Modern Circle Widget) */}
        {isNicknameSet && (
          <button
            onClick={() => {
              setShowChat(!showChat);
              if (!showChat) setUnreadCount(0);
            }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group animate-bounce"
            title="Trò chuyện nhóm"
          >
            {showChat ? (
              <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
            
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white shadow-md border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : usersOnline.length > 0 ? (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] font-black text-white px-1.5 py-0.5 rounded-full shadow-md border border-white">
                {usersOnline.length}
              </span>
            ) : null}
          </button>
        )}

        {/* MODAL ĐỔI PHÒNG */}
        {showChangeRoom && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-indigo-600" />
                  Đổi phòng học
                </h3>
                <button onClick={() => setShowChangeRoom(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Nhập mã phòng mới</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      value={roomInputModal}
                      onChange={(e) => setRoomInputModal(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleChangeRoom(roomInputModal)}
                      placeholder="Mã phòng (VD: NHOM-A)"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 uppercase tracking-wider"
                    />
                  </div>
                  <button
                    onClick={() => handleChangeRoom(roomInputModal)}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Vào
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Để trống và nhấn "Vào" để về phòng chung (global)</p>
              </div>

              {/* Phòng đang hoạt động */}
              {activeRooms.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📡 Phòng đang có người:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activeRooms.map(room => (
                      <button
                        key={room.roomId}
                        onClick={() => handleChangeRoom(room.roomId)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                          room.roomId === currentRoom
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 opacity-60" />
                          <span className="font-bold text-sm">{room.roomId}</span>
                          {room.roomId === currentRoom && <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">Đang ở đây</span>}
                        </div>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          👥 {room.userCount}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* IN-APP TOAST NOTIFICATION */}
        {toastNotification && (
          <div className="fixed bottom-24 right-4 z-[60] bg-white/95 backdrop-blur-sm border-l-4 border-blue-500 shadow-xl rounded-xl p-3 w-[300px] animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-xl shadow-inner border border-slate-200">
                {toastNotification.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{toastNotification.sender} vừa nhắn</p>
                <p className="text-sm font-semibold text-slate-800 line-clamp-2 mt-0.5 leading-snug">{toastNotification.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STUDY LEADERBOARD MODAL ==================== */}
        {showStudyLeaderboard && (
          <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Bảng Xếp Hạng Học Tập</h3>
                    <p className="text-xs text-slate-500 font-semibold">Tích lũy thời gian học thực tế của các chiến thần</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowStudyLeaderboard(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {loadingStudyLeaderboard ? (
                  <div className="flex flex-col justify-center items-center py-20 gap-3">
                    <div className="animate-spin w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm font-semibold text-slate-500">Đang tải bảng xếp hạng...</span>
                  </div>
                ) : studyLeaderboardScores.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                      <Award className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-700">Chưa có dữ liệu học tập</h4>
                    <p className="text-xs text-slate-400 mt-1">Hãy bật Pomodoro và tích lũy những giây đầu tiên nhé!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {studyLeaderboardScores.map((entry, idx) => {
                      const bgMedal = idx === 0 ? 'bg-yellow-100 text-yellow-700 font-bold' : idx === 1 ? 'bg-slate-100 text-slate-700 font-bold' : idx === 2 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-50 text-slate-500 font-semibold';
                      
                      return (
                        <div 
                          key={entry.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            entry.nickname === userNickname 
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm ${bgMedal}`}>
                              {idx + 1}
                            </span>
                            
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 font-sans">
                                {entry.nickname}
                                {entry.nickname === userNickname && (
                                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">Bạn</span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Cập nhật: {entry.updatedAt ? new Date(entry.updatedAt.seconds ? entry.updatedAt.seconds * 1000 : entry.updatedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-indigo-600">
                              {formatTotalStudyTime(entry.totalSeconds)}
                            </span>
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                              {entry.totalSeconds.toLocaleString()} giây
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
                  onClick={() => setShowStudyLeaderboard(false)}
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
