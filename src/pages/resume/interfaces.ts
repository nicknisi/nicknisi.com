type DateString = `${number}` | `${number}-${number}-${number}`;

export interface BasicInfo {
	name: string;
	label: string;
	image: string;
	email: string;
	phone: string;
	url: string;
	summary: string;
	location: Location;
	profiles: Profile[];
}

export interface Location {
	address: string;
	postalCode: string;
	city: string;
	countryCode: string;
	region: string;
}

export interface Profile {
	network: string;
	username: string;
	url: string;
	hidden?: boolean;
}

export interface Position {
	name: string;
	image?: string;
	remote: boolean;
	description?: string;
	location?: string;
	position: string;
	summary?: string;
	url: string;
	startDate: DateString;
	endDate?: DateString;
	highlights: string[];
	hidden?: boolean;
}

export interface Education {
	institution: string;
	area: string;
	studyType: string;
	startDate: DateString;
	endDate: DateString;
}

export interface Publication {
	name: string;
	releaseDate: DateString;
	publisher: string;
	url: string;
	summary: string;
	hidden?: boolean;
}

export interface Skill {
	name: string;
	level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
	language: string;
	fluency: string;
}

export interface Project {
	name: string;
	image?: string;
	startDate?: DateString;
	endDate?: DateString;
	description: string;
	highlights: string[];
	keywords: string[];
	url: string;
	roles: string[];
	type:
		| 'podcast'
		| 'meetup'
		| 'conference'
		| 'workshop'
		| 'talk'
		| 'article'
		| 'book'
		| 'video'
		| 'course'
		| 'project'
		| 'other'
		| 'oss';
	entity: string;
	hidden?: boolean;
}

export interface Resume {
	basics: BasicInfo;
	work: Position[];
	education: Education[];
	publications: Publication[];
	skills: Skill[];
	languages: Language[];
	projects: Project[];
}

export default Resume;
