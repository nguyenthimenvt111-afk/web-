'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState({ title: '', content: '' });

  useEffect(() => {
    // Chỉ hiển thị 1 lần mỗi khi mở trình duyệt (sessionStorage)
    const hasSeen = sessionStorage.getItem('has_seen_welcome');
    if (hasSeen) return;

    fetch('/api/settings/welcome')
      .then((res) => res.json())
      .then((settings) => {
        if (settings.enabled) {
          setData({ title: settings.title, content: settings.content });
          setShow(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('has_seen_welcome', 'true');
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.3)'
        }}
      >
        {/* Trang trí góc */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">{data.title}</h2>
          
          <div className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
            {data.content}
          </div>

          <button
            onClick={handleClose}
            className="w-full btn-primary py-2.5 font-medium"
          >
            Đã hiểu và tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
