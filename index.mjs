import { readdirSync, writeFileSync } from "node:fs";

import { join } from "node:path";

const getFilesRecursively = directory => {
	return readdirSync(directory, { withFileTypes: true }).flatMap(file =>
		file.isDirectory()
			? getFilesRecursively(join(directory, file.name))
			: join(directory, file.name)
	);
};

const createList = () => {
		const list = getFilesRecursively("./rules");
		const mergedList = [];

		for (let i = 0; i < list.length; i++) {
			const splittedName = list[i].split("/");
			const platform = splittedName[1];
			const brand = splittedName[2];
			const ocversion = splittedName[3];
			const model = splittedName[4].split(".")[0];

			mergedList.push({
				cpu: `${platform}_${brand}_${model}`,
				ocversion
			});
		}

		const mergeObjects = mergedList.reduce(
			(m, { cpu: n, ocversion: v }) => ({
				...m,
				[n]: [...(m[n] || []), v].flat(1)
			}),
			{}
		);
		const returnList = Object.entries(mergeObjects).map(([n, v]) => ({
			codename: n,
			supportedVersions: v
		}));

		return returnList;
	},
	createFile = input => {
		const data = JSON.stringify(input);

		writeFileSync("./oc_versions.json", data);
	};

const list = createList();

createFile(list);
