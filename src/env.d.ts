/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="astro/image/client" />

declare module '*?buffer' {
	const value: ArrayBuffer;
	export default value;
}

interface Window {
	fathom: {
		trackPageview: () => void;
		trackGoal: (eventId: string, value: number) => void;
		trackEvent: (category: string) => void;
	};
}

declare const fathom: {
	trackPageview: () => void;
	trackGoal: (eventId: string, value: number) => void;
	trackEvent: (category: string) => void;
};
