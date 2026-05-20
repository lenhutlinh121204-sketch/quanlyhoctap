import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Users, CheckCircle2, ArrowRight, Lock, Unlock, Search, Play, X, 
  HelpCircle, Sparkles, MessageSquare, AlertCircle, Award, Volume2, BookOpen
} from 'lucide-react';

export default function SharedStudyRoom({ 
  socket, 
  socketConnected, 
  currentRoom, 
  userNickname, 
  userAnimal, 
  addXP, 
  onClose,
  studySession,
  setStudySession,
  handleChangeRoom
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const pendingQuizRef = useRef(null);

  // Web Audio API Synth Sound Player (no external assets needed)
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'vote') {
        // Simple synth chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'correct') {
        // Bright major chord
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((f, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + index * 0.05);
          gain.gain.setValueAtTime(0.08, now + index * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.05);
          osc.stop(now + 0.4);
        });
      } else if (type === 'reveal') {
        // Reveal chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (_) {}
  };

  // Fetch quizzes from Firebase
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const q = query(collection(db, 'community_quizzes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setQuizzes(data);
      } catch (err) {
        console.error('Lỗi lấy kho đề:', err);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Sync Room Users list from Socket
  useEffect(() => {
    if (!socket || !socketConnected) return;

    // Fetch active users in room initially
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${socket.io.uri}/api/rooms/${currentRoom}/users`);
        if (res.ok) setRoomUsers(await res.json());
      } catch (_) {}
    };
    fetchUsers();

    const handleUserJoined = () => fetchUsers();
    const handleUserLeft = () => fetchUsers();
    const handleStatusUpdated = () => fetchUsers();

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('user-status-updated', handleStatusUpdated);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('user-status-updated', handleStatusUpdated);
    };
  }, [socket, socketConnected, currentRoom]);

  // Audio effect triggers when studySession states change
  useEffect(() => {
    if (!studySession) return;
    if (studySession.revealed) {
      playSound('correct');
    }
  }, [studySession?.revealed]);

  // Tự động kích hoạt study session khi đã join vào phòng có tên trùng tên đề thi
  useEffect(() => {
    if (pendingQuizRef.current && currentRoom.trim() === pendingQuizRef.current.title.trim()) {
      const quiz = pendingQuizRef.current;
      pendingQuizRef.current = null; // Clear ref

      console.log(`[STUDY-INIT] Emitting start-study-session for room "${currentRoom}" with quiz "${quiz.title}"`);
      socket.emit('start-study-session', {
        quizTitle: quiz.title,
        questions: quiz.questions,
        roomId: currentRoom.trim()
      });
    }
  }, [currentRoom, socket]);

  // Handle actions
  const startQuizSession = (quiz) => {
    if (!socket || !socketConnected) {
      alert("❌ Chưa kết nối được máy chủ thời gian thực!");
      return;
    }
    if (!quiz.questions || quiz.questions.length === 0) {
      alert("❌ Đề thi này không có câu hỏi!");
      return;
    }
    
    if (currentRoom.trim() === quiz.title.trim()) {
      // Đã ở sẵn trong phòng này rồi, phát sự kiện bắt đầu học luôn
      console.log(`[STUDY-INIT] Already in target room. Emitting start-study-session for quiz "${quiz.title}"`);
      socket.emit('start-study-session', {
        quizTitle: quiz.title,
        questions: quiz.questions,
        roomId: currentRoom.trim()
      });
    } else {
      // Lưu thông tin đề thi cần mở
      pendingQuizRef.current = quiz;
      // Chuyển sang phòng học mang tên đề thi này luôn
      handleChangeRoom(quiz.title);
    }
  };

  const submitVote = (optionIndex) => {
    if (!socket || !socketConnected || !studySession || studySession.revealed) return;
    socket.emit('submit-vote', { optionIndex, roomId: currentRoom });
    playSound('vote');
  };

  const revealAnswer = () => {
    if (!socket || !socketConnected) return;
    socket.emit('reveal-answer', { roomId: currentRoom });
    
    // Add XP to voters of the correct option
    if (studySession) {
      const correctIdx = studySession.currentQuestion.correctIndex;
      const correctVoters = studySession.votes[correctIdx] || [];
      const hasVotedCorrectly = correctVoters.some(v => v.nickname === userNickname);
      if (hasVotedCorrectly) {
        addXP(15);
      }
    }
  };

  const nextQuestion = () => {
    if (!socket || !socketConnected) return;
    socket.emit('next-question', { roomId: currentRoom });
    playSound('reveal');
  };

  const endSession = () => {
    if (!socket || !socketConnected) return;
    if (window.confirm("Bạn muốn đóng buổi học chung và quay lại kho đề?")) {
      socket.emit('end-study-session', { roomId: currentRoom });
      // Quay trở lại phòng global
      handleChangeRoom('global');
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6 shadow-sm text-slate-800 animate-in fade-in duration-300">
      
      {/* HEADER ROOM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-inner-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
            👥
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              Phòng Học Nhóm: <span className="text-indigo-600 font-black tracking-wider uppercase bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{currentRoom}</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Bỏ phiếu làm trắc nghiệm chung & thảo luận trực tiếp.</p>
          </div>
        </div>

        {/* ONLINE PARTICIPANTS LIST */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Online: {roomUsers.length}
          </div>
          <div className="flex -space-x-2.5 overflow-hidden">
            {roomUsers.map((u, i) => (
              <div 
                key={u.id}
                title={`${u.nickname} (${u.animalName}) - ${u.statusText || 'Đang học'}`}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-sm shadow-sm transition-all hover:scale-115 hover:z-10 cursor-pointer"
              >
                {u.emoji}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 font-semibold ${
              soundEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title="Bật/Tắt âm thanh hiệu ứng"
          >
            <Volume2 className="w-4 h-4" />
            {soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}
          </button>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 transition-colors"
            title="Đóng phòng học"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE STUDY SESSION OR QUIZ SELECTOR */}
      {studySession && studySession.active ? (
        
        /* ------------------ ACTIVE QUIZ SCREEN ------------------ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Quiz Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${((studySession.currentIndex + 1) / studySession.questions.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-slate-400 tracking-wider">
                <span className="uppercase text-indigo-600">📖 Đề: {studySession.quizTitle}</span>
                <span>CÂU HỎI {studySession.currentIndex + 1} / {studySession.questions.length}</span>
              </div>

              {/* Question Text */}
              <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
                {studySession.currentQuestion?.questionText}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-4">
                {studySession.currentQuestion?.options.map((option, index) => {
                  const votesForThis = studySession.votes[index] || [];
                  const totalVotes = Object.values(studySession.votes).reduce((sum, list) => sum + list.length, 0);
                  const percentage = totalVotes > 0 ? Math.round((votesForThis.length / totalVotes) * 100) : 0;
                  const hasVotedThis = studySession.votedUsers[socket.id] === index;
                  const isCorrect = index === studySession.currentQuestion.correctIndex;
                  const isRevealed = studySession.revealed;

                  let optionStyle = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10";
                  if (hasVotedThis && !isRevealed) {
                    optionStyle = "border-indigo-600 bg-indigo-50/20";
                  }
                  if (isRevealed) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50/30 text-emerald-900 shadow-emerald-100/50 shadow-md ring-2 ring-emerald-500/20";
                    } else if (hasVotedThis) {
                      optionStyle = "border-rose-400 bg-rose-50/20 text-rose-900 ring-2 ring-rose-500/10";
                    } else {
                      optionStyle = "border-slate-100 opacity-60 bg-slate-50/50";
                    }
                  }

                  return (
                    <button
                      key={index}
                      disabled={isRevealed}
                      onClick={() => submitVote(index)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex items-center justify-between group ${optionStyle}`}
                    >
                      {/* Percent Fill Background for Voting Progress */}
                      {!isRevealed && percentage > 0 && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-indigo-500/5 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      )}

                      <div className="flex items-center gap-3 relative z-10 flex-1">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          hasVotedThis 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : isRevealed && isCorrect 
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-indigo-50'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="font-semibold text-sm md:text-base pr-3">{option}</span>
                      </div>

                      {/* Right-side Vote indicators */}
                      <div className="flex items-center gap-2.5 relative z-10 shrink-0">
                        {/* Vote Avatars list */}
                        {votesForThis.length > 0 && (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {votesForThis.map(voter => (
                              <span 
                                key={voter.socketId} 
                                title={voter.nickname}
                                className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-xs shadow-sm"
                              >
                                {voter.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        {totalVotes > 0 && (
                          <span className="text-xs font-bold text-slate-400 tracking-tight bg-slate-100/60 px-2 py-0.5 rounded-lg border border-slate-200/40">
                            {percentage}% ({votesForThis.length})
                          </span>
                        )}
                        {isRevealed && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status information & Host buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  Đã vote: {Object.values(studySession.votedUsers).length} / {roomUsers.length} thành viên
                </div>

                <div className="flex items-center gap-2">
                  {!studySession.revealed ? (
                    <button
                      onClick={revealAnswer}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs md:text-sm transition-all shadow-md flex items-center gap-1.5 hover:shadow-lg active:scale-95"
                    >
                      <Lock className="w-4 h-4" />
                      Khóa phiếu & Xem đáp án
                    </button>
                  ) : (
                    <>
                      {studySession.currentIndex < studySession.questions.length - 1 ? (
                        <button
                          onClick={nextQuestion}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs md:text-sm transition-all shadow-md flex items-center gap-1.5 hover:shadow-lg active:scale-95"
                        >
                          Câu tiếp theo
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                            🎉 Hoàn thành đề thi!
                          </span>
                          <button
                            onClick={endSession}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs md:text-sm transition-all"
                          >
                            Đóng buổi học
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <button
                    onClick={endSession}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs transition-colors"
                  >
                    Hủy làm bài
                  </button>
                </div>
              </div>
            </div>

            {/* AI EXPLANATION SECTION (slide style, shown only when revealed) */}
            {studySession.revealed && (
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-950 relative overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
                {/* Background glowing rings */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl"></div>

                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                      Slide Bài Giảng Giải Thích (AI Assistant)
                    </h4>
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest">
                      Chuyên gia
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Lecture bullet points parsed from explanation */}
                    <div className="space-y-3">
                      {(studySession.currentQuestion?.explanation || "Không có giải thích chi tiết cho câu hỏi này.")
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((line, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm md:text-base leading-relaxed text-indigo-100/90 font-medium">
                            <span className="text-yellow-400 mt-1 shrink-0">💡</span>
                            <p>{line.replace(/^[*\s•-]+/, '')}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Rewards Notification */}
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-400 animate-bounce shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Thành viên trả lời đúng:</div>
                      <div className="text-xs text-indigo-200">Được cộng trực tiếp +15 XP vào bảng xếp hạng!</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Chat Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col h-[500px] lg:h-auto shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 shrink-0">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Thảo luận bài tập
            </h4>
            
            {/* Embedded Instructions */}
            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/50 text-[11px] text-slate-500 mb-4 shrink-0 leading-normal">
              💬 Hãy mở widget chatbox góc phải bên dưới để thảo luận trực tiếp với bạn bè trong phòng học nhé!
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                💬
              </div>
              <p className="text-xs font-bold text-slate-500">Mở Chatbox phía dưới</p>
              <p className="text-[10px] text-slate-400 mt-1">Cửa sổ Chatbox đã được liên kết với phòng này.</p>
            </div>
          </div>

        </div>

      ) : (

        /* ------------------ QUIZ SELECTOR (KHO ĐỀ) SCREEN ------------------ */
        <div className="space-y-6">
          
          {/* SEARCH & TITLE */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Chọn đề từ Kho Đề trắc nghiệm
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Chọn một bộ đề thi để bắt đầu làm bài chung với cả phòng.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm đề, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-semibold"
              />
            </div>
          </div>

          {/* LOADING STATE */}
          {loadingQuizzes ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang tải kho đề...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-inner">
                🔍
              </div>
              <p className="font-bold text-slate-500 text-sm">Không tìm thấy đề trắc nghiệm phù hợp</p>
              <p className="text-xs text-slate-400">Hãy thử nhập từ khóa khác hoặc quay lại tạo đề mới ở màn hình chính.</p>
            </div>
          ) : (
            /* QUIZZES CARD GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div 
                  key={quiz.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 hover:shadow-md transition-all group hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                        {quiz.questions?.length || 0} câu hỏi
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {quiz.plays || 0} lượt làm
                      </span>
                    </div>

                    <h4 className="font-black text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1" title={quiz.title}>
                      {quiz.title}
                    </h4>
                    
                    <p className="text-xs text-slate-400 font-medium line-clamp-2" title={quiz.description}>
                      {quiz.description || "Không có mô tả chi tiết."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">
                      Tác giả: <span className="text-slate-600 font-semibold">{quiz.author || "Ẩn danh"}</span>
                    </span>

                    <button
                      onClick={() => startQuizSession(quiz)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 hover:shadow-md"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Làm chung
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
      
    </div>
  );
}
