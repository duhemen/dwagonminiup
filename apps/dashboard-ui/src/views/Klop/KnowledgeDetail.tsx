import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getKnowledgeDetail, getComments, addComment, toggleLike,
  KnowledgeDetail,
} from '../../api/klop';
import { useAuth } from '../../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string | null; email: string };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function KlopKnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<KnowledgeDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getKnowledgeDetail(id), getComments(id)])
      .then(([item, cmts]) => {
        setItem(item);
        setLikesCount(item.likes);
        setComments(cmts);
      })
      .catch(() => navigate('/klop/knowledge'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleLike = async () => {
    if (!id) return;
    try {
      const res = await toggleLike(id);
      setLiked(res.liked);
      setLikesCount((c) => c + (res.liked ? 1 : -1));
    } catch { /* ignore */ }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const c = await addComment(id, commentText.trim());
      setComments((prev) => [c, ...prev]);
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-orange-500 mb-4 flex items-center gap-1"
      >
        ← Kembali
      </button>

      {/* Article */}
      <article className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-4">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
          <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md font-semibold">
            {item.category.name}
          </span>
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
            {item.type}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{formatDate(item.publishedAt)}</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">{item.title}</h1>

        {/* Author */}
        <div className="flex items-center gap-3 py-4 border-y border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold">
            {(item.author.name ?? 'U').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.author.name ?? '-'}</p>
            <p className="text-[11px] text-slate-500">{item.author.jabatan ?? item.author.email}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{item.description}</p>

        {/* Content */}
        {item.content && (
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap mb-6">
            {item.content}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {item.tags.map((t) => (
              <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition ${
              liked ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <span>👍</span>
            <span className="font-medium">{likesCount}</span>
          </button>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>💬</span>
            <span>{comments.length} komentar</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500 ml-auto">
            <span>👁️</span>
            <span>{item.views} views</span>
          </span>
        </div>
      </article>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Diskusi ({comments.length})</h2>

        {/* Add comment */}
        <form onSubmit={handleComment} className="mb-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {(user?.name ?? 'U').charAt(0)}
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis komentar..."
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white text-xs px-4 py-1.5 rounded-lg font-medium transition"
                >
                  {submitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">Belum ada komentar. Jadilah yang pertama!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(c.user.name ?? 'U').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{c.user.name ?? c.user.email.split('@')[0]}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}