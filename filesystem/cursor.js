import fs from 'fs';

export const flushCursor = async (cursor) => {
  await new Promise((resolve, reject) => {
    fs.writeFile('cursor.dat', cursor, (err) => {
      if (err) return reject(err);
      resolve();
    })
  })
};

export const getPreviousCursor = async () => {
  return new Promise((resolve) => {
    fs.access('cursor.dat', fs.constants.F_OK, (err) => {
      // file does not exist so no previous cursor
      if (err) return resolve('');

      fs.readFile('cursor.dat', (err, data) => {
        if (err) {
          console.log('Failed to recover previous cursor');
          console.log(err);
          resolve('');
        }
        else resolve(data.toString());
      })
    })
  })
}
