// core modules
const fs = require("fs");
const path = require("path");

// community modules
const Promise = require("promise");

class ConfigLoader {

    constructor(files) {

    }

    static read(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data.toString());
                }
            });
        });
    }

    static readJSON(file) {
        return new Promise((resolve, reject) => {
            ConfigLoader.read(file)
                .then(content => {
                    try {
                        resolve(JSON.parse(content));
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch(reject);
        });
    }

    static _checkDirectory(file) {
        return new Promise((resolve, reject) => {
            const directory = path.dirname(path.resolve(__dirname, file));

            fs.access(directory, fs.constants.R_OK | fs.constants.W_OK, (error) => {
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

    static write(file, content) {
        return new Promise((resolve, reject) => {
            ConfigLoader._checkDirectory(file)
                .then(() => {
                    fs.writeFile(file, content, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch(reject);
        });
    }

    static writeJSON(file, object) {
        return new Promise((resolve, reject) => {
            try {
                ConfigLoader.write(file, JSON.stringify(object, null, 4))
                    .then(resolve)
                    .catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    static load(file, defaults) {
        return new Promise((resolve, reject) => {
            fs.access(file, fs.constants.R_OK, (error) => {
                if (error) {
                    ConfigLoader.write(file, defaults)
                        .then(resolve)
                        .catch(reject);
                } else {
                    ConfigLoader.read(file)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    static loadJSON(file, defaults) {
        return new Promise((resolve, reject) => {
            fs.access(file, fs.constants.R_OK, (error) => {
                if (error) {
                    ConfigLoader.writeJSON(file, defaults)
                        .then(resolve)
                        .catch(reject);
                } else {
                    ConfigLoader.readJSON(file)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

}

// export
module.exports = ConfigLoader;