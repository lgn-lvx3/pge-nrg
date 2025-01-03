// biome-ignore lint/style/useImportType: <explanation>
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosDao } from "../src/CosmosDao";
import type { EnergyEntry } from "../src/Types";

const httpTrigger: AzureFunction = async (
	context: Context,
	req: HttpRequest,
): Promise<void> => {
	context.log(`HTTP trigger for energy history - ${req.method}`);
	// const user = Utils.checkAuthorization(req);

	// if (!user) {
	// 	context.res = {
	// 		status: 401,
	// 		body: { message: "Unauthorized" },
	// 	};
	// 	return;
	// }

	const user = {
		id: "123",
	};

	if (req.params.id) {
		// get a single entry by id
		const dao = new CosmosDao();
		const entry: EnergyEntry = await dao.getItem(req.params.id);
		context.res = {
			body: { data: entry },
		};
	} else if (req.query.startDate && req.query.endDate) {
		// get all entries between startDate and endDate
		const dao = new CosmosDao();

		// order by entryDate DESC to get the most recent entries first
		const entries: EnergyEntry[] = await dao.find({
			query: `SELECT * FROM c WHERE c.type = 'energyEntry' AND c.userId = '${user.id}' AND c.entryDate >= '${req.query.startDate}' AND c.entryDate <= '${req.query.endDate}' ORDER BY c.entryDate DESC`,
		});
		context.res = {
			body: { data: entries },
		};
	} else {
		// get all entries
		const dao = new CosmosDao();

		// order by to get the most recent entries first
		const entries: EnergyEntry[] = await dao.find({
			query: `SELECT * FROM c WHERE c.type = 'energyEntry' AND c.userId = '${user.id}' ORDER BY c.entryDate DESC`,
		});
		context.res = {
			body: { data: entries },
		};
	}
};

export default httpTrigger;
