import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getForumDetail, createForumReply, ForumDetail, ForumReply } from '../../../api/forum';
import { useAuth } from '../../../contexts/AuthContext';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReplyItem({
  reply,
  allReplies,
  onReply,
  depth = 0,
}: {
  reply: ForumReply;
  allReplies: ForumReply[];
  onReply: (parentId: string) => void;
  depth?: number;
}) {
  const children = allReplies.filter((r) => r.parentId === reply.id);
  return (
    <div className={depth > 0 ? 'ml-8 mt-3' : ''}>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {(reply.authorName ?? 'U').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-800">{reply.authorName ?? 'Anonim'}</span>
              <span className="text-[10px] text-slate-400">{timeAgo(reply.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
            <div className="flex items-center gap-4 mt-3 text-[11px]">
              <button className="text-slate-500 hover:text-blue-600 flex items-center gap-1">
                👍 {reply.likes}
              </button>
              <button
                onClick={() => onReply(reply.id)}
                className="text-slate-500 hover:text-blue-600 flex items-center gap-1"
              >
                💬 Balas
              </button>
            </div>
          </div>
        </div>
      </div>
      {children.length > 0 && (
        <div>
          {children.map((child) => (
            <ReplyItem key={child.id} reply={child} allReplies={allReplies} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ForumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getForumDetail(id).then(setData).catch(() => navigate('/klop/forum')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleReply = async () => {
    if (!id || !replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createForumReply(id, replyText.trim(), replyTo ?? undefined);
      setReplyText('');
      setReplyTo(null);
      load();
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
  if (!data) return null;

  const topReplies = data.replies.filter((r) => !r.parentId);

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/klop/forum')} className="text-sm text-slate-500 hover:text-blue-500 mb-4">← Kembali ke Ruang Diskusi</button>

      {/* Topic */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {data.category && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-semibold">{data.category}</span>
          )}
          <span className="text-[10px] text-slate-400">{timeAgo(data.createdAt)}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">{data.title}</h1>
        <div className="flex items-center gap-3 py-3 border-y border-slate-100 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white flex items-center justify-center font-bold">
            {(data.authorName ?? 'U').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{data.authorName ?? 'Anonim'}</p>
            <p className="text-[11px] text-slate-500">{timeAgo(data.createdAt)}</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data.content}</p>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
          <button className="text-slate-500 hover:text-blue-600 flex items-center gap-1">
            👍 {data.likes}
          </button>
          <span className="text-slate-500 flex items-center gap-1">
            💬 {data.repliesCount} balasan
          </span>
          <span className="text-slate-500 flex items-center gap-1">
            👁️ {data.views} views
          </span>
        </div>
      </div>

      {/* Reply box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h3 className="font-semibold text-sm text-slate-800 mb-3">
          {replyTo ? 'Balas Komentar' : 'Tulis Balasan'}
        </h3>
        {replyTo && (
          <div className="text-xs text-blue-600 mb-2 flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded">
            <span>Membalas komentar</span>
            <button onClick={() => setReplyTo(null)} className="text-blue-500 hover:underline">Batal</button>
          </div>
        )}
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={4}
          placeholder="Tulis pemikiran Anda..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleReply}
            disabled={!replyText.trim() || submitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white text-xs px-5 py-2 rounded-lg font-medium"
          >
            {submitting ? 'Mengirim...' : 'Kirim Balasan'}
          </button>
        </div>
      </div>

      {/* Replies */}
      <div>
        <h3 className="font-semibold text-sm text-slate-800 mb-3">
          {data.replies.length} Balasan
        </h3>
        {topReplies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-400">
            Belum ada balasan. Jadilah yang pertama!
          </div>
        ) : (
          <div className="space-y-3">
            {topReplies.map((r) => (
              <ReplyItem key={r.id} reply={r} allReplies={data.replies} onReply={setReplyId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function setReplyId(pid: string) { setReplyTo(pid); }
}