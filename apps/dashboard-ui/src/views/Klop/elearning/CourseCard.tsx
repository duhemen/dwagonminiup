import { Link } from 'react-router-dom';
import { ElearningCourse } from '../../../api/elearning';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'Dibuka':         { bg: 'bg-green-500',  text: 'text-white', label: 'DIBUKA' },
  'Dimulai':        { bg: 'bg-blue-500',   text: 'text-white', label: 'DIMULAI' },
  'Akan Datang':    { bg: 'bg-amber-500',  text: 'text-white', label: 'AKAN DATANG' },
  'Sudah Berakhir': { bg: 'bg-red-500',    text: 'text-white', label: 'SUDAH BERAKHIR' },
};

const ACCESS_STYLES: Record<string, { bg: string; text: string }> = {
  'Terbuka':   { bg: 'bg-amber-500',  text: 'text-white' },
  'Pengajuan': { bg: 'bg-orange-500', text: 'text-white' },
  'Undangan':  { bg: 'bg-purple-500', text: 'text-white' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  course: ElearningCourse;
  onEnroll?: (id: string) => void;
}

export default function CourseCard({ course, onEnroll }: Props) {
  const statusStyle = STATUS_STYLES[course.status] ?? STATUS_STYLES['Dibuka'];
  const accessStyle = ACCESS_STYLES[course.accessType] ?? ACCESS_STYLES['Terbuka'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition group flex flex-col">
      {/* Poster */}
      <Link to={`/klop/elearning/${course.id}`} className="block aspect-[16/10] bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-40">🎓</span>
        </div>
        {/* Status badge */}
        <span className={`absolute top-3 left-3 text-[9px] px-2 py-1 rounded font-bold tracking-wide ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
        {/* Access badge */}
        <span className={`absolute top-3 right-3 text-[9px] px-2 py-1 rounded font-bold ${accessStyle.bg} ${accessStyle.text}`}>
          {course.accessType}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
          <span>{formatDate(course.startDate)}</span>
          <span>→</span>
          <span>{formatDate(course.endDate)}</span>
        </div>

        {/* Title */}
        <Link to={`/klop/elearning/${course.id}`}>
          <h3 className="font-semibold text-sm text-slate-800 line-clamp-3 mb-2 group-hover:text-orange-600 transition leading-snug">
            {course.title}
          </h3>
        </Link>

        {/* Type */}
        <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1">
          <span>🏷️</span>
          <span className="truncate">{course.type}</span>
        </p>

        {/* Penyelenggara */}
        <p className="text-[10px] text-slate-400 line-clamp-2 mb-3 flex items-start gap-1">
          <span>🏛️</span>
          <span className="flex-1">{course.penyelenggara}</span>
        </p>

        {/* Progress bar (kalau enrolled) */}
        {course.isEnrolled && course.userProgress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Progress</span>
              <span className="font-medium text-slate-700">{course.userProgress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${course.userProgress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${course.userProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="mt-auto">
          {course.isEnrolled && course.hasCert ? (
            <button className="w-full text-xs bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5">
              <span>🏆</span>
              <span>Lihat Sertifikat</span>
            </button>
          ) : course.isEnrolled ? (
            <Link
              to={`/klop/elearning/${course.id}`}
              className="block w-full text-center text-xs bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
            >
              ▶️ Lanjutkan Belajar
            </Link>
          ) : course.status === 'Sudah Berakhir' ? (
            <button
              disabled
              className="w-full text-xs bg-slate-100 text-slate-400 py-2 rounded-lg font-medium cursor-not-allowed"
            >
              Sudah Berakhir
            </button>
          ) : (
            <button
              onClick={() => onEnroll?.(course.id)}
              className="w-full text-xs bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition"
            >
              📚 Belajar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}