'use client'

export function FilterBar({
  options,
  active,
  onChange,
  accent = 'primary',
  label,
}: {
  options: string[]
  active: string
  onChange: (value: string) => void
  accent?: 'primary' | 'secondary'
  label?: string
}) {
  const activeClass =
    accent === 'primary'
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-secondary text-secondary-foreground border-secondary'

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {label && (
        <span className="shrink-0 pr-1 font-mono text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
      )}
      {options.map((option) => {
        const isActive = option === active
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`shrink-0 skew-x-[-8deg] border px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.2em] transition-colors ${
              isActive
                ? activeClass
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            <span className="inline-block skew-x-[8deg]">{option}</span>
          </button>
        )
      })}
    </div>
  )
}
