#!/usr/bin/env node

import * as Path from 'path';
import { convertPaths } from './convertPaths';

const parentProjectRoot = Path.resolve(__dirname, '../../../');

let conversionTargetRoot: string | undefined;

const conversionTargetArgument = process.argv[2];

if (conversionTargetArgument) {
	conversionTargetRoot = Path.resolve(parentProjectRoot, conversionTargetArgument);
} else {
	try {
		/**
		* Currently support only outDir parameter of tsconfig.json
		* for determining single module root
		*
		* TODO 1: multiple module root support
		* TODO 2: support also other module path information sources in addition to tsconfig.json
		*/
		const tsconfigPath = Path.resolve(parentProjectRoot, 'tsconfig.json');
		const tsconfig = require(tsconfigPath);
		if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir) {
			conversionTargetRoot = Path.resolve(parentProjectRoot, tsconfig.compilerOptions.outDir);
		}
		convertPaths(conversionTargetRoot);
	} catch (error) {
		console.error(error);
	}
}

