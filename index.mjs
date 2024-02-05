import { readdirSync, writeFileSync } from "node:fs";

import { join } from "node:path";

const getFilesRecursively = directory => {
	return readdirSync(directory, { withFileTypes: true }).flatMap(file =>
		file.isDirectory() ? getFilesRecursively(join(directory, file.name)) : join(directory, file.name)
	);
};

const createList = () => {
	const list = getFilesRecursively("./rules");
	const mergedList = [];

	for (let i = 0; i < list.length; i++) {
		const [_, platform, __, ocVersion, cpuModel] = list[i].replace(/\\/g, "/").split("/");
		mergedList.push({
			cpuModel: `${platform}_${cpuModel.split(".")[0]}`,
			ocVersion
		});
	}

	const mergeObjects = mergedList.reduce((m, { cpuModel, ocVersion }) => {
		m[cpuModel] = [...(m[cpuModel] || []), ocVersion];
		return m;
	}, {});

	const returnList = Object.entries(mergeObjects).map(([codename, supportedVersions]) => ({
		codename,
		supportedVersions: supportedVersions.sort((a, b) => b.localeCompare(a))
	}));

	return returnList;
};
const createFile = input => {
	const data = JSON.stringify(input);

	writeFileSync("./oc_versions.json", data);
};

const list = createList();
createFile(list);
