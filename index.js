import fs from 'fs';
import readline from 'readline';
import './config/index.js';
import { flushCursor, getPreviousCursor } from './filesystem/cursor.js';
import { execute } from './runner/index.js';

let cursorPosition;
async function main() {
  const previousCursor = await getPreviousCursor();
  const readInterface = readline.createInterface({
    input: fs.createReadStream(process.env.INPUT_FILE),
  });

  let previousCursorFound = previousCursor === '';
  let ids = [];
  for await (const line of readInterface) {
    if (!previousCursorFound) {
      // seek till cursor
      if (line === previousCursor) previousCursorFound = true;
      else continue;
    }

    cursorPosition = line;
    // need to loop through x id's building up an array
    // once you hit x
    //    -> get the resource types from postgres - done
    //    -> get the objects from hapi-fhir - done
    //    -> build up the message and post to kafka
    //    -> flush the cursor - done
    ids.push(line);
    if (ids.length >= 2) {
      await execute(ids);
      await flushCursor(cursorPosition);
      ids = [];
    }
  }
  
  // process end of file batch
  if (ids.length > 0) {
    await execute(ids);
  }
}

main();