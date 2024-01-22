// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'huge-uploader' {
	export default class HugeUploader {
		constructor(options: {
			endpoint: string;
			file: File;
		});
		on(event: string, callback: (body: { detail: any }) => void): void;
	}
}

declare module '@fortawesome/free-solid-svg-icons/index.es' {
  export * from '@fortawesome/free-solid-svg-icons';
}
export {};
