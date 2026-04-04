export default function StatCard({
  title,
  suffix,
  subtitle,
  desc,
  source,
  highlight = false,
}: {
  title: string;
  suffix?: string;
  subtitle: string;
  desc: string;
  source: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl p-6 shadow-sm border transition transform hover:-translate-y-1
        ${highlight
          ? "bg-gray-800 text-white border-gray-800"
          : "bg-gray-100 text-gray-900 border-gray-200"}
      `}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold">{title}</span>
        {suffix && (
          <span className="text-sm font-semibold opacity-80">{suffix}</span>
        )}
      </div>

      <p className="font-semibold mb-2">{subtitle}</p>
      <p className="text-sm opacity-80 mb-6">{desc}</p>
      <p className="text-xs opacity-60">Source: {source}</p>
    </div>
  );
}