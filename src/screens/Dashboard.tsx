import { useState, useEffect, useRef, useCallback } from "react";
import type { EnergyEntry } from "../../api/src/Types";
import { Button, Card, Input, Modal, Table } from "react-daisyui";
import { Utils } from "@/Utils";
import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router";

type InputEntry = {
	date: string;
	usage: number;
};

export function Dashboard() {
	const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const [entry, setEntry] = useState<InputEntry | null>(null);
	const [uploadUrl, setUploadUrl] = useState<string | null>(null);

	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	const fetchEnergyData = async () => {
		setIsLoading(true);
		const response = await fetch("/api/energy/history");
		console.log(response);
		if (response.ok) {
			const { data } = await response.json();
			setEnergyEntries(data);
		} else {
			setError("Failed to fetch energy data");
		}
		setIsLoading(false);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchEnergyData();
	}, []);

	const handleEntrySubmit = async () => {
		console.log(entry);
		setError(null);
		setSuccess(null);
		const response = await fetch("/api/energy/input", {
			method: "POST",
			body: JSON.stringify(entry),
		});

		if (response.ok) {
			await fetchEnergyData();
			setEntry(null);
			const { message } = await response.json();
			setSuccess(message);
		} else {
			const { message } = await response.json();
			setError(message);
		}
	};

	const handleUploadSubmit = async () => {
		console.log(uploadUrl);
		setError(null);
		setSuccess(null);
		const response = await fetch(`/api/energy/upload?url=${uploadUrl}`, {
			method: "POST",
		});

		if (response.ok) {
			await fetchEnergyData();
			setUploadUrl(null);
			const { message } = await response.json();
			setSuccess(message);
		} else {
			const { message } = await response.json();
			setError(message);
		}
	};

	// eslint-disable-next-line react-hooks/rules-of-hooks

	const entryRef = useRef<HTMLDialogElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleEntryShow = useCallback(() => {
		setEntry(null);
		setError(null);
		setSuccess(null);
		entryRef.current?.showModal();
	}, [entryRef]);

	const uploadRef = useRef<HTMLDialogElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleUploadShow = useCallback(() => {
		setUploadUrl(null);
		setError(null);
		setSuccess(null);
		uploadRef.current?.showModal();
	}, [uploadRef]);

	const averageMonthlyUsageByMonth =
		Utils.calculateAverageMonthlyUsageByMonth(energyEntries);

	return (
		<div className="container mx-auto">
			{/* Modal for adding a new entry */}
			<Modal ref={entryRef} ariaHidden={false} backdrop={true}>
				<Modal.Header className="font-bold">Add Energy Entry</Modal.Header>
				<Modal.Body>
					<div className="flex flex-row gap-2">
						<div className="form-control w-full max-w-xs">
							<label className="label">
								<span className="label-text">Date</span>
							</label>
							<Input
								type="text"
								value={entry?.date || ""}
								onChange={(e) =>
									setEntry({
										date: e.target.value,
										usage: entry?.usage || 0,
									})
								}
							/>
							<label className="label">
								<span className="label-text-alt">YYYY-MM-DD</span>
							</label>
						</div>
						<div className="form-control w-full max-w-xs">
							<label className="label">
								<span className="label-text">Amount</span>
							</label>
							<Input
								type="number"
								value={entry?.usage || ""}
								onChange={(e) =>
									setEntry({
										date: entry?.date || "",
										usage: Number(e.target.value),
									})
								}
							/>
							<label className="label">
								<span className="label-text-alt">kWh</span>
							</label>
						</div>
					</div>
					{error && <div className="text-red-500">{error}</div>}
					{success && <div className="text-green-500">{success}</div>}
				</Modal.Body>
				<Modal.Actions>
					<form method="dialog">
						<Button
							loading={isLoading}
							onClick={(event) => {
								event.preventDefault();
								setIsLoading(true);
								handleEntrySubmit();
								setIsLoading(false);
							}}
						>
							Submit
						</Button>
					</form>
				</Modal.Actions>
			</Modal>
			<Modal ref={uploadRef} ariaHidden={false} backdrop={true}>
				<Modal.Header className="font-bold">Upload CSV by URL</Modal.Header>
				<Modal.Body>
					<div className="form-control w-full max-w-xs">
						<label className="label">
							<span className="label-text">URL</span>
						</label>
						<Input
							type="text"
							value={uploadUrl || ""}
							onChange={(e) => setUploadUrl(e.target.value)}
						/>
						<label className="label">
							<span className="label-text-alt">
								https://example.com/energy.csv
							</span>
						</label>
					</div>
					{error && <div className="text-red-500">{error}</div>}
					{success && <div className="text-green-500">{success}</div>}
				</Modal.Body>
				<Modal.Actions>
					<form method="dialog">
						<Button
							onClick={(event) => {
								event.preventDefault();
								setIsLoading(true);
								handleUploadSubmit();
								setIsLoading(false);
							}}
						>
							Submit
						</Button>
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
									<Button onClick={handleEntryShow}>Add Entry</Button>
									<Button className="btn-link" onClick={handleUploadShow}>
										Upload CSV
									</Button>
									{isLoading && <Button loading={true} />}
								</Card.Actions>
								<div className="h-[700px] overflow-y-auto">
									{energyEntries.length === 0 && (
										<div className="text-center">
											No entries found. Create one!
										</div>
									)}
									{energyEntries.length > 0 && (
										<Table pinRows zebra>
											<Table.Head>
												<span>Date</span>
												<span>Usage</span>
												<span>Created</span>
												<span>Input Type</span>
											</Table.Head>

											<Table.Body>
												{energyEntries.length > 0 &&
													energyEntries.map((entry) => (
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
									)}
								</div>
							</Card.Body>
						</Card>
					</div>
					<div className="grid col-span-2">
						<Card className="shadow-xl">
							<Card.Body>
								{/* <Card.Title>
									<span className="text-2xl font-bold">Energy Data</span>
								</Card.Title> */}
								<h3 className="text-xl font-bold">
									Total:{" "}
									{Number(
										energyEntries.reduce((acc, entry) => acc + entry.usage, 0),
									).toFixed(2)}
									{" kWh"}
								</h3>
								<h3 className="text-xl font-bold">
									Average:{" "}
									{Number(
										energyEntries.reduce((acc, entry) => acc + entry.usage, 0) /
											energyEntries.length || 0,
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
