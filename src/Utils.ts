// src/Utils.ts
import type { EnergyEntry } from "./Types";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export abstract class Utils {
	static calculateAverageMonthlyUsage = (entries: EnergyEntry[]) => {
		const usageByMonth: { [key: string]: { total: number; count: number } } =
			{};

		// biome-ignore lint/complexity/noForEach: <explanation>
		entries.forEach((entry) => {
			const month = new Date(entry.entryDate).toLocaleString("default", {
				month: "long",
				year: "numeric",
			});
			if (!usageByMonth[month]) {
				usageByMonth[month] = { total: 0, count: 0 };
			}
			usageByMonth[month].total += entry.usage;
			usageByMonth[month].count += 1;
		});

		return Object.entries(usageByMonth).map(([month, { total, count }]) => ({
			month,
			averageUsage: Number((total / count).toFixed(2)),
		}));
	};

	static calculateAverageMonthlyUsageByMonth = (entries: EnergyEntry[]) => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const averageMonthlyUsage = Utils.calculateAverageMonthlyUsage(entries);
		return months.map((month) => {
			const monthData = averageMonthlyUsage.find((entry) =>
				entry.month.includes(month),
			);
			return {
				month,
				averageUsage: monthData ? monthData.averageUsage : 0,
			};
		});
	};
}
