export type TalkSource = 'youtube' | 'vimeo' | 'page' | 'website';
export type TalkType = 'talk' | 'workshop' | 'panel' | 'keynote' | 'interview' | 'other';

export interface Talk {
	title: string;
	date: string;
	location?: string;
	url: string;
	videoId: string;
	promote?: boolean;
	source: TalkSource;
	type: TalkType;
	remote?: boolean;
	multiple?: boolean;
}
