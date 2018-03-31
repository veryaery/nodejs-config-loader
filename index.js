// core modules
const fs = require("fs");

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

    static write(file, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, content, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
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

}

// export
module.exports = ConfigLoader;