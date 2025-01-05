export enum ALERT_CHANNEL {
	EMAIL = "email",
	SMS = "sms",
}

export enum REQUEST_METHOD {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
}

export type Alert = {
	id: string;
	userId: string;
	userEmail?: string;
	createdAt: Date;
	updatedAt: Date;
	threshold: number;
	channels: ALERT_CHANNEL[];
	type: "alert";
};

export type User = {
	id: string;
	username?: string;
	userRoles?: string[];
	identityProvider?: string;
	email?: string;
	createdAt: Date;
	updatedAt: Date;
	type: "user";
};

export type EnergyEntry = {
	id: string;
	userId: string;
	entryDate: Date;
	usage: number;
	createdAt: Date;
	createdType: "manual" | "upload";
	type: "energyEntry";
};
