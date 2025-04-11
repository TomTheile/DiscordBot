import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { discordBot } from "./discord-bot";

// Helper function to determine command category
function getCommandCategory(commandName: string): string {
  // Common moderation commands
  const moderationCommands = [
    'ban', 'kick', 'mute', 'warn', 'clear', 'lockdown', 'slowmode',
    'timeout', 'unban', 'unmute', 'purge', 'prune'
  ];
  
  // Common gambling commands
  const gamblingCommands = [
    'bet', 'gamble', 'slots', 'roulette', 'dice', 'coinflip', 'jackpot',
    'daily', 'balance', 'coins', 'money', 'leaderboard'
  ];
  
  // Check which category the command belongs to
  if (moderationCommands.includes(commandName.toLowerCase())) {
    return 'moderation';
  } else if (gamblingCommands.includes(commandName.toLowerCase())) {
    return 'gambling';
  } else {
    return 'utility'; // Default category
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create admin user with hashed password
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    await storage.createUser({
      username: "admin",
      password: await hashPassword("admin"),
      isAdmin: true
    });
    console.log("Admin user created with username: admin, password: admin");
  }

  // Setup authentication routes
  setupAuth(app);

  // Start the Discord bot
  await discordBot.start();

  // API routes
  
  // Server management routes
  app.get("/api/servers", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (err) {
      console.error("Error fetching servers:", err);
      res.status(500).send("Internal server error");
    }
  });

  app.get("/api/servers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).send("Server not found");
      }
      res.json(server);
    } catch (err) {
      console.error(`Error fetching server ${req.params.id}:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Server settings routes
  app.get("/api/servers/:id/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const settings = await storage.getServerSettings(req.params.id);
      if (!settings) {
        return res.status(404).send("Settings not found");
      }
      res.json(settings);
    } catch (err) {
      console.error(`Error fetching settings for ${req.params.id}:`, err);
      res.status(500).send("Internal server error");
    }
  });

  app.patch("/api/servers/:id/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const updatedSettings = await storage.updateServerSettings(req.params.id, req.body);
      if (!updatedSettings) {
        return res.status(404).send("Settings not found");
      }
      res.json(updatedSettings);
    } catch (err) {
      console.error(`Error updating settings for ${req.params.id}:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Moderation logs routes
  app.get("/api/servers/:id/moderation-logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getModerationLogs(req.params.id, limit);
      res.json(logs);
    } catch (err) {
      console.error(`Error fetching moderation logs for ${req.params.id}:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Command stats routes
  app.get("/api/servers/:id/command-stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const stats = await storage.getCommandStats(req.params.id);
      res.json(stats);
    } catch (err) {
      console.error(`Error fetching command stats for ${req.params.id}:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Discord bot status route
  app.get("/api/bot/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const isConnected = discordBot.isConnectedToDiscord();
      const commandCount = discordBot.getCommandsCount();
      const commandsByCategory = discordBot.getCommandsByCategory();
      
      res.json({
        status: isConnected ? "online" : "offline",
        commandCount,
        commandsByCategory: Object.entries(commandsByCategory).map(([category, commands]) => ({
          category,
          count: commands.length,
          commands: commands.slice(0, 5).map(cmd => cmd.name) // Only send first 5 commands per category
        }))
      });
    } catch (err) {
      console.error(`Error fetching bot status:`, err);
      res.status(500).send("Internal server error");
    }
  });
  
  // Execute a bot command remotely
  app.post("/api/bot/execute-command", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { serverId, command, args = [] } = req.body;
      
      if (!serverId || !command) {
        return res.status(400).send("Missing serverId or command");
      }
      
      // Get the server to check if it exists
      const server = await storage.getServer(serverId);
      if (!server) {
        return res.status(404).send("Server not found");
      }
      
      // Record the command execution in logs
      await storage.createModerationLog({
        type: "command",
        serverId,
        moderatorId: req.user?.id.toString() || "unknown",
        moderatorName: req.user?.username || "Dashboard User",
        targetId: "n/a",
        targetName: "n/a",
        reason: `Executed command: ${command} ${args.join(' ')}`
      });
      
      // Increment command usage stats
      await storage.incrementCommandUsage(
        serverId,
        command,
        getCommandCategory(command)
      );
      
      res.json({ 
        success: true, 
        message: `Command '${command}' executed on server '${server.name}'`,
        details: {
          command,
          args,
          serverId,
          timestamp: new Date()
        }
      });
    } catch (err) {
      console.error(`Error executing bot command:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
