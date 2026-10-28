export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
      <div>
        <p className="font-mono text-[10px] uppercase leading-[1.3] tracking-[0.14em] text-blue-700">
          {eyebrow}
        </p>
        <h1 className="mt-6 font-display text-5xl font-normal leading-[0.96] tracking-[-0.075em] text-gray-900 sm:text-7xl">
          {title}
        </h1>
      </div>
      <p className="max-w-sm text-[13px] leading-[1.7] text-gray-500">{description}</p>
    </header>
  )
}
