type AuthButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export default function authbutton({
  children,
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      className="mt-2 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#1f2937_0%,#38465d_48%,#111827_100%)] px-4 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_28px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
    >
      <span className="inline-flex items-center gap-2">
        {children}
        <span className="text-[11px]">▶</span>
      </span>
    </button>
  )
}