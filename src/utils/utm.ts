export interface UTM {
	source?: string | null | undefined;
	medium?: string | null | undefined;
	campaign?: string | null | undefined;
	term?: string | null | undefined;
	content?: string | null | undefined;
}

/**
 * Get UTM parameters from a URL.
 * @param url the URL to get UTM parameters from
 * @return the UTM parameters
 */
export function getUTM(url: URL): UTM {
	const { searchParams: params } = url;

	const utm = {
		source: params.get('utm_source'),
		medium: params.get('utm_medium'),
		campaign: params.get('utm_campaign'),
		term: params.get('utm_term'),
		content: params.get('utm_content'),
	};

	return utm;
}

/**
 * Get UTM parameters from an event.
 * @param event the event to get UTM parameters from
 * @return the UTM parameters
 */
export function getUTMFromEvent(event: Event): UTM {
	const url = new URL((event.target as HTMLAnchorElement).href);
	return getUTM(url);
}

/**
 * Get UTM parameters from a URL string.
 * @param url the URL to get UTM parameters from
 * @return the UTM parameters
 */
export function getUTMFromString(url: string): UTM {
	const parsedURL = new URL(url);
	return getUTM(parsedURL);
}

/**
 * Set the UTM parameters in the URL.
 * @param url the URL to set UTM parameters in
 * @return the URL with UTM parameters
 */
export function setUTM(url: URL | string, utm: UTM): URL {
	if (typeof url === 'string') {
		url = new URL(url);
	}

	const { searchParams: params } = url;

	for (const [key, value] of Object.entries(utm)) {
		params.set(key, value);
	}

	return url;
}
