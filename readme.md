## Setting Configuration

Update config.js file for project settings.
   
   - **LANGUAGE_FOLDER** location

   - **DOCUMENT_ID** for Google Drive Document ID

      ![Google SpreadSheet Format](img/sheet-format.png?raw=true "Google SpreadSheet Format")

   - **TRANSLATION_FILE** for the filename of the generated csv and json

   - **LANGUAGES** map configuration starting from the second column

      ```
      export const LANGUAGES = new Map ( [
      	[ 'ja', 'Japanese' ],
      	[ 'zh_CN', 'CN Simplified' ],
      	[ 'zh_TW', 'CN Traditional' ]
      ] );
      ```

## Running the script
```
npm run lang
```
