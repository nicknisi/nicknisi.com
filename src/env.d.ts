/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="astro/image/client" />

declare module '*?buffer' {
	const value: string;
	export default value;
}
