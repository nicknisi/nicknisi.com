import { type Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	safeList: [],
	darkMode: 'class',
	theme: {
		extend: {
			typography: () => ({
				DEFAULT: {
					css: {
						pre: { fontFamily: 'Space Mono, monospace' },
						code: { fontFamily: 'Space Mono, monospace' },
						'pre code': { fontFamily: 'Space Mono, monospace' },
					},
				},
			}),
		},
		fontSize: {
			xs: '0.75rem', // 12px
			sm: '0.875rem', // 14px
			base: '1rem', // 16px
			lg: '1.125rem', // 18px
			xl: '1.25rem', // 20px
			'2xl': '1.5rem', // 24px
			'3xl': '1.875rem', // 30px
			'4xl': '2.25rem', // 36px
			'5xl': '3rem', // 48px
			'6xl': '3.75rem', // 60px
			'7xl': '4.5rem', // 72px
		},
		fontFamily: {
			sans: ['Atkinson Hyperlegible', 'sans-serif'],
			serif: ['Oswald', 'Roboto Slab', 'serif'],
			mono: ['Space Mono', 'monospace'],
		},
		colors: {
			white: '#FFFFFF',
			transparent: 'transparent',
			purple: {
				50: '#EAE2F8',
				100: '#CFBCF2',
				200: '#A081D9',
				300: '#8662C7',
				400: '#724BB7',
				500: '#653CAD',
				600: '#51279B',
				700: '#421987',
				800: '#34126F',
				900: '#240754',
			},
			red: {
				50: '#FFE3E3',
				100: '#FFBDBD',
				200: '#FF9B9B',
				300: '#F86A6A',
				400: '#EF4E4E',
				500: '#E12D39',
				600: '#CF1124',
				700: '#AB091E',
				800: '#8A041A',
				900: '#610316',
			},
			'blue-gray': {
				50: '#F0F4F8',
				100: '#D9E2EC',
				200: '#BCCCDC',
				300: '#9FB3C8',
				400: '#829AB1',
				500: '#627D98',
				600: '#486581',
				700: '#334E68',
				800: '#243B53',
				900: '#102A43',
			},
			teal: {
				50: 'F0FCF9',
				100: '#C6F7E9',
				200: '#8EEDD1',
				300: '#5FE3C0',
				400: '#2DCCA7',
				500: '#17B897',
				600: '#079A82',
				700: '#048271',
				800: '#016457',
				900: '#004440',
			},
			yellow: {
				50: '#FFFBEA',
				100: '#FFF3C4',
				200: '#FCE588',
				300: '#FADB5F',
				400: '#F7C948',
				500: '#F0B429',
				600: '#DE911D',
				700: '#CB6E17',
				800: '#B44D12',
				900: '#8D2B0B',
			},
			// ...
			'vivid-light-blue': {
				50: '#E3F8FF',
				100: '#B3ECFF',
				200: '#81DEFD',
				300: '#5ED0FA',
				400: '#40C3F7',
				500: '#2BB0ED',
				600: '#1992D4',
				700: '#127FBF',
				800: '#0B69A3',
				900: '#035388',
			},
			gray: {
				'50': '#f6f6f6',
				'100': '#e7e7e7',
				'200': '#d1d1d1',
				'300': '#b0b0b0',
				'400': '#888888',
				'500': '#6d6d6d',
				'600': '#5d5d5d',
				'700': '#4f4f4f',
				'800': '#454545',
				'900': '#3d3d3d',
				'950': '#0c0c0c',
			},

			'cool-gray': {
				50: '#F5F7FA',
				100: '#E4E7EB',
				200: '#CBD2D9',
				300: '#9AA5B1',
				400: '#7B8794',
				500: '#616E7C',
				600: '#52606D',
				700: '#3E4C59',
				800: '#323F4B',
				900: '#1F2933',
			},
			'vivid-pink': {
				50: '#FFE3EC',
				100: '#FFB8D2',
				200: '#FF8CBA',
				300: '#F364A2',
				400: '#E8368F',
				500: '#DA127D',
				600: '#BC0A6F',
				700: '#A30664',
				800: '#870557',
				900: '#620042',
			},
			'vivid-yellow': {
				50: '#FFFBEA',
				100: '#FFF3C4',
				200: '#FCE588',
				300: '#FADB5F',
				400: '#F7C948',
				500: '#F0B429',
				600: '#DE911D',
				700: '#CB6E17',
				800: '#B44D12',
				900: '#8D2B0B',
			},
			dark: {
				'charcoal-gray': '#121212',
				'dark-slate-gray': '#191919',
				'outer-space': '#252525',
				'rich-black': '#0A0A0A',
				'coffee-bean': '#1B1B1B',
				'dark-gray': '#212427',
				'oil-black': '#0C0C0C',
				obsidian: '#0B1215',
				ebony: '#222428',
				'black-chocolate': '#100D08',
				gunmetal: '#1D1F21',
				'smoky-black': '#101720',
				'oxford-blue': '#212A37',
				'eerie-black': '#232023',
				'jet-black': '#161618',
				iridium: '#181818',
				arsenic: '#11181C',
				'charleston-green': '#212124',
				jet: '#2A2A2A',
				'black-olive': '#242526',
				'midnight-blue': '#212121',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};

export default config;
