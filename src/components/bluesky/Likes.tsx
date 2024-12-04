import { getLikes } from '@/utils/bluesky';
import { useState } from 'react';
import { useEffect } from 'react';

type Like = Awaited<ReturnType<typeof getLikes>>[number];

interface Props {
	post: string;
}

export default function Likes({ post }: Props) {
	const [count, setCount] = useState(0);
	const [likes, setLikes] = useState<Like[]>([]);
	useEffect(() => {
		getLikes(post).then(likes => {
			setLikes(likes);
			setCount(likes.length);
		});
	}, [post]);

	return (
		<div className="not-prose mt-8 flex flex-col gap-4">
			<div className="text-base-950 dark:text-base-100 text-sm font-semibold">
				<h2>
					{count} like{count === 1 ? '' : 's'}
				</h2>
			</div>

			<div className="isolate flex flex-wrap -space-x-2 overflow-hidden px-4">
				{likes.map((like, index) => (
					<a
						href={`https://bsky.app/profile/${like.actor.handle}`}
						className={[
							'ring-base-50 dark:ring-base-900 bg-base-950 relative inline-block size-12 overflow-hidden rounded-full ring-2',
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
