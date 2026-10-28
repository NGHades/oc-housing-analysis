import { Navigation } from "@/components/ui/Navigation"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-16 sm:px-10">{children}</div>
    </div>
  )
}
