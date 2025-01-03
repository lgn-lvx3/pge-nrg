// biome-ignore lint/style/useImportType: <explanation>
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import type { EnergyEntry } from "../src/Types";
import { Utils } from "../src/Util";
import { CosmosDao } from "../src/CosmosDao";

const index: AzureFunction = async (context: Context, req: HttpRequest) => {
	context.log("Energy Input HTTP trigger function processed a request.");

	// // get the user auth info from the request
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

	// get the body of the post call
	const body = req.body;

	// verify required fields are present
	if (!body.date || !body.usage) {
		context.res = {
			status: 400,
			body: { message: "Date and usage are required." },
		};
		return;
	}

	// verify date is a valid date
	if (Number.isNaN(new Date(body.date).getTime())) {
		context.res = {
			status: 400,
			body: { message: "Date is not a valid date." },
		};
		return;
	}

	// verify usage is a number
	if (typeof body.usage !== "number") {
		context.res = {
			status: 400,
			body: { message: "Usage is not a valid number." },
		};
		return;
	}

	// create EnergyEntry object with user id, date, usage
	const energyEntry: EnergyEntry = {
		id: Utils.basicId(),
		userId: user.id,
		date: new Date(body.date),
		createdAt: new Date(),
		usage: body.usage,
		type: "energyEntry",
	};

	// add the object to the database
	const dao = new CosmosDao();
	const result = await dao.addItem(energyEntry);

	// return the object
	context.res = {
		// status: 200, /* Defaults to 200 */
		body: { data: result },
	};
};

export { index };
