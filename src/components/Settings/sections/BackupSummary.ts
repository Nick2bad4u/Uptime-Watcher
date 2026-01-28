/**
 * Pre-formatted metadata summary for the latest backup record.
 */
export interface BackupSummary {
    readonly formattedDate: string;
    readonly formattedSize: string;
    readonly retentionHintDays: number;
    readonly schemaVersion: number;
}
