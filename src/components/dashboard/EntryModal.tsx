import { useState } from "react";
import { Button, Input, Modal } from "react-daisyui";

interface InputEntry {
	date: string;
	usage: number;
}

interface EntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (entry: InputEntry) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: string | null;
}

export function EntryModal({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	error,
	success,
}: EntryModalProps) {
	const [entry, setEntry] = useState<InputEntry | null>(null);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (entry) {
			await onSubmit(entry);
			setEntry(null);
		}
	};

	const handleClose = () => {
		setEntry(null);
		onClose();
	};

	return (
		<Modal open={isOpen} onClose={handleClose} backdrop>
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
					<Button loading={isLoading} onClick={handleSubmit}>
						Submit
					</Button>
				</form>
			</Modal.Actions>
		</Modal>
	);
}
