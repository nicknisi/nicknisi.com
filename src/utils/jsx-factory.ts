import { type ReactNode, type CSSProperties } from 'react';

type JSXChild = ReactNode | false | null | undefined;
type JSXChildren = JSXChild | JSXChild[];

interface JSXProps {
	children?: JSXChildren;
	style?: CSSProperties;
	[key: string]: any;
}

/**
 * JSX factory function for creating ReactNode objects in .ts files
 * Mimics React.createElement but outputs the ReactNode structure expected by Satori
 *
 * @param type - The element type (e.g., 'div', 'h1', 'span')
 * @param props - Props including style and other attributes
 * @param children - Child elements or text content
 * @returns ReactNode object compatible with Satori
 */
export function jsx(type: string, props?: JSXProps | null, ...children: JSXChildren[]): ReactNode {
	// Flatten children array and filter out falsy values
	const flatChildren = children.flat(Infinity).filter((child): child is ReactNode => {
		return child !== false && child !== null && child !== undefined;
	});

	// Extract children from props if provided
	const propsChildren = props?.children;
	const { children: _, ...restProps } = props || {};

	// Combine props children with explicit children
	const allChildren = [
		...(Array.isArray(propsChildren) ? propsChildren : propsChildren ? [propsChildren] : []),
		...flatChildren,
	].filter((child): child is ReactNode => {
		return child !== false && child !== null && child !== undefined;
	});

	// If no children, set to empty string to match current behavior
	const finalChildren = allChildren.length === 0 ? '' : allChildren.length === 1 ? allChildren[0] : allChildren;

	return {
		type,
		props: {
			...restProps,
			children: finalChildren,
		},
	} as ReactNode;
}

