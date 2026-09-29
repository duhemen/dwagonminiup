import { Link } from 'react-router-dom';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function ComingSoon({ title, description, icon }: Props) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-orange-700">
          🚧 Fitur ini sedang dalam pengembangan — Sprint 19.2 dan seterusnya
        </p>
      </div>
      <Link
        to="/klop"
        className="inline-block text-sm bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium transition"
      >
        ← Kembali ke Klop Home
      </Link>
    </div>
  );
}