#!/usr/bin/env node

import * as Path from 'path';
import * as recursive from 'recursive-readdir';
import * as Fs from 'fs';
import * as xregexp from 'xregexp';

const parentProjectRoot = Path.resolve(__dirname, '../../../');

let conversionTargetRoot: string | undefined;

const conversionTargetArgument = process.argv[2];

if (conversionTargetArgument) {
	conversionTargetRoot = Path.resolve(parentProjectRoot, conversionTargetArgument);
} else {
	try {
		const tsconfigPath = Path.resolve(parentProjectRoot, 'tsconfig.json');
		const tsconfig = require(tsconfigPath);
		if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir) {
			conversionTargetRoot = Path.resolve(parentProjectRoot, tsconfig.compilerOptions.outDir);
		}
	} catch (error) {}
}

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
					return `require("${newRequirePath}")`;
				}
			},
			'all',
		);
		Fs.writeFileSync(file, modifiedFileContent);
	});
});
