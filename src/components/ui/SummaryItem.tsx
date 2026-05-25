export default function SummaryItem({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div>
      <p className="text-3xl font-bold mb-2">{title}</p>
      <p className="text-sm text-gray-700">{desc}</p>
    </div>
  );
}