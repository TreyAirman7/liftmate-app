// Theme color definitions based on the style guide
export type ThemeColor = "olive" | "blue" | "green" | "orange" | "red" | "darkBrown" | "pink" | "indigo" | "amber" | "maroon" | "lavender" | "violet" | "navy" | "magenta" | "darkYellow" | "lightBlue" | "cyanGray" | "gray" | "coral" | "ochre"

export interface ThemeColors {
  primary: string
  primaryContainer: string
  secondary: string
  secondaryContainer: string
  tertiary: string
  tertiaryContainer: string
  primaryDarker: string
}

export const themeColors: Record<ThemeColor, ThemeColors> = {
  olive: { // Replaced 'default'
    primary: "#808000",
    primaryContainer: "#e6e6cc",
    secondary: "#707000",
    secondaryContainer: "#f5f5e0",
    tertiary: "#606000",
    tertiaryContainer: "#d9d9b3",
    primaryDarker: "#595900",
  },
  blue: {
    primary: "#0C8CE9",
    primaryContainer: "#D1E4FF",
    secondary: "#0B57D0",
    secondaryContainer: "#D0E6FF",
    tertiary: "#175CDC",
    tertiaryContainer: "#DAE2FF",
    primaryDarker: "#0a65a6",
  },
  green: {
    primary: "#2E7D32",
    primaryContainer: "#B8F5B8",
    secondary: "#1B5E20",
    secondaryContainer: "#D7FFD9",
    tertiary: "#388E3C",
    tertiaryContainer: "#D8F8D8",
    primaryDarker: "#1c4d1f",
  },
  orange: {
    primary: "#E65100",
    primaryContainer: "#FFD9B6",
    secondary: "#F57C00",
    secondaryContainer: "#FFE0B2",
    tertiary: "#FF8F00",
    tertiaryContainer: "#FFECC9",
    primaryDarker: "#9e3700",
  },
  red: {
    primary: "#C62828",
    primaryContainer: "#FFDAD6",
    secondary: "#D32F2F",
    secondaryContainer: "#FFCDD2",
    tertiary: "#B71C1C",
    tertiaryContainer: "#FFCDD2",
    primaryDarker: "#8c1c1c",
  },
  darkBrown: { // Replaced 'teal'
    primary: "#331A19",
    primaryContainer: "#d6cbcb",
    secondary: "#2b1615",
    secondaryContainer: "#e3dcdc",
    tertiary: "#241312",
    tertiaryContainer: "#c7bdbd",
    primaryDarker: "#1f1110",
  },
  pink: {
    primary: "#C2185B",
    primaryContainer: "#FFD6EC",
    secondary: "#AD1457",
    secondaryContainer: "#F8BBD0",
    tertiary: "#880E4F",
    tertiaryContainer: "#FFD6EC",
    primaryDarker: "#880E4F",
  },
  indigo: {
    primary: "#303F9F",
    primaryContainer: "#D1D9FF",
    secondary: "#3949AB",
    secondaryContainer: "#C5CAE9",
    tertiary: "#1A237E",
    tertiaryContainer: "#C5CAE9",
    primaryDarker: "#1A237E",
  },
  amber: {
    primary: "#FFA000",
    primaryContainer: "#FFECB3",
    secondary: "#FF8F00",
    secondaryContainer: "#FFE082",
    tertiary: "#FF6F00",
    tertiaryContainer: "#FFE082",
    primaryDarker: "#FF8F00",
  },
  maroon: { // Replaced 'cyan'
    primary: "#800000",
    primaryContainer: "#e6cccc",
    secondary: "#700000",
    secondaryContainer: "#f5e0e0",
    tertiary: "#600000",
    tertiaryContainer: "#d9b3b3",
    primaryDarker: "#590000",
  },
  lavender: {
    primary: "#7F39FB",
    primaryContainer: "#EAE0FF",
    secondary: "#6A56F9",
    secondaryContainer: "#E5DEFF",
    tertiary: "#8C4DFF",
    tertiaryContainer: "#DDD4FF",
    primaryDarker: "#5929D4",
  },
  violet: { // Replaced 'lime'
    primary: "#911eb4",
    primaryContainer: "#e9d0f9",
    secondary: "#7d1aa0",
    secondaryContainer: "#f3e0ff",
    tertiary: "#6a178c",
    tertiaryContainer: "#e0c8f0",
    primaryDarker: "#6a178c",
  },
  navy: { // Replaced 'deepPurple'
    primary: "#000075",
    primaryContainer: "#cccce3",
    secondary: "#000066",
    secondaryContainer: "#e0e0f0",
    tertiary: "#000057",
    tertiaryContainer: "#b3b3d1",
    primaryDarker: "#00004d",
  },
  magenta: { // Replaced 'yellow'
    primary: "#f032e6",
    primaryContainer: "#fdd7f9",
    secondary: "#d82ccf",
    secondaryContainer: "#ffe5fa",
    tertiary: "#c027b8",
    tertiaryContainer: "#f8c5f3",
    primaryDarker: "#b31cae",
  },
  darkYellow: { // Replaced 'crimson'
    primary: "#9B870C",
    primaryContainer: "#f1eacb",
    secondary: "#8a780a",
    secondaryContainer: "#f7f1d9",
    tertiary: "#7a6a09",
    tertiaryContainer: "#e9e2bf",
    primaryDarker: "#6e5f08",
  },
  lightBlue: {
    primary: "#03A9F4",
    primaryContainer: "#E1F5FE",
    secondary: "#039BE5",
    secondaryContainer: "#B3E5FC",
    tertiary: "#0288D1",
    tertiaryContainer: "#B3E5FC",
    primaryDarker: "#0277BD",
  },
  cyanGray: { // Replaced 'steelGray'
    primary: "#48686C",
    primaryContainer: "#cddedf",
    secondary: "#3e5a5e",
    secondaryContainer: "#e1e8e9",
    tertiary: "#354d51",
    tertiaryContainer: "#c3d1d3",
    primaryDarker: "#2f4548",
  },
  gray: {
    primary: "#9E9E9E",
    primaryContainer: "#F5F5F5",
    secondary: "#757575",
    secondaryContainer: "#EEEEEE",
    tertiary: "#616161",
    tertiaryContainer: "#E0E0E0",
    primaryDarker: "#424242",
  },
  coral: {
    primary: "#FF6F61",
    primaryContainer: "#FFEDEA",
    secondary: "#F0625B",
    secondaryContainer: "#FFD8D6",
    tertiary: "#E64A4B",
    tertiaryContainer: "#FFE1E0",
    primaryDarker: "#D8433B",
  },
  ochre: { // Replaced 'mint'
    primary: "#9a6324",
    primaryContainer: "#f0dcb8",
    secondary: "#87561f",
    secondaryContainer: "#fae8cd",
    tertiary: "#754a1a",
    tertiaryContainer: "#e8d3b0",
    primaryDarker: "#6e4517",
  },
}

