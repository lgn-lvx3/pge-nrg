// biome-ignore lint/style/useImportType: <explanation>
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosDao } from "../src/CosmosDao";
import { Utils } from "../src/Util";

const httpTrigger: AzureFunction = async (
	context: Context,
	req: HttpRequest,
): Promise<void> => {
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

	const dao = new CosmosDao();

	const entry = await dao.find({
		query: "SELECT * FROM c WHERE c.type = 'energyEntry'",
	});

	context.log("HTTP trigger function processed a request.");

	context.res = {
		// status: 200, /* Defaults to 200 */
		body: { data: entry },
	};
};

export default httpTrigger;
