interface Tab {
  key: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm font-medium rounded-t transition ${
            active === t.key
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t.label}
          {t.badge !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              active === t.key ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
            }`}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}