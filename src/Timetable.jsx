import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, BookOpen, Calendar } from 'lucide-react';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 → 22:00
const SLOT_H = 60; // px mỗi giờ
const START_HOUR = 6;

const COLORS = [
  { bg: 'bg-blue-500',    text: 'text-white',      label: 'Xanh dương' },
  { bg: 'bg-violet-500',  text: 'text-white',      label: 'Tím' },
  { bg: 'bg-pink-500',    text: 'text-white',      label: 'Hồng' },
  { bg: 'bg-emerald-500', text: 'text-white',      label: 'Xanh lá' },
  { bg: 'bg-orange-500',  text: 'text-white',      label: 'Cam' },
  { bg: 'bg-red-500',     text: 'text-white',      label: 'Đỏ' },
  { bg: 'bg-amber-400',   text: 'text-slate-800',  label: 'Vàng' },
  { bg: 'bg-cyan-500',    text: 'text-white',      label: 'Cyan' },
];

function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function toPx(min) {
  return ((min - START_HOUR * 60) / 60) * SLOT_H;
}

const EMPTY_FORM = { day: 0, subject: '', startTime: '07:00', endTime: '09:00', location: '', colorIndex: 0 };

export default function Timetable({ onClose }) {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('exam_master_timetable') || '[]'); }
    catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  useEffect(() => {
    try { localStorage.setItem('exam_master_timetable', JSON.stringify(entries)); }
    catch {}
  }, [entries]);

  const openAdd = (day = todayIdx) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, day });
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({ day: entry.day, subject: entry.subject, startTime: entry.startTime, endTime: entry.endTime, location: entry.location || '', colorIndex: entry.colorIndex || 0 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.subject.trim()) return;
    if (toMin(form.endTime) <= toMin(form.startTime)) { alert('Giờ kết thúc phải sau giờ bắt đầu!'); return; }
    if (editing) {
      setEntries(prev => prev.map(e => e.id === editing.id ? { ...e, ...form } : e));
    } else {
      setEntries(prev => [...prev, { id: Date.now(), ...form }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => { setEntries(prev => prev.filter(e => e.id !== id)); setShowModal(false); };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Thời Khóa Biểu</h1>
            <p className="text-indigo-200 text-xs font-medium">Lịch học hàng tuần · Click vào môn để sửa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openAdd()} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Plus className="w-4 h-4" /> Thêm môn
          </button>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="w-14 shrink-0" />
        {DAYS.map((d, i) => (
          <div key={i} className={`flex-1 text-center py-3 border-l border-slate-100 ${i === todayIdx ? 'bg-indigo-50' : ''}`}>
            <p className={`text-sm font-bold ${i === todayIdx ? 'text-indigo-700' : 'text-slate-600'}`}>{d}</p>
            {i === todayIdx && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1" />}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${HOURS.length * SLOT_H}px` }}>
          {/* Time axis */}
          <div className="w-14 shrink-0 bg-white border-r border-slate-200">
            {HOURS.map(h => (
              <div key={h} style={{ height: SLOT_H }} className="relative border-b border-slate-100 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-slate-400 font-medium">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((_, dayIdx) => {
            const dayEntries = entries.filter(e => e.day === dayIdx);
            const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
            const currentPx = toPx(currentMin);
            const isToday = dayIdx === todayIdx;

            return (
              <div
                key={dayIdx}
                className={`flex-1 relative border-l border-slate-200 ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}
                style={{ minHeight: `${HOURS.length * SLOT_H}px` }}
              >
                {HOURS.map(h => (
                  <div key={h} style={{ height: SLOT_H }} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => openAdd(dayIdx)} />
                ))}
                
                {/* Live Time Indicator */}
                {isToday && currentMin >= START_HOUR * 60 && currentMin <= (START_HOUR + HOURS.length) * 60 && (
                  <div 
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: `${currentPx}px`, transform: 'translateY(-50%)' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse -ml-1"></div>
                    <div className="flex-1 h-0.5 bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                  </div>
                )}

                {dayEntries.map(entry => {
                  const c = COLORS[entry.colorIndex] || COLORS[0];
                  const top = toPx(toMin(entry.startTime));
                  const height = Math.max(((toMin(entry.endTime) - toMin(entry.startTime)) / 60) * SLOT_H, 28);
                  
                  const isLive = isToday && currentMin >= toMin(entry.startTime) && currentMin < toMin(entry.endTime);

                  return (
                    <div
                      key={entry.id}
                      onClick={(e) => { e.stopPropagation(); openEdit(entry); }}
                      className={`absolute left-1 right-1 ${c.bg} ${c.text} rounded-lg px-2 py-1 cursor-pointer hover:opacity-90 hover:shadow-md transition-all shadow-sm overflow-hidden z-10 ${isLive ? 'ring-2 ring-red-400 ring-offset-1 animate-pulse shadow-lg' : ''}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <p className="text-xs font-bold leading-tight truncate">{entry.subject}</p>
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping flex-shrink-0 mt-0.5" title="Đang diễn ra"></span>}
                      </div>
                      {height > 40 && (
                        <>
                          <p className="text-[10px] opacity-80">{entry.startTime} - {entry.endTime}</p>
                          {entry.location && <p className="text-[10px] opacity-70 truncate">📍 {entry.location}</p>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {editing ? 'Sửa môn học' : 'Thêm môn học'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Tên môn học *</label>
                <input type="text" value={form.subject} onChange={e => f('subject', e.target.value)} placeholder="VD: Toán, Văn, Tiếng Anh..." className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Ngày trong tuần</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((d, i) => (
                    <button key={i} onClick={() => f('day', i)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${form.day === i ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Bắt đầu</label>
                  <input type="time" value={form.startTime} onChange={e => f('startTime', e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Kết thúc</label>
                  <input type="time" value={form.endTime} onChange={e => f('endTime', e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Địa điểm (tuỳ chọn)</label>
                <input type="text" value={form.location} onChange={e => f('location', e.target.value)} placeholder="VD: Phòng 101, Online..." className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Màu sắc</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c, i) => (
                    <button key={i} onClick={() => f('colorIndex', i)} className={`w-8 h-8 rounded-full ${c.bg} transition-all ${form.colorIndex === i ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`} title={c.label} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {editing && (
                <button onClick={() => handleDelete(editing.id)} className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Xoá
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Huỷ</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                {editing ? 'Lưu thay đổi' : 'Thêm vào lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
