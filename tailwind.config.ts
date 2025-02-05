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
      'text': '#070605',
      'background': '#faf7f3',
      'primary': '#ee8e0b',
      'secondary': '#182946',
      'accent': '#fdab38',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      green: colors.green,
      blue: colors.blue,
      slate: colors.slate,
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
