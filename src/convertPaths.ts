import * as Path from 'path';
import * as recursive from 'recursive-readdir';
import * as Fs from 'fs';
import * as xregexp from 'xregexp';

try {
	require('source-map-support').install();
} catch (error) {
	console.warn('Source map support unavailable ("source-map-support" required). Proceeding without.');
}

export const convertPaths = (conversionTargetRoot?: string) => {

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
};
