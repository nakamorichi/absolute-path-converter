#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const convertPaths_1 = require("./convertPaths");
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
        convertPaths_1.convertPaths(conversionTargetRoot);
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=index.js.map