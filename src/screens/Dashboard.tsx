import { useState, useEffect, useRef, useCallback } from "react";
import type { EnergyEntry } from "../Types";
import {
	Button,
	Card,
	FileInput,
	Input,
	Modal,
	Table,
	Progress,
} from "react-daisyui";
import { Utils } from "@/Utils";
import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router";
import { BlobServiceClient, type Metadata } from "@azure/storage-blob";

type InputEntry = {
	date: string;
	usage: number;
};

// Define a type for the user information
interface UserPrincipal {
	userId: string;
	userDetails: string;
	identityProvider: string;
	userRoles: string[];
}

export function Dashboard() {
	const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isUploading, setIsUploading] = useState<boolean>(false);

	const [entry, setEntry] = useState<InputEntry | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [userInfo, setUserInfo] = useState<UserPrincipal | null>(null);

	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/");
		} else {
			// Get user information when authenticated
			const getUserInfo = async () => {
				try {
					const response = await fetch("/.auth/me");
					const payload = await response.json();

					// Extract user information from the response
					if (payload.clientPrincipal) {
						const { userId, userDetails, identityProvider, userRoles } =
							payload.clientPrincipal;
						setUserInfo({
							userId: userId || "unknown",
							userDetails: userDetails || "unknown",
							identityProvider: identityProvider || "unknown",
							userRoles: userRoles || [],
						});
					}
				} catch (error) {
					console.error("Failed to get user info:", error);
				}
			};
			getUserInfo();
		}
	}, [isAuthenticated, navigate]);

	async function uploadFileWithProgress(file: File) {
		setIsUploading(true);
		setUploadProgress(0);

		try {
			const response = await fetch("/api/security/generate-sas", {
				method: "POST",
				body: JSON.stringify({
					filename: `${userInfo?.userId}-${file.name}`,
				}),
			});

			console.log("sas response", response);

			if (!response.ok) {
				setError("Failed to upload. Please try again.");
				setIsUploading(false);
				return;
			}

			// sass token
			const { data } = await response.json();

			console.log("sas data", data);

			const containerName = import.meta.env.BLOB_CONTAINER_NAME || "";
			const blobServiceClient = new BlobServiceClient(data);

			const containerClient =
				blobServiceClient.getContainerClient(containerName);

			const blockBlobClient = containerClient.getBlockBlobClient(
				`${userInfo?.userId}-${file.name}`,
			);

			// Then upload the data
			const upload = await blockBlobClient.uploadData(file, {
				onProgress: (ev) => {
					const percent = Math.round((ev.loadedBytes / file.size) * 100);
					console.log(`Upload progress: ${percent}%`);
					setUploadProgress(percent);
				},
			});

			console.log("Upload complete", upload);

			// Add metadata to the blob upload
			const metadata = {
				userId: userInfo?.userId || "unknown",
				// "user-email": userInfo?.userDetails || "unknown",
				// "identity-provider": userInfo?.identityProvider || "unknown",
				uploadDate: new Date().toISOString(),
				originalFilename: file.name,
				fileSize: file.size.toString(),
				contentType: file.type,
			} as Metadata;

			console.log("metadata", metadata);

			// First set the metadata
			await blockBlobClient.setMetadata(metadata);
			console.log("Metadata applied:", metadata);
			setSuccess("File uploaded successfully");

			// After successful upload, process the file
			// await processUploadedFile(file.name);
		} catch (err) {
			console.error("Upload error:", err);
			setError("Failed to upload file");
		} finally {
			setIsUploading(false);
		}
	}

	// async function processUploadedFile(fileName: string) {
	// 	try {
	// 		const response = await fetch(
	// 			`/api/energy/process-upload?filename=${fileName}`,
	// 			{
	// 				method: "POST",
	// 			},
	// 		);

	// 		if (response.ok) {
	// 			await fetchEnergyData();
	// 			const { message } = await response.json();
	// 			setSuccess(message);
	// 		} else {
	// 			const { message } = await response.json();
	// 			setError(message);
	// 		}
	// 	} catch (err) {
	// 		console.error("Processing error:", err);
	// 		setError("Failed to process uploaded file");
	// 	}
	// }

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

	// const handleCsvUrlSubmit = async () => {
	// 	console.log(uploadUrl);
	// 	setError(null);
	// 	setSuccess(null);
	// 	const response = await fetch(`/api/energy/upload?url=${uploadUrl}`, {
	// 		method: "POST",
	// 	});

	// 	if (response.ok) {
	// 		await fetchEnergyData();
	// 		setUploadUrl(null);
	// 		const { message } = await response.json();
	// 		setSuccess(message);
	// 	} else {
	// 		const { message } = await response.json();
	// 		setError(message);
	// 	}
	// };

	const handleCsvFileSubmit = async () => {
		console.log(selectedFile);
		setError(null);
		setSuccess(null);
		if (!selectedFile) {
			setError("Please select a file");
			return;
		}

		await uploadFileWithProgress(selectedFile);

		setSelectedFile(null);
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type !== "text/csv") {
				setError("Please upload a CSV file");
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleFileSubmit = async () => {
		if (!selectedFile) {
			setError("Please select a file");
			return;
		}
		setError(null);
		setSuccess(null);
		await uploadFileWithProgress(selectedFile);
		setSelectedFile(null);
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
		// setUploadUrl(null);
		setSelectedFile(null);
		setError(null);
		setSuccess(null);
		setUploadProgress(0);
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
							<label className="label" htmlFor="date-input">
								<span className="label-text">Date</span>
							</label>
							<Input
								id="date-input"
								type="text"
								value={entry?.date || ""}
								onChange={(e) =>
									setEntry({
										date: e.target.value,
										usage: entry?.usage || 0,
									})
								}
							/>
							<label className="label" htmlFor="date-input">
								<span className="label-text-alt">YYYY-MM-DD</span>
							</label>
						</div>
						<div className="form-control w-full max-w-xs">
							<label className="label" htmlFor="amount-input">
								<span className="label-text">Amount</span>
							</label>
							<Input
								id="amount-input"
								type="number"
								value={entry?.usage || ""}
								onChange={(e) =>
									setEntry({
										date: entry?.date || "",
										usage: Number(e.target.value),
									})
								}
							/>
							<label className="label" htmlFor="amount-input">
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
				<Modal.Header className="font-bold">Upload Energy Data</Modal.Header>
				<Modal.Body>
					{/* <div className="tabs tabs-boxed mb-4">
						<button
							className={`tab ${!selectedFile ? "tab-active" : ""}`}
							onClick={() => setSelectedFile(null)}
							type="button"
						>
							URL Upload
						</button>
						<button
							className={`tab ${selectedFile ? "tab-active" : ""}`}
							onClick={() => setUploadUrl(null)}
							type="button"
						>
							File Upload
						</button>
					</div> */}

					{/* {selectedFile ? (
						<div className="form-control w-full max-w-xs">
							<label className="label" htmlFor="url-input">
								<span className="label-text">URL</span>
							</label>
							<Input
								id="url-input"
								type="text"
								value={uploadUrl || ""}
								onChange={(e) => setUploadUrl(e.target.value)}
							/>
							<label className="label" htmlFor="url-input">
								<span className="label-text-alt">
									https://example.com/energy.csv
								</span>
							</label>
						</div>
					) : ( */}
					<div className="form-control w-full max-w-xs">
						<label className="label" htmlFor="file-input">
							<span className="label-text">CSV File</span>
						</label>
						<FileInput
							id="file-input"
							type="file"
							accept=".csv"
							onChange={handleFileUpload}
						/>
						<label className="label" htmlFor="file-input">
							<span className="label-text-alt">Select a CSV file</span>
						</label>
					</div>
					{/* )} */}

					{isUploading && (
						<div className="mt-4">
							<Progress value={uploadProgress} max="100" className="w-full" />
							<p className="text-center mt-2">Uploading: {uploadProgress}%</p>
						</div>
					)}

					{error && <div className="text-red-500 mt-4">{error}</div>}
					{success && <div className="text-green-500 mt-4">{success}</div>}
				</Modal.Body>
				<Modal.Actions>
					<form method="dialog">
						{!selectedFile ? (
							<Button
								onClick={(event) => {
									event.preventDefault();
									setIsLoading(true);
									// handleCsvUrlSubmit();
									handleCsvFileSubmit();
									setIsLoading(false);
								}}
							>
								Upload CSV
							</Button>
						) : (
							<Button
								onClick={(event) => {
									event.preventDefault();
									handleFileSubmit();
								}}
								disabled={!selectedFile || isUploading}
							>
								{isUploading ? "Uploading..." : "Upload File"}
							</Button>
						)}
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
