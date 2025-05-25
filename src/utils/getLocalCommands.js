const path = require('path');
//const getAllFiles = require('C:/Users/ionas/Desktop/my stuff/liveserver/code/thrift shop bot/src/utils/getAllFiles.js');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (exceptions = []) => {  // Ensure exceptions is an array by defaulting to an empty array
    let localCommands = [];

    const commandCategories = getAllFiles(
        path.join(__dirname, '..', 'commands'),
        true
    );

    for (const commandCategory of commandCategories) {
        const commandFiles = getAllFiles(commandCategory);

        for (const commandFile of commandFiles) {
            const commandObject = require(commandFile);

            // Check if exceptions is an array before using includes
            if (Array.isArray(exceptions) && exceptions.includes(commandObject.name)) {
                continue;
            }

            //console.log(commandObject);
            localCommands.push(commandObject);
        }
    }

    return localCommands;
}


