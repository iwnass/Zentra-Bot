const fs = require('fs');
const path = require('path');

module.exports = (directory, foldersOnly = false) => {
    let fileNames = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isDirectory()) {
            if (foldersOnly) {
                fileNames.push(filePath);
            }

            // Recursively call getAllFiles for subdirectories
            const subFiles = module.exports(filePath, foldersOnly);
            fileNames = fileNames.concat(subFiles);

        } else if (!foldersOnly && file.isFile()) {
            fileNames.push(filePath);
        }
    }

    return fileNames;
};



//const fs = require('fs');  // Corrected require statement
//const path = require('path');
//
//module.exports = (directory, foldersOnly = false) => {
//    let fileNames = [];
//
//    const files = fs.readdirSync(directory, { withFileTypes: true });
//
//    for (const file of files) {
//        const filePath = path.join(directory, file.name);
//
//        if (foldersOnly) {
//            if (file.isDirectory()) {
//                fileNames.push(filePath);
//            }
//            
//        } else {
//            if (file.isFile()) {  // Corrected typo
//                fileNames.push(filePath);
//            }
//        }
//    }
//
//    return fileNames;
//}
