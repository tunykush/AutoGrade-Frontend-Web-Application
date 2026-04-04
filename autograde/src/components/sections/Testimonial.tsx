export default function Testimonial({ title }: { title: string }) {
  return (
    <div className="px-6 flex flex-col justify-center text-center md:text-left">
      <p className="font-semibold mb-4">{title}</p>

      <p className="text-sm italic opacity-90">
        “AutoGrade reduced my grading time from 8 hours to under 2.”
      </p>

      <p className="text-sm mt-2 opacity-80">– John Doe</p>
    </div>
  );
}