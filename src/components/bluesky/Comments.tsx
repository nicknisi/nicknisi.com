import useFetchValue from '@/hooks/useFetchValue';
import { AppBskyFeedDefs } from '@atproto/api';
import { getPostThread, getCommentCount, sortByLikes } from '@/utils/bluesky';

interface Props {
	post: string;
}

interface CommentProps {
	comment: AppBskyFeedDefs.ThreadViewPost;
}

function Comment({ comment }: CommentProps) {
	const author = comment.post.author;
	return (
		<div className="my-4 text-base">
			<div className="flex max-w-xl flex-col gap-2">
				<a
					className="flex flex-row items-center gap-2 hover:underline"
					href={`https://bsky.app/profile/${author.did}`}
					target="_blank"
					rel="noreferrer noopener"
				>
					{author.avatar ? (
						<img src={comment.post.author.avatar} alt="avatar" className="size-8 shrink-0 rounded-full bg-gray-300" />
					) : (
						<div className="h-4 w-4 shrink-0 rounded-full bg-gray-300" />
					)}
					<p className="line-clamp-1 text-lg font-bold">
						{author.displayName ?? author.handle} <span className="text-gray-500">@{author.handle}</span>
					</p>
				</a>
				<a
					href={`https://bsky.app/profile/${author.did}/post/${comment.post.uri.split('/').pop()}`}
					target="_blank"
					rel="noreferrer noopener"
				>
					<p>{(comment.post.record as any)?.text}</p>
					{/* <!-- <Actions post={comment.post} /> -->*/}
				</a>
			</div>
			{comment.replies && comment.replies.length > 0 && (
				<div className="border-l-2 border-gray-600 pl-2">
					{comment.replies.sort(sortByLikes).map(reply => {
						if (!AppBskyFeedDefs.isThreadViewPost(reply)) return null;
						return <Comment key={reply.post.uri} comment={reply} />;
					})}
				</div>
			)}
		</div>
	);
}

export default function Comments({ post }: Props) {
	const { value: thread } = useFetchValue(() => getPostThread(post), [post]);
	const comments = thread?.replies ?? [];
	const commentCount = getCommentCount(comments);

	return (
		<div className="not-prose mt-8">
			<h3>Comments</h3>
			{commentCount > 0 && (
				<>
					<div className="text-purple-950 text-base font-semibold dark:text-purple-100">
						<span className="font-bold">{commentCount}</span> comments from{' '}
						<a className="font-bold text-teal-700 dark:text-teal-400" href={post}>
							Bluesky
						</a>
						, sorted by newest first.
					</div>
					<div className="pt-4">{comments?.map(comment => <Comment key={comment.post.cid} comment={comment} />)}</div>
				</>
			)}
		</div>
	);
}
