export default function FeatureCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}