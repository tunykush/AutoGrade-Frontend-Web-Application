type SocialButtonProps = {
  icon: React.ReactNode
  children: React.ReactNode
  badge?: string
}

export default function socialbutton({
  icon,
  children,
  badge,
}: SocialButtonProps) {
  return (
    <button
      type="button"
      className="relative mb-3 flex h-12 w-full items-center justify-center rounded-2xl border border-[#dbe3ef] bg-white/68 px-4 text-[14px] font-medium text-[#3f4655] shadow-[0_1px_0_rgba(255,255,255,0.8)] transition hover:-translate-y-0.5 hover:border-[#bfd2ee] hover:bg-white"
    >
      {badge ? (
        <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-[#dbe3ef] bg-[#f5f8fc] px-2.5 py-1 text-[11px] text-[#7a8495] sm:inline-flex">
          {badge}
        </span>
      ) : null}

      <span className="mr-3 inline-flex items-center">{icon}</span>
      <span>{children}</span>
    </button>
  )
}