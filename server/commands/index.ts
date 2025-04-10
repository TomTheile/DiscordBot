import { Command } from '../discord-bot';

// This file can be used to export combined commands or shared utilities for commands

export * from './moderation';
export * from './gambling';
export * from './utility';

// Helper functions for command implementations
export function formatEmbed(title: string, description: string, color: number = 0x5865F2) {
  return {
    embeds: [{
      title,
      description,
      color,
      timestamp: new Date().toISOString()
    }]
  };
}

export function errorEmbed(message: string) {
  return formatEmbed('Error', message, 0xF04747);
}

export function successEmbed(message: string) {
  return formatEmbed('Success', message, 0x43B581);
}

export function infoEmbed(message: string) {
  return formatEmbed('Info', message, 0x5865F2);
}

export function formatHelp(command: Command) {
  return `**${command.name}** - ${command.description}`;
}
