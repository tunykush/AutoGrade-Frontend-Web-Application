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
  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-gray-500">{rightText}</span>
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-300 rounded-full"
          style={{ width: `${value}%` }}
        />

        {subValue !== undefined && (
          <div
            className="absolute top-0 left-0 h-full bg-gray-800 rounded-full"
            style={{ width: `${subValue}%` }}
          />
        )}
      </div>
    </div>
  );
}