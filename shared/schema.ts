import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for dashboard authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Discord servers the bot is in
export const discordServers = pgTable("discord_servers", {
  id: text("id").primaryKey(), // Discord server ID
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  memberCount: integer("member_count").default(0),
  prefix: text("prefix").default("!").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertDiscordServerSchema = createInsertSchema(discordServers).omit({
  addedAt: true,
});

// Bot settings for each server
export const serverSettings = pgTable("server_settings", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => discordServers.id),
  modRoleId: text("mod_role_id"),
  adminRoleId: text("admin_role_id"),
  autoModEnabled: boolean("auto_mod_enabled").default(false),
  antiSpam: boolean("anti_spam").default(false),
  linkFilter: boolean("link_filter").default(false),
  profanityFilter: boolean("profanity_filter").default(false),
  autoWarn: boolean("auto_warn").default(false),
  banMessageTemplate: text("ban_message_template"),
  banCommandCooldown: integer("ban_command_cooldown").default(10),
  welcomeMessage: text("welcome_message"),
  gamblingEnabled: boolean("gambling_enabled").default(true),
});

export const insertServerSettingsSchema = createInsertSchema(serverSettings).omit({
  id: true,
});

// Moderation actions logs
export const moderationLogs = pgTable("moderation_logs", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => discordServers.id),
  type: text("type").notNull(), // ban, kick, mute, warn
  moderatorId: text("moderator_id").notNull(), // Discord user ID
  moderatorName: text("moderator_name").notNull(),
  targetId: text("target_id").notNull(), // Discord user ID
  targetName: text("target_name").notNull(),
  reason: text("reason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertModerationLogSchema = createInsertSchema(moderationLogs).omit({
  id: true,
  timestamp: true,
});

// Command usage statistics
export const commandStats = pgTable("command_stats", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => discordServers.id),
  command: text("command").notNull(),
  category: text("category").notNull(), // moderation, gambling, utility, etc.
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
});

export const insertCommandStatSchema = createInsertSchema(commandStats).omit({
  id: true,
  usageCount: true,
  lastUsed: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DiscordServer = typeof discordServers.$inferSelect;
export type InsertDiscordServer = z.infer<typeof insertDiscordServerSchema>;

export type ServerSettings = typeof serverSettings.$inferSelect;
export type InsertServerSettings = z.infer<typeof insertServerSettingsSchema>;

export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = z.infer<typeof insertModerationLogSchema>;

export type CommandStat = typeof commandStats.$inferSelect;
export type InsertCommandStat = z.infer<typeof insertCommandStatSchema>;
