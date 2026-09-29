import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseDetail, enrollCourse, updateProgress } from '../../../api/elearning';

const STATUS_STYLES: Record<string, string> = {
  'Dibuka': 'bg-green-100 text-green-700',
  'Dimulai': 'bg-blue-100 text-blue-700',
  'Akan Datang': 'bg-amber-100 text-amber-700',
  'Sudah Berakhir': 'bg-slate-100 text-slate-600',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getCourseDetail(id).then(setCourse).catch(() => navigate('/klop/elearning')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    setEnrolling(true);
    try { await enrollCourse(id); load(); }
    catch (e: any) { alert(e?.response?.data?.error ?? 'Gagal mendaftar'); }
    finally { setEnrolling(false); }
  };

  const handleProgress = async (val: number) => {
    if (!course?.enrollments?.[0]?.id) return;
    try {
      await updateProgress(course.enrollments[0].id, val);
      load();
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-orange-500 mb-4">← Kembali</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
            <div className="aspect-video bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 flex items-center justify-center">
              <span className="text-8xl opacity-40">🎓</span>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${STATUS_STYLES[course.status]}`}>
                  {course.status}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-md font-medium bg-orange-100 text-orange-700">
                  {course.accessType}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-md font-medium bg-slate-100 text-slate-700">
                  {course.category.icon} {course.category.name}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">{course.title}</h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{course.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div><span className="text-slate-400">Penyelenggara:</span> <span className="font-medium">{course.penyelenggara}</span></div>
                <div><span className="text-slate-400">Tipe:</span> <span className="font-medium">{course.type}</span></div>
                <div><span className="text-slate-400">Tanggal Mulai:</span> <span className="font-medium">{formatDate(course.startDate)}</span></div>
                <div><span className="text-slate-400">Tanggal Selesai:</span> <span className="font-medium">{formatDate(course.endDate)}</span></div>
              </div>
            </div>
          </div>

          {/* Progress update (kalau enrolled) */}
          {course.isEnrolled && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Progress Belajar</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${course.userProgress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${course.userProgress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-12 text-right">{course.userProgress}%</span>
              </div>
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProgress(p)}
                    disabled={course.userProgress >= p}
                    className="text-xs bg-slate-100 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 px-3 py-1.5 rounded-lg transition"
                  >
                    Set {p}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">JP</span>
                <span className="font-semibold">{course.totalJP} JP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jam Pelajaran</span>
                <span className="font-semibold">{course.totalHours} jam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kuota</span>
                <span className="font-semibold">{course.enrolled} / {course.kuota}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rating</span>
                <span className="font-semibold text-amber-500">{course.rating > 0 ? `★ ${course.rating}` : '-'}</span>
              </div>
            </div>

            {course.isEnrolled ? (
              course.hasCert ? (
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2">
                  <span>🏆</span> Lihat Sertifikat
                </button>
              ) : (
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition text-sm">
                  ▶️ Lanjutkan Belajar
                </button>
              )
            ) : course.status === 'Sudah Berakhir' ? (
              <button disabled className="w-full bg-slate-100 text-slate-400 py-2.5 rounded-lg font-medium text-sm cursor-not-allowed">
                Sudah Berakhir
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white py-2.5 rounded-lg font-medium transition text-sm"
              >
                {enrolling ? 'Mendaftar...' : '📚 Daftar Sekarang'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}