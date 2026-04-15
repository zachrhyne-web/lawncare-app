export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // These reference CSS variables so the whole app re-themes when settings change
        forest: ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-forest-rgb), ${opacityValue})`
            : `rgb(var(--color-forest-rgb))`,
        lime: ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-lime-rgb), ${opacityValue})`
            : `rgb(var(--color-lime-rgb))`,
        cream: '#FFFFFF',
        'cream-dark': '#E0E0E0',
        bark: '#3D8032',
        linen: '#F5F5F5',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
}
