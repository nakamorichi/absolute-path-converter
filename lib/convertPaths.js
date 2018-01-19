"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const recursive = require("recursive-readdir");
const Fs = require("fs");
const xregexp = require("xregexp");
const HAS_BACKSLASH_SEPARATOR = Path.sep === '\\';
try {
    require('source-map-support').install();
}
catch (error) {
    console.warn('Source map support unavailable ("source-map-support" required). Proceeding without.');
}
exports.convertPaths = (conversionTargetRoot) => {
    if (!conversionTargetRoot)
        throw Error('Could not determine conversion target root');
    recursive(conversionTargetRoot, ['!*.js'], (error, files) => {
        files.forEach(file => {
            const fileContent = Fs.readFileSync(file, 'utf-8');
            const regex = xregexp(/require\(["']([^"']*)["']\)/);
            const modifiedFileContent = xregexp.replace(fileContent, regex, (wholeRequire, modulePath) => {
                try {
                    require(modulePath);
                    return wholeRequire;
                }
                catch (error) {
                    let newRequirePath = Path.relative(`${file}/..`, `${conversionTargetRoot}/${modulePath}`);
                    if (newRequirePath[0] !== '.')
                        newRequirePath = './' + newRequirePath;
                    if (HAS_BACKSLASH_SEPARATOR) {
                        newRequirePath = newRequirePath.replace(/\\/g, '/');
                    }
                    return `require("${newRequirePath}")`;
                }
            }, 'all');
            Fs.writeFileSync(file, modifiedFileContent);
        });
    });
};
//# sourceMappingURL=convertPaths.js.map