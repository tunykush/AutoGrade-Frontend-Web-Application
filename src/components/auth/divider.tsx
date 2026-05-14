export default function divider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-black/10" />
      <span className="text-[13px] text-[#7d8494]">or</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-black/10" />
    </div>
  )
}