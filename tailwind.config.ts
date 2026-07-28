import type { Config } from 'tailwindcss'
const colors = require('tailwindcss/colors')

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'text': '#e8e8e8',
      'background': '#0a0a0a',
      'primary': '#c0c0c0',
      'secondary': '#0a0a0a',
      'accent': '#454545',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      red: colors.red,
      green: colors.green,
      blue: colors.blue,
      slate: colors.slate,
      orange: colors.orange,
     },     
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
