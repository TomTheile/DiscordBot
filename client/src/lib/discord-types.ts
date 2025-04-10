export type BotStatusResponse = {
  status: "online" | "offline";
  commandCount: number;
  commandsByCategory: CommandCategory[];
};

export type CommandCategory = {
  category: string;
  count: number;
  commands: string[];
};

export type CommandUsageStats = {
  category: string;
  totalUsage: number;
  commands: {
    name: string;
    usageCount: number;
    lastUsed: string;
  }[];
};
