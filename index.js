import google from 'googleapis';
import fs from 'fs';
import path from 'path';
import csvtojson from 'csvtojson';
import gettextParser from 'gettext-parser';
import mkdirp from 'mkdirp';
import {
	DOCUMENT_ID,
	LANGUAGE_FOLDER,
	TRANSLATION_FILE,
	LANGUAGES
} from './config';
import {
	authorizeEvent
} from './auth';

let location = path.join( __dirname, '../', LANGUAGE_FOLDER );

authorizeEvent()
	.then( getLanguageLocation )
	.then( performDownload )
	.then( convertToJSON )
	.then( generatePO )
	.then( formatJSON )
	.then( saveJSON );

function getLanguageLocation( auth ) {
	console.log( '> LANGUAGE FOLDER' );
	return new Promise( ( resolve, reject ) => {
		log_date( 'Verifying location...' );
		mkdirp( location , function ( err ) {
			if ( err ) {
				console.error( err );
				reject( err );
			} else {
				log_date( `Location: ${location}` );
				resolve( auth );
			}
		} );
	} );
}

function performDownload( auth ) {
	let fileId       = DOCUMENT_ID;
	let fileLocation = path.join( location, TRANSLATION_FILE + '.csv' );
	let dest         = fs.createWriteStream( fileLocation );
	let drive        = google.drive( 'v3' );

	return new Promise ( ( resolve ) => {
		dest.addListener( 'finish', resolve );
		
		console.log( '\n> DOWNLOAD CSV' );
		log_date( 'Downloading translation file from Google Drive...' );
		drive.files.export( {
				fileId: fileId,
				mimeType: 'text/csv',
				auth: auth
			} )
			.on( 'end', function () {
				log_date( 'Translation file successfully downloaded as CVS!' );
				log_date( `File location: ${fileLocation}` );
			} )
			.on( 'error', function ( err ) {
				log_date( `> Error during download ${err}` );
			} )
			.pipe( dest );
	} );
}

function convertToJSON() {
	return new Promise ( ( resolve, reject ) => {
		let converter   = new csvtojson.Converter( {} );
		let CVSlocation = path.join( location, TRANSLATION_FILE + '.csv' );

		fs.readFile( CVSlocation, 'UTF-8', ( err, result ) => {
			
			// format string to support escaping of characters
			converter.preProcessRaw = ( data, conv ) => {
				data = data.replace( /\\""/g, '\\\\\\"');
				data = data.replace( /""/g, '\\"');
				conv( data );
			};

			converter.fromString( result, ( err, json ) => {
				if ( err ) {
					reject( err )
				}
				resolve( json );
			} );

		} );
	} );
}


function generatePO( translations ) {

	let translation_table = new Map();

	// set PO header for each column
	LANGUAGES.forEach( ( value, key ) => {
		let header_str = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"MIME-Version: 1.0\\n"
"Language: ${key}\\n"
"X-Generator: FB-google-drive-to-json-po-mo 1.0.0\\n"

`;

		translation_table.set( key, header_str );
	} );

	translations.map( ( translation ) => {
		let english = Object.keys( translation )[ 0 ];
		LANGUAGES.forEach( ( value, key ) => {
			let phrase = `msgid "${translation[ english ]}"
msgstr "${translation[value]}"

`;

			let current_translation = translation_table.get( key ) + phrase;
			translation_table.set( key, current_translation )
		} );
	} );

	LANGUAGES.forEach( ( value, key ) => {
		let PO_location      = path.join( location, key + '.po' );
		let translation_lang = translation_table.get( key );

		fs.writeFile( PO_location, translation_lang, ( err ) => {
			if ( err ) throw err;
			log_date( `PO file[ ${value} ] ${PO_location}` );
			saveMO( key, translation_lang );
		} );
	} );

	return new Promise ( ( resolve ) => {
		resolve( translations );
	} );
}

function saveMO ( key, translation ) {
	let MO_location = path.join( location, key + '.mo' );
	let po_obj      = gettextParser.po.parse( translation );
	let mo_obj      = gettextParser.mo.compile( po_obj);

	fs.writeFile( MO_location, mo_obj, ( err ) => {
		if ( err ) throw err;
		log_date( `MO file[ ${key} ] ${MO_location}` );
	} );
}

function formatJSON( translations ) {
	return new Promise( ( resolve ) => {
		let pretty_translate = {};
		translations.map( ( translation ) => {
			let first_key = translation[ Object.keys( translation )[ 0 ] ];
			pretty_translate[ first_key ] = translation;
		} );
		resolve( pretty_translate );
	} );
}

function saveJSON( pretty_translations ) {
	console.log( '\n> PROCESS CSV' );
	let JSONlocation = path.join( location, TRANSLATION_FILE + '.json' );

	fs.writeFile( JSONlocation, JSON.stringify( pretty_translations ), ( err ) => {
		if ( err ) throw err;
		log_date( `JSON ${JSONlocation}` );
	} );
}

function log_date( str ) {
	let time = new Date();
	let now = `[${`0${time.getHours()}`.slice( -2 )}:${`0${time.getMinutes()}`.slice( -2 )}:${`0${time.getSeconds()}`.slice( -2 )}]`;
	console.log( now, str );
}
