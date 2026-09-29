interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
}

export default function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
      {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
    </div>
  );
}