import { useEffect, useState, type ReactNode } from 'react';
import { getLikes } from '@/utils/bluesky';

interface Props {
	post: string;
	likeIcon?: ReactNode;
}

export default function LikeCount({ likeIcon, post }: Props) {
	const [likeCount, setLikeCount] = useState(0);

	useEffect(() => {
		getLikes(post).then(likes => {
			setLikeCount(likes.length);
		});
	}, [post]);

	return (
		<span className="flex gap-1">
			{likeIcon}
			<span>{likeCount}</span>
		</span>
	);
}
