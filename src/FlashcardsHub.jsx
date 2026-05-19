import React, { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Play, Layers, 
  Trash2, Save, ArrowLeft, ArrowRight, BookOpen,
  RotateCcw, Users
} from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import catBookGif from './cat book GIF.gif';

export default function FlashcardsHub({ onClose, nickname, onActivityCreated }) {
  const [view, setView] = useState('hub'); // 'hub', 'creator', 'player'
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSet, setActiveSet] = useState(null);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'community_flashcards'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSets(data);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu flashcards:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'hub') {
      fetchSets();
    }
  }, [view]);

  // ==================== CREATOR VIEW ====================
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  const openCreateNew = () => {
    setCreateTitle('');
    setCreateDesc('');
    setCards([{ front: '', back: '' }]);
    setView('creator');
  };

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSaveSet = async () => {
    if (!createTitle.trim()) return alert('Vui lòng nhập tên bộ Flashcard!');
    if (cards.some(c => !c.front.trim() || !c.back.trim())) {
      return alert('Vui lòng điền đầy đủ cả 2 mặt cho tất cả thẻ!');
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'community_flashcards'), {
        title: createTitle,
        description: createDesc,
        author: nickname || 'Ẩn danh',
        plays: 0,
        createdAt: serverTimestamp(),
        cards: cards
      });
      alert('Tạo bộ Flashcard thành công!');
      if (onActivityCreated) {
        onActivityCreated('flashcard_create', createTitle);
      }
      setView('hub');
    } catch (error) {
      alert('LỖI FIREBASE:\n' + error.message);
    }
    setIsSaving(false);
  };

  const handleDeleteSet = async (setId, setTitle) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa bộ "${setTitle}" không?`)) return;
    try {
      await deleteDoc(doc(db, 'community_flashcards', setId));
      setSets(prev => prev.filter(s => s.id !== setId));
    } catch (error) {
      alert('Lỗi khi xóa: ' + error.message);
    }
  };

  // ==================== PLAYER VIEW ====================
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const startSet = async (set) => {
    setActiveSet(set);
    setCurrentCard(0);
    setIsFlipped(false);
    setView('player');
    
    // Tăng lượt xem
    if (set.id) {
      try {
        await updateDoc(doc(db, 'community_flashcards', set.id), {
          plays: (set.plays || 0) + 1
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const nextCard = () => {
    if (currentCard < activeSet.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCard(c => c + 1), 150); // Đợi lật lại trước khi đổi chữ
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCard(c => c - 1), 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl leading-tight">Góc Ghi Chú & Flashcard</h2>
            <p className="text-pink-100 text-xs">Ôn tập nhanh với thẻ nhớ</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ==================== HUB VIEW ==================== */}
        {view === 'hub' && (
          <div className="max-w-5xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm flashcard..."
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-medium shadow-sm transition-all"
                />
              </div>
              <button 
                onClick={openCreateNew}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" /> Tạo Bộ Thẻ
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
              </div>
            ) : sets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <img src={catBookGif} alt="Mèo đọc sách" className="w-40 h-40 object-cover rounded-2xl mx-auto mb-6 shadow-md" />
                <h3 className="text-xl font-bold text-slate-700">Chưa có bộ thẻ nào</h3>
                <p className="text-slate-500 mt-2">Hãy tạo bộ thẻ Flashcard đầu tiên để ôn tập!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sets.map(set => (
                  <div key={set.id} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all group flex flex-col">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-3">
                        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {set.cards?.length || 0} thẻ
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Users className="w-3 h-3" /> {set.plays || 0} lượt học
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{set.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{set.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {set.author?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-semibold text-slate-600">{set.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {set.author === nickname && (
                          <button
                            onClick={() => handleDeleteSet(set.id, set.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => startSet(set)}
                          className="flex items-center gap-1 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all"
                        >
                          <Play className="w-4 h-4" /> Học ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== CREATOR VIEW ==================== */}
        {view === 'creator' && (
          <div className="max-w-4xl mx-auto p-6 pb-24">
            <button onClick={() => setView('hub')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Quay lại
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Tạo Bộ Flashcard Mới</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên bộ thẻ *</label>
                  <input 
                    type="text" value={createTitle} onChange={e => setCreateTitle(e.target.value)}
                    placeholder="VD: 50 Từ vựng IELTS chủ đề Môi trường"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-slate-800 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả ngắn (tuỳ chọn)</label>
                  <textarea 
                    value={createDesc} onChange={e => setCreateDesc(e.target.value)}
                    placeholder="VD: Học mỗi ngày 10 từ để nhớ lâu..."
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-600 min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {cards.map((c, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative group flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Mặt trước (Thuật ngữ)</label>
                    <textarea 
                      value={c.front} onChange={e => handleCardChange(idx, 'front', e.target.value)}
                      placeholder="Nhập mặt trước..."
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-700 resize-none h-20"
                    />
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Mặt sau (Định nghĩa)</label>
                    <textarea 
                      value={c.back} onChange={e => handleCardChange(idx, 'back', e.target.value)}
                      placeholder="Nhập mặt sau..."
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-700 resize-none h-20"
                    />
                  </div>

                  <button onClick={() => handleRemoveCard(idx)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center">
              <button 
                onClick={handleAddCard}
                className="w-full md:w-auto px-6 py-4 bg-white border-2 border-slate-200 hover:border-pink-500 hover:text-pink-600 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" /> Thêm thẻ mới
              </button>
              
              <button 
                onClick={handleSaveSet} disabled={isSaving}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:-translate-y-1 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
                Lưu & Đăng Tải
              </button>
            </div>
          </div>
        )}

        {/* ==================== PLAYER VIEW ==================== */}
        {view === 'player' && activeSet && (
          <div className="max-w-3xl mx-auto p-6 flex flex-col min-h-full items-center">
            <div className="w-full flex justify-between items-center mb-8">
              <button onClick={() => setView('hub')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors">
                <ArrowLeft className="w-5 h-5" /> Thoát
              </button>
              <div className="font-bold text-slate-500">
                Thẻ {currentCard + 1} / {activeSet.cards.length}
              </div>
            </div>
            
            {/* Thanh tiến trình */}
            <div className="w-full bg-slate-200 h-2 rounded-full mb-10 overflow-hidden">
              <div 
                className="bg-pink-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentCard + 1) / activeSet.cards.length) * 100}%` }}
              />
            </div>

            {/* Thẻ 3D Flip */}
            <div 
              className="w-full aspect-[4/3] max-w-2xl perspective-1000 cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Mặt trước */}
                <div className="absolute w-full h-full bg-white rounded-3xl shadow-lg border-2 border-slate-100 backface-hidden flex items-center justify-center p-8 md:p-12 text-center group-hover:border-pink-300 transition-colors">
                  <div className="absolute top-4 left-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Mặt trước</div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-800 whitespace-pre-wrap">{activeSet.cards[currentCard].front}</h2>
                  <div className="absolute bottom-6 text-slate-300 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Bấm để lật
                  </div>
                </div>

                {/* Mặt sau */}
                <div className="absolute w-full h-full bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-3xl shadow-xl backface-hidden rotate-y-180 flex items-center justify-center p-8 md:p-12 text-center">
                  <div className="absolute top-4 left-4 text-xs font-bold text-pink-200 uppercase tracking-widest">Mặt sau (Định nghĩa)</div>
                  <p className="text-2xl md:text-4xl font-bold whitespace-pre-wrap leading-relaxed">{activeSet.cards[currentCard].back}</p>
                </div>
              </div>
            </div>

            {/* Nút điều hướng */}
            <div className="flex items-center gap-6 mt-12">
              <button 
                onClick={prevCard}
                disabled={currentCard === 0}
                className="p-4 bg-white border-2 border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-8 h-8 text-slate-700" />
              </button>
              
              <button 
                onClick={nextCard}
                disabled={currentCard === activeSet.cards.length - 1}
                className="p-4 bg-white border-2 border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowRight className="w-8 h-8 text-slate-700" />
              </button>
            </div>
            
            {currentCard === activeSet.cards.length - 1 && (
              <div className="mt-8 text-center animate-in slide-in-from-bottom-2">
                <p className="text-emerald-600 font-bold mb-4">Bạn đã ôn xong bộ thẻ này! 🎉</p>
                <button 
                  onClick={() => {
                    setCurrentCard(0);
                    setIsFlipped(false);
                  }}
                  className="px-6 py-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl font-bold transition-colors"
                >
                  Học lại từ đầu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
