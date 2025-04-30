import { Line } from "react-chartjs-2";
import type { EnergyEntry } from "../../Types";

interface EnergyChartsProps {
	filteredEntries: EnergyEntry[];
}

export function EnergyCharts({ filteredEntries }: EnergyChartsProps) {
	const chartData = {
		labels: filteredEntries.map((entry) =>
			new Date(entry.entryDate).toLocaleDateString(),
		),
		datasets: [
			{
				label: "Energy Usage (kWh)",
				data: filteredEntries.map((entry) => entry.usage),
				borderColor: "rgb(75, 192, 192)",
				tension: 0.1,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: "Energy Usage Over Time",
			},
		},
		scales: {
			x: {
				ticks: {
					maxRotation: 45,
					minRotation: 45,
					autoSkip: true,
					maxTicksLimit: 10,
				},
				grid: {
					display: false,
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(0, 0, 0, 0.1)",
				},
				suggestedMin: 0,
				suggestedMax: 50,
			},
		},
		elements: {
			point: {
				radius: 2,
				hoverRadius: 4,
			},
			line: {
				tension: 0.3,
			},
		},
		interaction: {
			mode: "nearest" as const,
			axis: "x" as const,
			intersect: false,
		},
	};

	return (
		<div className="grid grid-cols-1 gap-4 mb-4">
			<div
				className="bg-white border border-gray-200 rounded-lg p-4"
				style={{ height: "300px" }}
			>
				<Line options={chartOptions} data={chartData} />
			</div>
		</div>
	);
}
