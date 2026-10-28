import { Divider } from "@/components/Divider"

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{title}</h1>
      <p className="text-gray-500 sm:text-sm/6">{description}</p>
      <Divider />
    </>
  )
}
