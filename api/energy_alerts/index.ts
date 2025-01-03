// biome-ignore lint/style/useImportType: <explanation>
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Utils } from "../src/Util";
import { ALERT_CHANNEL, REQUEST_METHOD, type Alert } from "../src/Types";
import { CosmosDao } from "../src/CosmosDao";

const httpTrigger: AzureFunction = async (
	context: Context,
	req: HttpRequest,
): Promise<void> => {
	context.log(`HTTP trigger for energy alerts - ${req.method}`);

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

	switch (req.method) {
		case REQUEST_METHOD.GET: {
			if (!req.params.id) {
				// get all alerts for a user
				const dao = new CosmosDao();
				const alerts = await dao.find({
					query: `SELECT * FROM c WHERE c.userId = '${user.id}' AND c.type = 'alert'`,
				});

				context.res = {
					body: { data: alerts },
				};
			} else {
				// get a single alert by id
				const dao = new CosmosDao();
				const alert: Alert = await dao.getItem(req.params.id);

				context.res = {
					body: { data: alert },
				};
			}

			break;
		}
		case REQUEST_METHOD.POST: {
			const body = req.body;
			if (!body.threshold || typeof body.threshold !== "number") {
				context.res = {
					status: 400,
					body: { message: "Threshold is required." },
				};
				return;
			}

			const alert: Alert = {
				id: Utils.basicId(),
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
				body: { data: result },
			};
			break;
		}
		case REQUEST_METHOD.DELETE: {
			if (!req.params.id) {
				context.res = {
					status: 400,
					body: { message: "Alert ID is required." },
				};
				return;
			}
			const dao = new CosmosDao();
			const alertId = req.params.id;
			await dao.deleteItem(alertId);

			context.res = {
				body: { data: "Successfully deleted alert." },
			};
			break;
		}
		default: {
			context.res = {
				status: 405,
				body: { message: "Method not allowed." },
			};
		}
	}
};

export default httpTrigger;
