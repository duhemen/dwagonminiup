interface CardProps {
  title: string;
  description: string;
  status?: string;
  email?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function CardLayanan({ title, description, status, email, icon, onClick }: CardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow p-4 border hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-2xl">{icon}</div>}
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {status && <p className="mt-2 text-xs text-green-600">Status: {status}</p>}
      {email && <p className="text-xs text-gray-500">Auto-Login: {email}</p>}
    </div>
  );
}