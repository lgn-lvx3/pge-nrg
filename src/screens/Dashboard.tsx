import { useState, useEffect, useRef, useCallback } from "react";
import type { EnergyEntry } from "../../api/src/Types";
import { Button, Card, Modal, Table } from "react-daisyui";

const calculateAverageUsageForMonth = (
	averageMonthlyUsage: { month: string; averageUsage: number }[],
	monthName: string,
) => {
	const monthlyAverage = averageMonthlyUsage.filter((entry) =>
		entry.month.includes(monthName),
	);
	const total = monthlyAverage.reduce(
		(acc, entry) => acc + entry.averageUsage,
		0,
	);
	return total / monthlyAverage.length;
};

const calculateAverageMonthlyUsage = (entries: EnergyEntry[]) => {
	const usageByMonth: { [key: string]: number[] } = {};

	// biome-ignore lint/complexity/noForEach: <explanation>
	entries.forEach((entry) => {
		const month = new Date(entry.entryDate).toLocaleString("default", {
			month: "long",
			year: "numeric",
		});
		if (!usageByMonth[month]) {
			usageByMonth[month] = [];
		}
		usageByMonth[month].push(entry.usage);
	});

	const averageUsageByMonth = Object.entries(usageByMonth).map(
		([month, usages]) => {
			const totalUsage = usages.reduce((acc, usage) => acc + usage, 0);
			return {
				month,
				averageUsage: Number((totalUsage / usages.length).toFixed(2)),
			};
		},
	);

	return averageUsageByMonth;
};

const calculateAverageMonthlyUsageByMonth = (entries: EnergyEntry[]) => {
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

	const averageMonthlyUsage = calculateAverageMonthlyUsage(entries);
	const averageUsageByMonth = months.map((month) => {
		return {
			month,
			averageUsage: calculateAverageUsageForMonth(averageMonthlyUsage, month),
		};
	});

	return averageUsageByMonth;
};

export function Dashboard() {
	const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// const { userInfo } = useAuth();

	useEffect(() => {
		const fetchEnergyData = async () => {
			try {
				const response = await fetch("/api/energy/history");
				const { data } = await response.json();
				setEnergyEntries(data);
			} catch (err) {
				setError("Failed to fetch energy data");
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEnergyData();
	}, []);

	const ref = useRef<HTMLDialogElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleShow = useCallback(() => {
		ref.current?.show();
	}, [ref]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const averageMonthlyUsageByMonth =
		calculateAverageMonthlyUsageByMonth(energyEntries);
	console.log(averageMonthlyUsageByMonth);

	return (
		<div className="container mx-auto">
			{/* Modal for adding a new entry */}
			<Modal ref={ref} backdrop>
				<Modal.Header className="font-bold">Hello!</Modal.Header>
				<Modal.Body>
					Press ESC key or click the button below to close
				</Modal.Body>
				<Modal.Actions>
					<form method="dialog">
						<Button>Close</Button>
					</form>
				</Modal.Actions>
			</Modal>

			{/* Main content */}
			<div className="flex-1 flex-row justify-between items-center">
				<div className="grid grid-cols-8">
					<div className="col-span-6">
						<Card className="p-3">
							<Card.Title>
								<h1 className="text-4xl font-bold mb-3">
									Energy Usage Entries
								</h1>
							</Card.Title>
							<Card.Actions>
								<Button onClick={handleShow}>Add Entry</Button>
							</Card.Actions>
							<Card.Body>
								<div className="h-[700px] overflow-y-auto">
									<Table pinRows>
										<Table.Head>
											<span>Date</span>
											<span>Usage</span>
											<span>Created</span>
											<span>Input Type</span>
										</Table.Head>

										<Table.Body>
											{energyEntries.map((entry) => (
												<Table.Row key={entry.id}>
													<span>
														{new Date(entry.entryDate).toLocaleDateString()}
													</span>
													<span>{entry.usage} kWh</span>
													<span>
														{new Date(entry.createdAt).toLocaleDateString()}
													</span>
													<span>{entry.createdType}</span>
												</Table.Row>
											))}
										</Table.Body>
									</Table>
								</div>
							</Card.Body>
						</Card>
					</div>
					<div className="flex flex-col">
						<h3 className="text-2xl font-bold mb-10">
							Total Usage:{" "}
							{Number(
								energyEntries.reduce((acc, entry) => acc + entry.usage, 0),
							).toFixed(2)}
							{" kWh"}
						</h3>
						<h3 className="text-2xl font-bold mb-10">
							Average Usage:{" "}
							{Number(
								energyEntries.reduce((acc, entry) => acc + entry.usage, 0) /
									energyEntries.length,
							).toFixed(2)}
							{" kWh"}
						</h3>
						<h3 className="text-2xl font-bold mb-10">
							Average monthly usage:{" "}
						</h3>
						<div className="flex flex-col gap-2">
							{averageMonthlyUsageByMonth.map((entry) => {
								return (
									<div key={entry.month}>
										<span>
											{entry.month} - {Number(entry.averageUsage).toFixed(2)}{" "}
											kWh
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
