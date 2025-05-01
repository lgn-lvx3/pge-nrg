import { useState, useEffect, useMemo } from "react";
import type { EnergyEntry } from "../Types";
import { Button, Card, Select } from "react-daisyui";
import { Utils } from "@/Utils";
import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router";
import { BlobServiceClient, type Metadata } from "@azure/storage-blob";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

// Import components
import { EnergyCharts } from "@/components/dashboard/EnergyCharts";
import { EntryModal } from "@/components/dashboard/EntryModal";
import { FileUploadModal } from "@/components/dashboard/FileUploadModal";
import { EnergyTable } from "@/components/dashboard/EnergyTable";
import { EnergySummary } from "@/components/dashboard/EnergySummary";
import { AnalyzeUsageModal } from "@/components/dashboard/AnalyzeUsageModal";

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
	const [selectedYear, setSelectedYear] = useState<string>("all");
	const [filteredEntries, setFilteredEntries] = useState<EnergyEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
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

			if (!response.ok) {
				setError("Failed to upload. Please try again.");
				setIsUploading(false);
				return;
			}

			const { data } = await response.json();
			const containerName = import.meta.env.BLOB_CONTAINER_NAME || "";
			const blobServiceClient = new BlobServiceClient(data);
			const containerClient =
				blobServiceClient.getContainerClient(containerName);
			const blockBlobClient = containerClient.getBlockBlobClient(
				`${userInfo?.userId}-${file.name}`,
			);

			await blockBlobClient.uploadData(file, {
				onProgress: (ev) => {
					const percent = Math.round((ev.loadedBytes / file.size) * 100);
					setUploadProgress(percent);
				},
			});

			const metadata = {
				userId: userInfo?.userId || "unknown",
				uploadDate: new Date().toISOString(),
				originalFilename: file.name,
				fileSize: file.size.toString(),
				contentType: file.type,
			} as Metadata;

			await blockBlobClient.setMetadata(metadata);
			setSuccess("File uploaded successfully");
		} catch (err) {
			console.error("Upload error:", err);
			setError("Failed to upload file");
		} finally {
			setIsUploading(false);
		}
	}

	const fetchEnergyData = useMemo(
		() => async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/energy/history");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const result = await response.json();
				if (result.data) {
					setEnergyEntries(result.data);
					setFilteredEntries(result.data);
				} else {
					setError("No data received from server");
				}
			} catch (err) {
				console.error("Error fetching energy data:", err);
				setError("Failed to fetch energy data");
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchEnergyData();
	}, [fetchEnergyData]);

	const handleEntrySubmit = async (entry: InputEntry) => {
		setError(null);
		setSuccess(null);
		const response = await fetch("/api/energy/input", {
			method: "POST",
			body: JSON.stringify(entry),
		});

		if (response.ok) {
			await fetchEnergyData();
			const { message } = await response.json();
			setSuccess(message);
		} else {
			const { message } = await response.json();
			setError(message);
		}
	};

	const handleFileUpload = async (file: File) => {
		setError(null);
		setSuccess(null);
		await uploadFileWithProgress(file);
	};

	const averageMonthlyUsageByMonth = useMemo(() => {
		return Utils.calculateAverageMonthlyUsageByMonth(filteredEntries);
	}, [filteredEntries]);

	const availableYears = useMemo(() => {
		const years = new Set(
			energyEntries.map((entry) =>
				new Date(entry.entryDate).getFullYear().toString(),
			),
		);
		return Array.from(years).sort().reverse();
	}, [energyEntries]);

	useEffect(() => {
		if (selectedYear.toLowerCase() === "all") {
			setFilteredEntries([...energyEntries]);
		} else {
			const filtered = energyEntries.filter(
				(entry) =>
					new Date(entry.entryDate).getFullYear().toString() === selectedYear,
			);
			setFilteredEntries(filtered);
		}
	}, [selectedYear, energyEntries]);

	return (
		<div className="container mx-auto">
			<EntryModal
				isOpen={isEntryModalOpen}
				onClose={() => setIsEntryModalOpen(false)}
				onSubmit={handleEntrySubmit}
				isLoading={isLoading}
				error={error}
				success={success}
			/>

			<FileUploadModal
				isOpen={isUploadModalOpen}
				onClose={() => {
					setIsUploadModalOpen(false);
					fetchEnergyData();
				}}
				onUpload={handleFileUpload}
				uploadProgress={uploadProgress}
				isUploading={isUploading}
				error={error}
				success={success}
			/>

			<AnalyzeUsageModal
				isOpen={isAnalyzeModalOpen}
				onClose={() => setIsAnalyzeModalOpen(false)}
			/>

			<div className="flex-1 flex-row justify-between items-center">
				<div className="grid grid-cols-1 md:grid-cols-8 gap-3">
					<div className="col-span-1 md:col-span-6">
						<Card className="p-3 shadow-xl">
							<Card.Body>
								<Card.Title>
									<div className="flex flex-1 flex-col">
										<h1 className="flex text-4xl font-bold mb-5">
											Your Energy Usage
										</h1>
										<div className="flex flex-1 items-start justify-start">
											<Select
												value={selectedYear}
												onChange={(e) => setSelectedYear(e.target.value)}
												className="select-sm"
											>
												<option value="all">All Years</option>
												{availableYears.map((year) => (
													<option key={year} value={year}>
														{year}
													</option>
												))}
											</Select>
										</div>
									</div>
								</Card.Title>

								<EnergyCharts filteredEntries={filteredEntries} />

								<Card.Actions>
									<Button onClick={() => setIsEntryModalOpen(true)}>
										Add Entry
									</Button>
									<Button
										className="btn-link"
										onClick={() => setIsUploadModalOpen(true)}
									>
										Upload CSV
									</Button>
									<Button
										color="neutral"
										onClick={() => setIsAnalyzeModalOpen(true)}
										className="ml-auto"
									>
										✨ AI Usage Analysis ✨
									</Button>
									{isLoading && (
										<Button loading={true} color="ghost">
											Loading Entries
										</Button>
									)}
								</Card.Actions>

								<Card className="bg-white border border-gray-200 mt-4">
									<Card.Body>
										<EnergyTable
											entries={energyEntries}
											selectedYear={selectedYear}
											filteredEntries={filteredEntries}
										/>
									</Card.Body>
								</Card>
							</Card.Body>
						</Card>
					</div>

					<div className="col-span-1 md:col-span-2 mx-auto w-full max-w-2xl md:max-w-none">
						<Card className="shadow-xl">
							<Card.Body>
								<EnergySummary
									selectedYear={selectedYear}
									filteredEntries={filteredEntries}
									averageMonthlyUsageByMonth={averageMonthlyUsageByMonth}
								/>
							</Card.Body>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
