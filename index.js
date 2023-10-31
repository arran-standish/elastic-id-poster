import fs from 'fs';
import readline from 'readline';
import './config/index.js';
import { flushCursor, getPreviousCursor } from './filesystem/cursor.js';
import { execute, shutdown } from './runner/index.js';

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
    ids.push(line);
    if (ids.length >= Number(process.env.ID_BATCH_SIZE)) {
      await execute(ids);
      await flushCursor(cursorPosition);
      console.log(`sent ${ids.length} records`);
      ids = [];
    }
  }
  
  // process end of file batch
  if (ids.length > 0) {
    await execute(ids);
    console.log(`sent ${ids.length} records`);
  }
}

main().finally(() => {
  flushCursor('');
  shutdown();
});
