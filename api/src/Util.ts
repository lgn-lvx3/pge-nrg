import type { Context, HttpRequest } from "@azure/functions";
import type { User } from "./Types";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export abstract class Utils {
	// generates a basic id
	static basicId(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	static checkAuthorization(req: HttpRequest): User | null {
		const header = req.headers["x-ms-client-principal"];
		if (!header) {
			return null;
		}

		// decode the auth info
		const encoded = Buffer.from(header, "base64");
		const decoded = encoded.toString("ascii");

		// get user info
		const user = JSON.parse(decoded);

		return user;
	}
}
