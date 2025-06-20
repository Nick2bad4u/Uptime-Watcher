export interface Site {
  id: string;
  name?: string;
  url: string;
  status: "up" | "down" | "pending";
  responseTime?: number;
  lastChecked?: Date;
  history: StatusHistory[];
}

export interface StatusHistory {
  timestamp: number;
  status: "up" | "down";
  responseTime: number;
}

export interface StatusUpdate {
  site: Site;
  previousStatus?: "up" | "down" | "pending";
}
