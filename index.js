// core modules
const fs = require("fs");
const path = require("path");

// community modules
const Promise = require("promise");

class ConfigLoader {

    constructor(files) {
        this._loadFiles(files, __dirname, this);
    }

    _checkDirectory(directory) {
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

    async _loadFile(file, defaults, object) {
        return new Promise(async (resolve, reject) => {
            try {
                await this._checkDirectory(path.dirname(file));
            } catch (error) {
                reject(error);
            }

            const name = path.basename(file, path.extname(file));

            fs.access(file, (error) => {
                if (error) {
                    const data = defaults instanceof Object ? JSON.stringify(defaults, null, 4) : defaults;

                    fs.writeFile(file, data, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            object[name] = defaults;
                            resolve();
                        }
                    });
                } else {
                    fs.readFile(file, (error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            try {
                                object[name] = JSON.parse(data.toString());
                            } catch (error) {
                                object[name] = data.toString();
                            }

                            resolve();
                        }
                    });
                }
            });
        });
    }

    async _loadFiles(files, directory, object) {
        return new Promise(async (resolve, reject) => {
            for (const key in files) {
                const defaults = files[key];
                const keyFile = path.resolve(directory, key);

                if (defaults instanceof Object && !path.extname(key)) {
                    // it's a directory
                    object[key] = {};

                    try {
                        await this._loadFiles(defaults, keyFile, object[key]);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    // it's a file
                    try {
                        await this._loadFile(keyFile, defaults, object);
                    } catch (error) {
                        reject(error);
                    }
                }

                resolve();
            }
        });
    }

}

// export
module.exports = ConfigLoader;