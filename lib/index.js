#!/usr/bin/env node
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
const convertPaths = (conversionTargetRoot) => {
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
const parentProjectRoot = Path.resolve(__dirname, '../../../');
let conversionTargetRoot;
const conversionTargetArgument = process.argv[2];
if (conversionTargetArgument) {
    conversionTargetRoot = Path.resolve(parentProjectRoot, conversionTargetArgument);
}
else {
    try {
        const tsconfigPath = Path.resolve(parentProjectRoot, 'tsconfig.json');
        const tsconfig = require(tsconfigPath);
        if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir) {
            conversionTargetRoot = Path.resolve(parentProjectRoot, tsconfig.compilerOptions.outDir);
        }
        convertPaths(conversionTargetRoot);
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=index.js.map