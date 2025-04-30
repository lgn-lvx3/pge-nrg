import { Table } from "react-daisyui";
import type { EnergyEntry } from "../../Types";
import { Bar } from "react-chartjs-2";

interface EnergySummaryProps {
	selectedYear: string;
	filteredEntries: EnergyEntry[];
	averageMonthlyUsageByMonth: { month: string; averageUsage: number }[];
}

export function EnergySummary({
	selectedYear,
	filteredEntries,
	averageMonthlyUsageByMonth,
}: EnergySummaryProps) {
	const monthlyChartData = {
		labels: averageMonthlyUsageByMonth.map((entry) => entry.month),
		datasets: [
			{
				label: "Average Monthly Usage (kWh)",
				data: averageMonthlyUsageByMonth.map((entry) => entry.averageUsage),
				backgroundColor: "rgba(75, 192, 192, 0.5)",
			},
		],
	};

	const monthlyChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		aspectRatio: 1.5,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: "Average Monthly Energy Usage",
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(0, 0, 0, 0.1)",
				},
			},
		},
	};

	return (
		<div>
			<h3 className="text-2xl font-bold mb-3">
				Data For{" "}
				{selectedYear.toLowerCase() === "all" ? "All Years" : selectedYear}
			</h3>
			<h3 className="text-lg font-bold">
				Total:{" "}
				{Number(
					filteredEntries.reduce((acc, entry) => acc + entry.usage, 0),
				).toFixed(2)}
				{" kWh"}
			</h3>
			<h3 className="text-lg font-bold">
				Average:{" "}
				{Number(
					filteredEntries.reduce((acc, entry) => acc + entry.usage, 0) /
						filteredEntries.length || 0,
				).toFixed(2)}
				{" kWh"}
			</h3>
			<div className="p-0">
				<Table pinRows>
					<Table.Head>
						<span>Month</span>
						<span>Average Usage</span>
					</Table.Head>

					<Table.Body>
						{averageMonthlyUsageByMonth.map((entry) => (
							<Table.Row key={entry.month}>
								<span>{entry.month}</span>
								<span>{Number(entry.averageUsage).toFixed(2)} kWh</span>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</div>
			<div
				className="mt-4 bg-white p-4 rounded-lg shadow"
				style={{ height: "300px" }}
			>
				<Bar options={monthlyChartOptions} data={monthlyChartData} />
			</div>
		</div>
	);
}
