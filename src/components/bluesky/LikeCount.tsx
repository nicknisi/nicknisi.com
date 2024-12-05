import useFetchValue from '@/hooks/useFetchValue';
import { getLikes } from '@/utils/bluesky';
import { type ReactNode } from 'react';

interface Props {
	post: string;
	likeIcon?: ReactNode;
}

export default function LikeCount({ likeIcon, post }: Props) {
	const { value: likeCount } = useFetchValue(
		() => getLikes(post),
		[post],
		likes => likes?.length ?? 0,
	);

	return likeCount ? (
		<span className="flex gap-1">
			{likeIcon}
			<span>{likeCount}</span>
		</span>
	) : null;
}
