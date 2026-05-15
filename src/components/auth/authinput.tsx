type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export default function authinput({ label, ...props }: AuthInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-[14px] font-medium text-[#1b2433]">
        {label}
      </label>
      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-[#d7dfeb] bg-white/72 px-4 text-[15px] text-[#111827] outline-none transition placeholder:text-[#a8b0c0] focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-[#60a5fa]/15"
      />
    </div>
  )
}