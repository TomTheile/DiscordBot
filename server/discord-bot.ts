import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { storage } from './storage';
import { moderationCommands } from './commands/moderation';
import { gamblingCommands } from './commands/gambling';
import { utilityCommands } from './commands/utility';

export type Command = {
  name: string;
  category: string;
  description: string;
  execute: (message: any, args: string[]) => Promise<void>;
};

export class DiscordBot {
  private client: Client;
  private commands: Collection<string, Command>;
  private prefixes: Map<string, string>;
  private token: string;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
      ],
    });

    this.commands = new Collection();
    this.prefixes = new Map();
    this.token = process.env.DISCORD_TOKEN || '';

    // Register all commands
    this.registerCommands();

    // Set up event handlers
    this.setupEventHandlers();
  }

  private registerCommands() {
    // Register all commands from different categories
    const allCommands = [
      ...moderationCommands,
      ...gamblingCommands,
      ...utilityCommands,
    ];

    for (const command of allCommands) {
      this.commands.set(command.name, command);
    }
  }

  private setupEventHandlers() {
    this.client.once(Events.ClientReady, async c => {
      console.log(`Discord bot ready! Logged in as ${c.user.tag}`);
      this.isConnected = true;
      
      // Save guilds to storage
      this.client.guilds.cache.forEach(async (guild) => {
        try {
          const existingServer = await storage.getServer(guild.id);
          
          if (!existingServer) {
            await storage.createServer({
              id: guild.id,
              name: guild.name,
              iconUrl: guild.iconURL() || undefined,
              memberCount: guild.memberCount,
              prefix: '!'
            });
            
            // Create default settings for the server
            await storage.createServerSettings({
              serverId: guild.id,
              autoModEnabled: false,
              antiSpam: false,
              linkFilter: false,
              profanityFilter: false,
              autoWarn: false,
              banCommandCooldown: 10,
              banMessageTemplate: 'You have been banned from {server} for {reason}. If you believe this is a mistake, please contact the server administrators.',
              gamblingEnabled: true
            });
          } else {
            // Update member count and other details
            await storage.updateServer(guild.id, {
              name: guild.name,
              iconUrl: guild.iconURL() || undefined,
              memberCount: guild.memberCount
            });
          }
        } catch (err) {
          console.error(`Error processing guild ${guild.id}:`, err);
        }
      });
    });

    this.client.on(Events.MessageCreate, async message => {
      // Ignore bot messages
      if (message.author.bot) return;
      
      const guildId = message.guild?.id;
      if (!guildId) return; // Not in a guild
      
      try {
        // Get server's prefix
        let prefix = this.prefixes.get(guildId) || '!';
        
        // Get from storage if not cached
        if (!this.prefixes.has(guildId)) {
          const server = await storage.getServer(guildId);
          if (server) {
            prefix = server.prefix;
            this.prefixes.set(guildId, prefix);
          }
        }
        
        // Check if message starts with prefix
        if (!message.content.startsWith(prefix)) return;
        
        // Parse command and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        
        if (!commandName) return;
        
        const command = this.commands.get(commandName);
        if (!command) return;
        
        // Execute the command
        await command.execute(message, args);
        
        // Log command usage
        await storage.incrementCommandUsage(
          guildId,
          commandName,
          command.category
        );
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Add guild join and leave handlers
    this.client.on(Events.GuildCreate, async guild => {
      try {
        await storage.createServer({
          id: guild.id,
          name: guild.name,
          iconUrl: guild.iconURL() || undefined,
          memberCount: guild.memberCount,
          prefix: '!'
        });
        
        // Create default settings for the server
        await storage.createServerSettings({
          serverId: guild.id,
          autoModEnabled: false,
          antiSpam: false,
          linkFilter: false,
          profanityFilter: false,
          autoWarn: false,
          banCommandCooldown: 10,
          banMessageTemplate: 'You have been banned from {server} for {reason}. If you believe this is a mistake, please contact the server administrators.',
          gamblingEnabled: true
        });
      } catch (err) {
        console.error(`Error adding new guild ${guild.id}:`, err);
      }
    });

    this.client.on(Events.GuildDelete, async guild => {
      try {
        await storage.deleteServer(guild.id);
      } catch (err) {
        console.error(`Error removing guild ${guild.id}:`, err);
      }
    });
  }

  public async start() {
    if (!this.token) {
      console.warn('No Discord token provided. Bot will not be started.');
      return;
    }
    
    try {
      await this.client.login(this.token);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  }

  public isConnectedToDiscord(): boolean {
    return this.isConnected;
  }

  public getClient(): Client {
    return this.client;
  }

  public getCommandsCount(): number {
    return this.commands.size;
  }

  public getCommandsByCategory(): Record<string, Command[]> {
    const result: Record<string, Command[]> = {};
    
    this.commands.forEach(command => {
      if (!result[command.category]) {
        result[command.category] = [];
      }
      result[command.category].push(command);
    });
    
    return result;
  }

  public getCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}

// Create a singleton instance
export const discordBot = new DiscordBot();
