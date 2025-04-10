import { 
  users, 
  discordServers, 
  serverSettings, 
  moderationLogs, 
  commandStats,
  type User, 
  type InsertUser,
  type DiscordServer,
  type InsertDiscordServer,
  type ServerSettings,
  type InsertServerSettings,
  type ModerationLog,
  type InsertModerationLog,
  type CommandStat,
  type InsertCommandStat
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Discord server methods
  getServer(id: string): Promise<DiscordServer | undefined>;
  getServers(): Promise<DiscordServer[]>;
  createServer(server: InsertDiscordServer): Promise<DiscordServer>;
  updateServer(id: string, data: Partial<InsertDiscordServer>): Promise<DiscordServer | undefined>;
  deleteServer(id: string): Promise<void>;
  
  // Server settings methods
  getServerSettings(serverId: string): Promise<ServerSettings | undefined>;
  createServerSettings(settings: InsertServerSettings): Promise<ServerSettings>;
  updateServerSettings(serverId: string, settings: Partial<InsertServerSettings>): Promise<ServerSettings | undefined>;
  
  // Moderation logs methods
  getModerationLogs(serverId: string, limit?: number): Promise<ModerationLog[]>;
  createModerationLog(log: InsertModerationLog): Promise<ModerationLog>;
  
  // Command stats methods
  getCommandStats(serverId: string): Promise<CommandStat[]>;
  incrementCommandUsage(serverId: string, command: string, category: string): Promise<CommandStat>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<string, DiscordServer>;
  private settings: Map<string, ServerSettings>;
  private logs: ModerationLog[];
  private stats: Map<string, CommandStat>; // key is `${serverId}-${command}`
  private currentUserId: number;
  private currentSettingsId: number;
  private currentLogId: number;
  private currentStatId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.settings = new Map();
    this.logs = [];
    this.stats = new Map();
    this.currentUserId = 1;
    this.currentSettingsId = 1;
    this.currentLogId = 1;
    this.currentStatId = 1;
    
    // Create default admin account
    this.createUser({
      username: "admin",
      password: "admin", // This will be hashed in auth.ts
      isAdmin: true
    });
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Discord server methods
  async getServer(id: string): Promise<DiscordServer | undefined> {
    return this.servers.get(id);
  }

  async getServers(): Promise<DiscordServer[]> {
    return Array.from(this.servers.values());
  }

  async createServer(server: InsertDiscordServer): Promise<DiscordServer> {
    const timestamp = new Date();
    const newServer: DiscordServer = { 
      ...server, 
      addedAt: timestamp 
    };
    this.servers.set(server.id, newServer);
    return newServer;
  }

  async updateServer(id: string, data: Partial<InsertDiscordServer>): Promise<DiscordServer | undefined> {
    const server = await this.getServer(id);
    if (!server) return undefined;
    
    const updatedServer: DiscordServer = {
      ...server,
      ...data,
    };
    this.servers.set(id, updatedServer);
    return updatedServer;
  }

  async deleteServer(id: string): Promise<void> {
    this.servers.delete(id);
  }

  // Server settings methods
  async getServerSettings(serverId: string): Promise<ServerSettings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.serverId === serverId,
    );
  }

  async createServerSettings(settings: InsertServerSettings): Promise<ServerSettings> {
    const id = this.currentSettingsId++;
    const newSettings: ServerSettings = { ...settings, id };
    this.settings.set(id.toString(), newSettings);
    return newSettings;
  }

  async updateServerSettings(serverId: string, settingsUpdate: Partial<InsertServerSettings>): Promise<ServerSettings | undefined> {
    const currentSettings = await this.getServerSettings(serverId);
    if (!currentSettings) return undefined;
    
    const updatedSettings: ServerSettings = {
      ...currentSettings,
      ...settingsUpdate,
    };
    this.settings.set(currentSettings.id.toString(), updatedSettings);
    return updatedSettings;
  }

  // Moderation logs methods
  async getModerationLogs(serverId: string, limit: number = 50): Promise<ModerationLog[]> {
    return this.logs
      .filter(log => log.serverId === serverId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createModerationLog(log: InsertModerationLog): Promise<ModerationLog> {
    const id = this.currentLogId++;
    const timestamp = new Date();
    const newLog: ModerationLog = { ...log, id, timestamp };
    this.logs.push(newLog);
    return newLog;
  }

  // Command stats methods
  async getCommandStats(serverId: string): Promise<CommandStat[]> {
    return Array.from(this.stats.values())
      .filter(stat => stat.serverId === serverId);
  }

  async incrementCommandUsage(serverId: string, command: string, category: string): Promise<CommandStat> {
    const key = `${serverId}-${command}`;
    const existingStat = this.stats.get(key);
    
    if (existingStat) {
      const updatedStat: CommandStat = {
        ...existingStat,
        usageCount: existingStat.usageCount + 1,
        lastUsed: new Date(),
      };
      this.stats.set(key, updatedStat);
      return updatedStat;
    } else {
      const id = this.currentStatId++;
      const newStat: CommandStat = {
        id,
        serverId,
        command,
        category,
        usageCount: 1,
        lastUsed: new Date(),
      };
      this.stats.set(key, newStat);
      return newStat;
    }
  }
}

export const storage = new MemStorage();