// Helper function to convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

// Helper function to check if a color is light or dark
export function isLightColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return false

  // Calculate perceived brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255

  // Return true if the color is light (brightness > 0.5)
  return brightness > 0.5
}

// Helper function to get chart colors based on theme
export function getChartColors(themeColor: ThemeColor, isDarkMode: boolean) {
  const colors = themeColors[themeColor]
  const primaryRgb = hexToRgb(colors.primary)
  const secondaryRgb = hexToRgb(colors.secondary)
  const tertiaryRgb = hexToRgb(colors.tertiary)

  const textColor = isDarkMode ? "#E6E1E5" : "#1C1B1F"
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"

  return {
    primary: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)` : colors.primary,
    secondary: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)` : colors.secondary,
    tertiary: tertiaryRgb ? `rgba(${tertiaryRgb.r}, ${tertiaryRgb.g}, ${tertiaryRgb.b}, 0.8)` : colors.tertiary,
    textColor,
    gridColor,
    // Additional colors for multi-series charts
    additionalColors: [
      "rgba(46, 125, 50, 0.8)", // Success green
      "rgba(13, 101, 116, 0.8)", // Teal
      "rgba(68, 138, 255, 0.8)", // Blue
      "rgba(213, 0, 249, 0.8)", // Purple
      "rgba(197, 17, 98, 0.8)", // Pink
      "rgba(239, 108, 0, 0.8)", // Orange
      "rgba(192, 202, 51, 0.8)", // Lime
      "rgba(0, 77, 64, 0.8)", // Dark Teal
      "rgba(183, 28, 28, 0.8)", // Dark Red
    ],
  }
}

// Add a function to create a toast notification with theme color
export function showToast(
  message: string,
  type: "info" | "success" | "error" | "warning" = "info",
  themeColor?: string,
) {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message

  // If themeColor is provided, apply custom theme styling
  if (themeColor) {
    toast.style.backgroundColor = themeColor
    toast.style.color = "#FFFFFF" // White text for contrast
    toast.style.border = `1px solid ${themeColor}`
    // Add subtle glow effect for emphasis
    toast.style.boxShadow = `0 0 10px ${themeColor}40` // 40 = 25% opacity
  }

  // Add toast to the document
  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.classList.add("show")
  }, 10)

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

