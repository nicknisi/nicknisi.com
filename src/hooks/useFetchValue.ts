import { useEffect } from 'react';
import { useState } from 'react';

/**
 * A hook for fetching and optionally transforming async data.
 *
 * @template T The type of data returned by the fetch function
 * @template R The type of the transformed value (defaults to T if no transform provided)
 *
 * @param fetchFn An async function that fetches the data
 * @param dependencies Optional array of dependencies to trigger a re-fetch
 * @param transform Optional function to transform the fetched data
 *
 * @returns An object containing:
 * - value: The fetched (and optionally transformed) data
 * - isLoading: Whether the fetch is in progress
 * - error: Any error that occurred during fetch, or null
 *
 * @example
 * // Simple fetch
 * const { value: user } = useFetchValue(() => getUser(id));
 *
 * @example
 * // With transform
 * const { value: username } = useFetchValue(
 *   () => getUser(id),
 *   user => user.name
 * );
 *
 * @example
 * // Multiple async operations
 * const { value: data } = useFetchValue(async () => {
 *   const [user, posts] = await Promise.all([
 *     getUser(id),
 *     getPosts(id)
 *   ]);
 *   return { user, posts };
 * });
 */
export function useFetchValue<T, R = T>(
	fetchFn: () => Promise<T>,
	dependencies?: unknown[],
	transform?: (data: T) => R,
): {
	value: R | undefined;
	isLoading: boolean;
	error: Error | null;
} {
	const [value, setValue] = useState<R>();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetch = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await fetchFn();

				if (isMounted) {
					setValue(transform ? transform(data) : (data as unknown as R));
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err : new Error('Failed to fetch data'));
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		fetch();

		return () => {
			isMounted = false;
		};
	}, [fetchFn, transform, ...(dependencies ?? [])]);

	return { value, isLoading, error };
}

export default useFetchValue;
