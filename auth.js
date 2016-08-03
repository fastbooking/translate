import fs from 'fs';
import readline from 'readline';
import google from 'googleapis';
import googleAuth from 'google-auth-library';
import {SCOPE} from './config';

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
let SCOPES = SCOPE;
let TOKEN_DIR = ( process.env.HOME || process.env.HOMEPATH ||
	process.env.USERPROFILE ) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

export function authorizeEvent() {
	return new Promise ( function ( resolve ) {
		// Load client secrets from a local file.
		fs.readFile( __dirname + '/client_secret.json', function processClientSecrets( err, content ) {
			if ( err ) {
				console.log( 'Error loading client secret file: ' + err );
				return;
			}
			// Authorize a client with the loaded credentials, then call the
			// Drive API.
			authorize( JSON.parse( content ), resolve );
		} );
	} );
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize( credentials, callback ) {
	if(google._options.auth) {
    return callback( oauth2Client );
  }
	let clientSecret = credentials.installed.client_secret;
	let clientId = credentials.installed.client_id;
	let redirectUrl = credentials.installed.redirect_uris[ 0 ];
	let auth = new googleAuth();
	let oauth2Client = new auth.OAuth2( clientId, clientSecret, redirectUrl );

	// Check if we have previously stored a token.
	fs.readFile( TOKEN_PATH, function ( err, token ) {
		if ( err ) {
			getNewToken( oauth2Client, callback );
		} else {
			oauth2Client.credentials = JSON.parse( token );
			if ( oauth2Client.credentials.expiry_date < Date.now() ) {
				getNewToken( oauth2Client, callback );
			} else {
				callback( oauth2Client );
			}
		}
	} );
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken( oauth2Client, callback ) {
	console.log( 'test' );
	let authUrl = oauth2Client.generateAuthUrl( {
		access_type: 'offline',
		scope: SCOPES
	} );
	console.log( 'Authorize this app by visiting this url: ', authUrl );
	let rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout
	} );
	rl.question( 'Enter the code from that page here: ', function ( code ) {
		rl.close();
		oauth2Client.getToken( code, function ( err, token ) {
			if ( err ) {
				console.log( 'Error while trying to retrieve access token', err );
				return;
			}
			oauth2Client.credentials = token;
			storeToken( token );
			callback( oauth2Client );
		} );
	} );
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken( token ) {
	try {
		fs.mkdirSync( TOKEN_DIR );
	} catch ( err ) {
		if ( err.code != 'EEXIST' ) {
			throw err;
		}
	}
	fs.writeFile( TOKEN_PATH, JSON.stringify( token ) );
	console.log( 'Token stored to ' + TOKEN_PATH );
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles( auth ) {
	let service = google.drive( 'v3' );
	service.files.list( {
		auth: auth,
		pageSize: 10,
		fields: "nextPageToken, files(id, name)"
	}, function ( err, response ) {
		if ( err ) {
			console.log( 'The API returned an error: ' + err );
			return;
		}
		let files = response.files;
		if ( files.length == 0 ) {
			console.log( 'No files found.' );
		} else {
			console.log( 'Files:' );
			for ( let i = 0; i < files.length; i++ ) {
				let file = files[ i ];
				console.log( '%s (%s)', file.name, file.id );
			}
		}
	} );
}

