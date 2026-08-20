'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettings() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings/welcome')
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
        setEnabled(data.enabled);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/settings/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, enabled })
      });
      
      if (res.ok) {
        setMessage('✅ Đã lưu cài đặt thành công!');
      } else {
        setMessage('❌ Lỗi khi lưu cài đặt.');
      }
    } catch {
      setMessage('❌ Lỗi kết nối.');
    }
    
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" /> Cài đặt Hệ thống
          </h1>
          <p className="text-slate-400 mt-1">Tuỳ chỉnh các thông báo và chức năng web</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Thông báo Chào mừng (Popup)</h2>
        <p className="text-sm text-slate-400 mb-6">Thông báo này sẽ hiển thị lên giữa màn hình mỗi khi người dùng mở trang web.</p>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div>
              <p className="font-medium text-white">Bật thông báo chào mừng</p>
              <p className="text-xs text-slate-400">Cho phép popup hiển thị</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề thông báo</label>
            <input 
              type="text" 
              className="input-field" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Chào mừng bạn đến với mạng xã hội..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung thông báo (hỗ trợ xuống dòng)</label>
            <textarea 
              className="input-field resize-none h-32" 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung muốn truyền tải..." 
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-700/50">
            <span className="text-sm font-medium text-green-400">{message}</span>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
