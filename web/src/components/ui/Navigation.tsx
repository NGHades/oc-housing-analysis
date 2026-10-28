"use client"

import { housing } from "@/lib/data"
import { cx } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/cities", label: "Cities" },
  { href: "/rates", label: "Mortgage Rates" },
  { href: "/quality", label: "Data Quality" },
]

function BrandMark() {
  return (
    <span className="flex h-[19px] w-[18px] items-end gap-[2px]" aria-hidden="true">
      <i className="h-[9px] w-1 rounded-sm bg-current" />
      <i className="h-[19px] w-1 rounded-sm bg-current" />
      <i className="h-[13px] w-1 rounded-sm bg-current" />
    </span>
  )
}

export function Navigation() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-20 h-[68px] border-b border-gray-200/70 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 sm:px-10">
        <div className="flex items-center">
          <Link href="/overview" className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.14em] text-gray-900">
            <BrandMark />
            OC Housing
          </Link>
          <div className="ml-10 hidden gap-8 text-[13px] sm:flex lg:ml-24">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={cx(
                  "transition-colors hover:text-blue-500",
                  pathname === href ? "text-gray-900" : "text-gray-600",
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <span className="rounded-full bg-blue-500 px-[18px] py-3 text-xs text-white">
          Updated {housing.generated}
        </span>
      </nav>
      <div className="flex gap-6 overflow-x-auto border-b border-gray-200 bg-white px-5 py-3 text-[13px] sm:hidden">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={cx("whitespace-nowrap", pathname === href ? "text-gray-900" : "text-gray-600")}>
            {label}
          </Link>
        ))}
      </div>
    </header>
  )
}
