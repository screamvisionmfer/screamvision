import type { Config } from 'tailwindcss'
export default { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
theme:{extend:{fontFamily:{display:['var(--font-display)','system-ui','sans-serif'],body:['Inter','system-ui','sans-serif']},
colors:{brand:{bg:'#0b0b0b',card:'#111213',text:'#ededed',accent:'#ffe100'}}}}, plugins: [] } satisfies Config
