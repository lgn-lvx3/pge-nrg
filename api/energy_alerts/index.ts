// biome-ignore lint/style/useImportType: <explanation>
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Utils } from "../src/Util";
import { ALERT_CHANNEL, REQUEST_METHOD, type Alert } from "../src/Types";
import { CosmosDao } from "../src/CosmosDao";

const httpTrigger: AzureFunction = async (
	context: Context,
	req: HttpRequest,
): Promise<void> => {
	context.log("HTTP trigger function processed a request.");

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

	const method = req.method;
	if (method === REQUEST_METHOD.GET) {
		const dao = new CosmosDao();
		const alerts = await dao.find({
			query: `SELECT * FROM c WHERE c.userId = '${user.id}' AND c.type = 'alert'`,
		});

		context.res = {
			body: { data: alerts },
		};
	} else if (method === REQUEST_METHOD.POST) {
		const body = req.body;
		if (!body.threshold) {
			context.res = {
				status: 400,
				body: { message: "Threshold is required." },
			};
			return;
		}

		const alert: Alert = {
			id: `${user.id}-alert`, // adding string here to make sure it's unique / singular
			userId: user.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			threshold: body.threshold,
			channels: body.channels || [ALERT_CHANNEL.EMAIL], // default to email
			type: "alert",
		};

		const dao = new CosmosDao();

		// addItem here is an upsert
		const result = await dao.addItem(alert);

		context.res = {
			// status: 200, /* Defaults to 200 */
			body: { data: result },
		};
	} else {
		context.res = {
			status: 405,
			body: { message: "Method not allowed." },
		};
	}
};

export default httpTrigger;
