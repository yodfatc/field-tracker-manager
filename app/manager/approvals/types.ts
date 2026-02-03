export interface ActivityForApproval {
  id: string;
  workerId: string;
  workerName: string;
  plotId: string;
  plotName: string;
  activityType: string; // e.g., "Harvest", "Spraying", "Irrigation"
  enterTime: string | null; // ISO string, null if missing
  exitTime: string | null; // ISO string, null if missing exit
  duration: number | null; // in minutes, null if missing exit
  status: 'NEW' | 'PENDING' | 'APPROVED';
  note?: string; // Optional short note
  hasMissingExit: boolean; // Warning flag (true when exitTime is null)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
