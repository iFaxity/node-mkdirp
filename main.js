const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const version = process.version.substring(1).split('.').map(i => i | 0);

module.exports = async function mkdirp(dirpath, mode = 0777) {
  dirpath = path.resolve(dirpath);

  // Use native mkdirp function if supported (v10.12.0)
  if (version[0] > 10 || (version[0] == 10 && version[1] >= 12)) {
    return mkdir(dirpath, { recursive: true, mode });
  }

  try {
    await mkdir(dirpath, mode);
    return true;
  } catch(ex) {
    if(ex.code == 'ENOENT') {
      // Create parent directory then try again
      await mkdirp(path.dirname(dirpath), mode);
      return await mkdirp(dirpath, mode);
    } else {
      try {
        // If not a directory then throw error, if not then just return false to indicate we didn't create a directory.
        const dirstat = await stat(dirpath);

        if(!dirstat.isDirectory()) throw ex;

        return false;
      } catch (_) {
        // If stat fails then throw first error
        throw ex;
      }
    }
  }
};
