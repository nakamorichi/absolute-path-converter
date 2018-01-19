#!/usr/bin/env node

import * as Path from 'path';
import * as recursive from 'recursive-readdir';
import * as Fs from 'fs';
import * as xregexp from 'xregexp';

const HAS_BACKSLASH_SEPARATOR = Path.sep === '\\';

try {
	require('source-map-support').install();
} catch (error) {
	console.warn('Source map support unavailable ("source-map-support" required). Proceeding without.');
}

const convertPaths = (conversionTargetRoot?: string) => {

	if (!conversionTargetRoot) throw Error('Could not determine conversion target root');

	recursive(conversionTargetRoot, ['!*.js'], (error, files) => {
		files.forEach(file => {
			const fileContent = Fs.readFileSync(file, 'utf-8');
			const regex = xregexp(/require\(["']([^"']*)["']\)/);
			const modifiedFileContent = xregexp.replace(
				fileContent,
				regex,
				(wholeRequire: string, modulePath: string) => {
					try {
						require(modulePath);
						return wholeRequire;
					} catch (error) {
						let newRequirePath = Path.relative(`${file}/..`, `${conversionTargetRoot}/${modulePath}`);
						if (newRequirePath[0] !== '.') newRequirePath = './' + newRequirePath;
						// Fix backslash path separator
						if (HAS_BACKSLASH_SEPARATOR) {
							newRequirePath = newRequirePath.replace(/\\/g, '/');
						}
						return `require("${newRequirePath}")`;
					}
				},
				'all',
			);
			Fs.writeFileSync(file, modifiedFileContent);
		});
	});
};


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

