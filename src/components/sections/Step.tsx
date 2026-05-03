export default function Step({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-60 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}