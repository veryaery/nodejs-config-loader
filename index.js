// core modules
const fs = require("fs");
const path = require("path");

// community modules
const Promise = require("promise");

function checkDirectory(directory) {
    return new Promise((resolve, reject) => {
        fs.access(directory, (error) => {
            if (error) {
                fs.mkdir(directory, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

async function loadFile(file, defaults) {
    return new Promise(async (resolve, reject) => {
        try {
            await checkDirectory(path.dirname(file));
        } catch (error) {
            reject(error);
        }

        fs.access(file, (error) => {
            if (error) {
                const data = defaults instanceof Object ? JSON.stringify(defaults, null, 4) : defaults;

                fs.writeFile(file, data, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(defaults);
                    }
                });
            } else {
                fs.readFile(file, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        try {
                            resolve(JSON.parse(data.toString()));
                        } catch (error) {
                            resolve(data.toString());
                        }
                    }
                });
            }
        });
    });
}

async function loadFiles(files, directory) {
    return new Promise(async (resolve, reject) => {
        const object = {};

        for (const key in files) {
            const defaults = files[key];
            const keyFile = path.resolve(directory, key);

            if (defaults instanceof Object && !path.extname(key)) {
                // it's a directory
                try {
                    object[key] = await loadFiles(defaults, keyFile);
                } catch (error) {
                    reject(error);
                }
            } else {
                // it's a file
                const name = path.basename(key, path.extname(key));

                try {
                    object[name] = await loadFile(keyFile, defaults);
                } catch (error) {
                    reject(error);
                }
            }
        }

        resolve(object);
    });
}

function load(files) {
    return loadFiles(files, process.cwd());
}

// exports
module.exports = load;