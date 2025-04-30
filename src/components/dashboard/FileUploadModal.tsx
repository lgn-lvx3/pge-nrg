import { useState } from "react";
import { Button, FileInput, Modal, Progress } from "react-daisyui";

interface FileUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUpload: (file: File) => Promise<void>;
	uploadProgress: number;
	isUploading: boolean;
	error: string | null;
	success: string | null;
}

export function FileUploadModal({
	isOpen,
	onClose,
	onUpload,
	uploadProgress,
	isUploading,
	error,
	success,
}: FileUploadModalProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type !== "text/csv") {
				// Handle error through parent component
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (selectedFile) {
			await onUpload(selectedFile);
			setSelectedFile(null);
		}
	};

	return (
		<Modal open={isOpen} onClose={onClose}>
			<Modal.Header className="font-bold">Upload Energy Data</Modal.Header>
			<Modal.Body>
				<div className="form-control w-full max-w-xs">
					<label className="label" htmlFor="file-input">
						<span className="label-text">CSV File</span>
					</label>
					<FileInput
						id="file-input"
						type="file"
						accept=".csv"
						onChange={handleFileChange}
					/>
					<label className="label" htmlFor="file-input">
						<span className="label-text-alt">Select a CSV file</span>
					</label>
				</div>

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
					<Button
						onClick={handleSubmit}
						disabled={!selectedFile || isUploading}
					>
						{isUploading ? "Uploading..." : "Upload File"}
					</Button>
				</form>
			</Modal.Actions>
		</Modal>
	);
}
