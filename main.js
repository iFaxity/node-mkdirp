const { promisify } = require('util');

const fs = require('fs');
const path = require('path');
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

module.exports = async function mkdirp(dirpath, mode = 0777) {
  dirpath = path.resolve(dirpath);

  try {
    await mkdir(dirpath, mode);
    return true;
  }
  catch(ex) {
    // If parent dir doesnt exist then create parent directory first then try again
    if(ex.code == 'ENOENT') {
      await mkdirp(path.dirname(dirpath), mode);
      return await mkdirp(dirpath, mode);
    } else {
      // In the case of any other error, just see if there's a dir there already.
      try {
        // Check if something else is borker or if directory already exists
        const dirstat = await stat(dirpath);
        if(!dirstat.isDirectory()) throw ex;

        // Directory exists already yay! report that none was created
        return false;
      } catch(_) {
        // If stat fails then throw first exception it's for weirdness
        throw ex;
      }
    }
  }
};