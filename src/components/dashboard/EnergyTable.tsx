import { Table } from "react-daisyui";
import type { EnergyEntry } from "../../Types";

interface EnergyTableProps {
	entries: EnergyEntry[];
	selectedYear: string;
	filteredEntries: EnergyEntry[];
}

export function EnergyTable({
	entries,
	selectedYear,
	filteredEntries,
}: EnergyTableProps) {
	return (
		<div>
			<div className="sticky top-0 z-10 bg-white border-b border-gray-200">
				<div className="flex justify-between items-center px-4 py-2 bg-gray-50">
					<div className="text-sm text-gray-600">
						Total Entries:{" "}
						<span className="font-semibold">{entries.length}</span>
					</div>
					{selectedYear !== "all" && (
						<div className="text-sm text-gray-600">
							Showing:{" "}
							<span className="font-semibold">{filteredEntries.length}</span>{" "}
							entries for {selectedYear}
						</div>
					)}
				</div>
			</div>
			<div className="h-[700px] overflow-y-auto">
				{filteredEntries.length === 0 && (
					<div className="text-center">No entries found. Create one!</div>
				)}
				{filteredEntries.length > 0 && (
					<Table pinRows zebra>
						<Table.Head>
							<span>Date</span>
							<span>Usage</span>
							<span>Created</span>
							<span>Input Type</span>
						</Table.Head>

						<Table.Body>
							{filteredEntries.map((entry) => (
								<Table.Row key={entry.id}>
									<span>{new Date(entry.entryDate).toLocaleDateString()}</span>
									<span>{entry.usage} kWh</span>
									<span>{new Date(entry.createdAt).toLocaleDateString()}</span>
									<span>{entry.createdType}</span>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				)}
			</div>
		</div>
	);
}
