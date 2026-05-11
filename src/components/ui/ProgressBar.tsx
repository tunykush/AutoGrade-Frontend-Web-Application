export default function ProgressBar({
  label,
  value,
  subValue,
  rightText,
}: {
  label: string;
  value: number;
  subValue?: number;
  rightText?: string;
}) {
  const isDark = subValue !== undefined;

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1" style={{ color: isDark ? 'rgba(199,217,229,0.8)' : '#23334A' }}>
        <span>{label}</span>
        <span style={{ opacity: 0.8 }}>{rightText}</span>
      </div>

      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: isDark ? 'rgba(199,217,229,0.15)' : '#e2e8f0' }}
      >
        {/* Traditional / Manual bar */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: isDark ? 'rgba(199,217,229,0.35)' : '#324B73',
            opacity: isDark ? 1 : 0.3,
          }}
        />

        {/* AutoGrade bar (overlay) */}
        {subValue !== undefined && (
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${subValue}%`, backgroundColor: '#ffffff' }}
          />
        )}
      </div>
    </div>
  );
}