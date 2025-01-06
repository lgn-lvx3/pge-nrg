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

	const entryModal = useRef<HTMLDialogElement>(null);
	const uploadModal = useRef<HTMLDialogElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleEntryModal = useCallback(() => {
		entryModal.current?.show();
	}, [entryModal]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleUploadModal = useCallback(() => {
		uploadModal.current?.show();
	}, [uploadModal]);

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
			<Modal ref={entryModal}>
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
			<Modal ref={uploadModal} backdrop>
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
				<div className="grid grid-cols-8 gap-3">
					<div className="col-span-6">
						<Card className="p-3 shadow-xl">
							<Card.Body>
								<Card.Title>
									<h1 className="text-4xl font-bold mb-3">
										Energy Usage Entries
									</h1>
								</Card.Title>
								<Card.Actions>
									<Button onClick={handleEntryModal}>Add Entry</Button>
									<Button className="btn-link" onClick={handleUploadModal}>
										Upload CSV
									</Button>
								</Card.Actions>
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
					<div className="grid col-span-2">
						<Card className="shadow-xl">
							<Card.Body>
								<h3 className="text-2xl font-bold">
									Total:{" "}
									{Number(
										energyEntries.reduce((acc, entry) => acc + entry.usage, 0),
									).toFixed(2)}
									{" kWh"}
								</h3>
								<h3 className="text-2xl font-bold">
									Average:{" "}
									{Number(
										energyEntries.reduce((acc, entry) => acc + entry.usage, 0) /
											energyEntries.length,
									).toFixed(2)}
									{" kWh"}
								</h3>
								<div className="">
									<Table pinRows>
										<Table.Head>
											<span>Month</span>
											<span>Average Usage</span>
										</Table.Head>

										<Table.Body>
											{averageMonthlyUsageByMonth.map((entry) => {
												return (
													<Table.Row key={entry.month}>
														<span>{entry.month}</span>
														<span>
															{Number(entry.averageUsage).toFixed(2)} kWh
														</span>
													</Table.Row>
												);
											})}
										</Table.Body>
									</Table>
								</div>
							</Card.Body>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
