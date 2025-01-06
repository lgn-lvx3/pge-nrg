import { useState, useEffect, useRef, useCallback } from "react";
import type { Alert } from "../../api/src/Types";
import { Button, Card, Input, Modal, Table } from "react-daisyui";
import { useNavigate } from "react-router";
import { useAuth } from "@/AuthContext";

type AlertEntry = Pick<Alert, "threshold">;

export function Alerts() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	const [alertEntries, setAlertEntries] = useState<Alert[]>([]);

	const [alertEntry, setAlertEntry] = useState<AlertEntry | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const fetchAlertsData = async () => {
		try {
			const response = await fetch("/api/energy/alerts");
			const { data } = await response.json();
			setAlertEntries(data);
		} catch (err) {
			setError("Failed to fetch alerts data");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchAlertsData();
	}, []);

	const handleAlertSubmit = async () => {
		console.log(alertEntry);
		setError(null);
		setSuccess(null);
		const response = await fetch("/api/energy/alerts", {
			method: "POST",
			body: JSON.stringify(alertEntry),
		});

		if (response.ok) {
			await fetchAlertsData();
			setAlertEntry(null);
			const { message } = await response.json();
			setSuccess(message);
		} else {
			const { message } = await response.json();
			setError(message);
		}
	};

	const handleAlertDelete = async (id: string) => {
		const response = await fetch(`/api/energy/alerts/${id}`, {
			method: "DELETE",
		});

		if (response.ok) {
			await fetchAlertsData();
			const { message } = await response.json();
			setSuccess(message);
		} else {
			const { message } = await response.json();
			setError(message);
		}
	};

	const entryRef = useRef<HTMLDialogElement>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleEntryShow = useCallback(() => {
		setAlertEntry(null);
		setError(null);
		setSuccess(null);
		entryRef.current?.showModal();
	}, [entryRef]);

	return (
		<div className="container w-full">
			{/* Modal for adding a new entry */}
			<Modal ref={entryRef} ariaHidden={false} backdrop={true}>
				<Modal.Header className="font-bold">Add Energy Entry</Modal.Header>
				<Modal.Body>
					<div className="flex flex-row gap-2">
						<div className="form-control w-full max-w-xs">
							<label className="label">
								<span className="label-text">Threshold</span>
							</label>
							<Input
								type="number"
								value={alertEntry?.threshold || ""}
								onChange={(e) =>
									setAlertEntry({
										threshold: Number(e.target.value),
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
								handleAlertSubmit();
								setIsLoading(false);
							}}
						>
							Submit
						</Button>
					</form>
				</Modal.Actions>
			</Modal>
			{/* Main content */}
			<div className="w-full">
				<div className="col-span-6">
					<Card className="p-3 shadow-xl">
						<Card.Body>
							<Card.Title>
								<h1 className="text-4xl font-bold mb-3">Alert Thresholds</h1>
							</Card.Title>
							<Card.Actions>
								<Button onClick={handleEntryShow}>Add Alert</Button>
							</Card.Actions>
							{alertEntries.length > 0 && (
								<div className="h-[700px] overflow-y-auto">
									<Table pinRows zebra>
										<Table.Head>
											<span>Created</span>
											<span>Threshold</span>
											<span>Channels</span>
											<span>Actions</span>
										</Table.Head>

										<Table.Body>
											{alertEntries.map((entry) => (
												<Table.Row key={entry.id}>
													<span>
														{new Date(entry.createdAt).toLocaleDateString()}
													</span>
													<span>{entry.threshold} kWh</span>
													<span>{entry.channels.join(", ")}</span>
													<span>
														<Button
															className="btn-link"
															onClick={() => handleAlertDelete(entry.id)}
														>
															Delete
														</Button>
													</span>
												</Table.Row>
											))}
										</Table.Body>
									</Table>
								</div>
							)}
							{alertEntries.length === 0 && (
								<div className="text-center">No alerts found. Create one!</div>
							)}
						</Card.Body>
					</Card>
				</div>
			</div>
		</div>
	);
}
