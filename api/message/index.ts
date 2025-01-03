// biome-ignore lint/style/useImportType: <explanation>
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async (
	context: Context,
	req: HttpRequest,
): Promise<void> => {
	context.log("HTTP trigger function processed a request.");

	context.res = {
		// status: 200, /* Defaults to 200 */
		body: { text: "hello" },
	};
};

export default httpTrigger;
