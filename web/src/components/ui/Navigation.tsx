"use client"

import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/cities", label: "Cities" },
  { href: "/rates", label: "Mortgage Rates" },
  { href: "/quality", label: "Data Quality" },
]

export function Navigation() {
  const pathname = usePathname()
  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center px-4 pt-3 sm:px-6">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          Orange County Housing
        </span>
      </div>
      <TabNavigation className="mt-4">
        <div className="mx-auto flex w-full max-w-7xl items-center px-4 sm:px-6">
          {links.map(({ href, label }) => (
            <TabNavigationLink key={href} asChild active={pathname === href}>
              <Link href={href}>{label}</Link>
            </TabNavigationLink>
          ))}
        </div>
      </TabNavigation>
    </div>
  )
}
