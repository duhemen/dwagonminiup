import { useEffect, useState } from 'react';
import { getVideos, VideoTutorial } from '../../api/kinerja-ext';

export default function Video() {
  const [items, setItems] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-blue-900 text-white rounded-t-2xl px-6 py-4">
        <h1 className="font-bold text-lg text-center">🎥 Galeri Video Tutorial</h1>
      </div>
      <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3 opacity-30">🎥</p>
            <p className="text-slate-500">Belum ada video</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <p className="text-[10px] text-yellow-400 mb-1">VIDEO TUTORIAL</p>
                    <p className="text-sm font-bold line-clamp-3">{v.title}</p>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                    {v.duration ?? '00:00'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">▶️</div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-800 line-clamp-2 mb-1">{v.title}</p>
                  <p className="text-[10px] text-slate-500">👁️ {v.views} views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}