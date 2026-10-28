// Tremor chartColors [v0.1.0]
// Key names are kept for the Tremor API, but values are the site palette
// (soft blue, deep blue, slate, sand, ink), not the Tailwind colors of the same name.

export type ColorUtility = "bg" | "stroke" | "fill" | "text"

export const chartColors = {
  blue: {
    bg: "bg-[#88abda]",
    stroke: "stroke-[#88abda]",
    fill: "fill-[#88abda]",
    text: "text-[#88abda]",
  },
  emerald: {
    bg: "bg-[#3f5a7b]",
    stroke: "stroke-[#3f5a7b]",
    fill: "fill-[#3f5a7b]",
    text: "text-[#3f5a7b]",
  },
  violet: {
    bg: "bg-[#a9c8eb]",
    stroke: "stroke-[#a9c8eb]",
    fill: "fill-[#a9c8eb]",
    text: "text-[#a9c8eb]",
  },
  amber: {
    bg: "bg-[#c2a878]",
    stroke: "stroke-[#c2a878]",
    fill: "fill-[#c2a878]",
    text: "text-[#c2a878]",
  },
  gray: {
    bg: "bg-[#111111]",
    stroke: "stroke-[#111111]",
    fill: "fill-[#111111]",
    text: "text-[#111111]",
  },
  lightGray: {
    bg: "bg-[#98a1aa]",
    stroke: "stroke-[#98a1aa]",
    fill: "fill-[#98a1aa]",
    text: "text-[#98a1aa]",
  },
  cyan: {
    bg: "bg-[#5e6a75]",
    stroke: "stroke-[#5e6a75]",
    fill: "fill-[#5e6a75]",
    text: "text-[#5e6a75]",
  },
  pink: {
    bg: "bg-[#b98a8a]",
    stroke: "stroke-[#b98a8a]",
    fill: "fill-[#b98a8a]",
    text: "text-[#b98a8a]",
  },
  lime: {
    bg: "bg-[#8fa68a]",
    stroke: "stroke-[#8fa68a]",
    fill: "fill-[#8fa68a]",
    text: "text-[#8fa68a]",
  },
  fuchsia: {
    bg: "bg-[#7a6fa3]",
    stroke: "stroke-[#7a6fa3]",
    fill: "fill-[#7a6fa3]",
    text: "text-[#7a6fa3]",
  },
  red: {
    bg: "bg-[#c0504d]",
    stroke: "stroke-[#c0504d]",
    fill: "fill-[#c0504d]",
    text: "text-[#c0504d]",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string
  }
}

export type AvailableChartColorsKeys = keyof typeof chartColors

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[],
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>()
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length])
  })
  return categoryColors
}

export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility,
): string => {
  const fallbackColor = {
    bg: "bg-gray-500",
    stroke: "stroke-gray-500",
    fill: "fill-gray-500",
    text: "text-gray-500",
  }
  return chartColors[color]?.[type] ?? fallbackColor[type]
}

// Tremor getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined,
) => {
  const minDomain = autoMinValue ? "auto" : (minValue ?? 0)
  const maxDomain = maxValue ?? "auto"
  return [minDomain, maxDomain]
}

// Tremor hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: any[],
  keyToCheck: string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const val: any[] = []

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck])
      if (val.length > 1) {
        return false
      }
    }
  }

  return true
}
