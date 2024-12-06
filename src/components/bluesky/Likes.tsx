import useFetchValue from '@/hooks/useFetchValue';
import { getLikes } from '@/utils/bluesky';

interface Props {
	post: string;
}

export default function Likes({ post }: Props) {
	const { value: likes = [] } = useFetchValue(() => getLikes(post), [post]);
	const count = likes.length;

	return !count ? null : (
		<div className="not-prose mt-8 flex flex-col gap-4">
			<h2>
				{count} like{count === 1 ? '' : 's'}
			</h2>

			<div className="isolate flex flex-wrap -space-x-2 overflow-hidden px-4">
				{likes.map((like, index) => (
					<a
						href={`https://bsky.app/profile/${like.actor.handle}`}
						key={like.actor.did}
						className={[
							'bg-purple-950 relative inline-block size-12 overflow-hidden rounded-full ring-2 ring-purple-50 dark:ring-purple-900',
							index === 0 ? '-ml-2' : '',
						].join(' ')}
						target="_blank"
					>
						<img
							title={like.actor.handle}
							loading="lazy"
							src={like.actor.avatar?.replace('avatar', 'avatar_thumbnail')}
							alt={'liked by ' + like.actor.displayName}
						/>
					</a>
				))}
			</div>
		</div>
	);
}
