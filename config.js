// Full, permissive scope to access all of a user's files.
// Request this scope only when it is strictly necessary.
// More options here:
// https://developers.google.com/drive/v3/web/about-auth
export const SCOPE = [ 'https://www.googleapis.com/auth/drive' ];

// Folder location relative to current directory
export const LANGUAGE_FOLDER = '/src/language';

// Google Drive Document ID
// export const DOCUMENT_ID = '16Wi59-o0_8Lc7CXErEGJR4ssDFNh0eWJL6wuPkEwDs4';
export const DOCUMENT_ID = '13lu13ej-R_vgmoYJtA2lBOi5Sm8Dbc_tmvJdFBohUKI';

// File name of translation file to be stored at the LANGUAGE_FOLDER
export const TRANSLATION_FILE = 'translation';

// Language code with its corresponding header title on Google Docs
// [ 'language_code', 'header_title']
export const LANGUAGES = new Map ( [
	[ 'ja', 'Japanese' ],
	[ 'zh_CN', 'CN Simplified' ],
	[ 'zh_TW', 'CN Traditional' ]
] );