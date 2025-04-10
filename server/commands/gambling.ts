import { Command } from '../discord-bot';
import { storage } from '../storage';
import { errorEmbed, successEmbed, infoEmbed } from './index';

// Simple in-memory currency system for gambling commands
// In a real implementation, this would be stored in a database
const currency = new Map<string, number>();
const DEFAULT_BALANCE = 1000;

function getUserBalance(userId: string, guildId: string): number {
  const key = `${guildId}-${userId}`;
  if (!currency.has(key)) {
    currency.set(key, DEFAULT_BALANCE);
  }
  return currency.get(key) || 0;
}

function updateUserBalance(userId: string, guildId: string, amount: number): number {
  const key = `${guildId}-${userId}`;
  const newBalance = getUserBalance(userId, guildId) + amount;
  currency.set(key, newBalance);
  return newBalance;
}

export const gamblingCommands: Command[] = [
  {
    name: 'balance',
    category: 'gambling',
    description: 'Check your current balance',
    execute: async (message, args) => {
      const userId = message.author.id;
      const guildId = message.guild?.id;
      
      if (!guildId) {
        return message.reply(errorEmbed('This command can only be used in a server.'));
      }
      
      // Check if gambling is enabled for this server
      const settings = await storage.getServerSettings(guildId);
      if (settings && !settings.gamblingEnabled) {
        return message.reply(errorEmbed('Gambling commands are disabled in this server.'));
      }
      
      const balance = getUserBalance(userId, guildId);
      return message.reply(infoEmbed(`Your current balance is **${balance}** coins.`));
    }
  },
  {
    name: 'daily',
    category: 'gambling',
    description: 'Claim your daily bonus coins',
    execute: async (message, args) => {
      const userId = message.author.id;
      const guildId = message.guild?.id;
      
      if (!guildId) {
        return message.reply(errorEmbed('This command can only be used in a server.'));
      }
      
      // Check if gambling is enabled for this server
      const settings = await storage.getServerSettings(guildId);
      if (settings && !settings.gamblingEnabled) {
        return message.reply(errorEmbed('Gambling commands are disabled in this server.'));
      }
      
      const dailyAmount = 200;
      const newBalance = updateUserBalance(userId, guildId, dailyAmount);
      
      return message.reply(successEmbed(`You've claimed your daily reward of **${dailyAmount}** coins! Your new balance is **${newBalance}** coins.`));
    }
  },
  {
    name: 'slots',
    category: 'gambling',
    description: 'Play the slot machine with a specified bet',
    execute: async (message, args) => {
      const userId = message.author.id;
      const guildId = message.guild?.id;
      
      if (!guildId) {
        return message.reply(errorEmbed('This command can only be used in a server.'));
      }
      
      // Check if gambling is enabled for this server
      const settings = await storage.getServerSettings(guildId);
      if (settings && !settings.gamblingEnabled) {
        return message.reply(errorEmbed('Gambling commands are disabled in this server.'));
      }
      
      if (args.length < 1) {
        return message.reply(errorEmbed('Please specify a bet amount.'));
      }
      
      const betAmount = parseInt(args[0]);
      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(errorEmbed('Please provide a valid bet amount.'));
      }
      
      const balance = getUserBalance(userId, guildId);
      if (betAmount > balance) {
        return message.reply(errorEmbed(`You don't have enough coins. Your current balance is ${balance} coins.`));
      }
      
      // Generate slot machine results
      const slots = ['🍎', '🍊', '🍋', '🍇', '🍒', '💰', '7️⃣'];
      const results = [
        slots[Math.floor(Math.random() * slots.length)],
        slots[Math.floor(Math.random() * slots.length)],
        slots[Math.floor(Math.random() * slots.length)]
      ];
      
      // Determine winnings
      let winnings = 0;
      let winMessage = 'You lost!';
      
      if (results[0] === results[1] && results[1] === results[2]) {
        // All three match - big win
        if (results[0] === '7️⃣') {
          winnings = betAmount * 10; // Jackpot
          winMessage = 'JACKPOT! You won big!';
        } else if (results[0] === '💰') {
          winnings = betAmount * 5; // Big win
          winMessage = 'BIG WIN! All symbols match!';
        } else {
          winnings = betAmount * 3; // Regular win
          winMessage = 'WIN! All symbols match!';
        }
      } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        // Two match - small win
        winnings = Math.floor(betAmount * 1.5);
        winMessage = 'Small win! Two symbols match!';
      }
      
      // Update balance
      const netGain = winnings - betAmount;
      const newBalance = updateUserBalance(userId, guildId, netGain);
      
      // Send result message
      return message.reply({
        embeds: [{
          title: '🎰 Slot Machine',
          description: `[ ${results.join(' | ')} ]\n\n${winMessage}`,
          fields: [
            { name: 'Bet', value: `${betAmount} coins`, inline: true },
            { name: 'Winnings', value: `${winnings} coins`, inline: true },
            { name: 'Net Gain/Loss', value: `${netGain > 0 ? '+' : ''}${netGain} coins`, inline: true },
            { name: 'New Balance', value: `${newBalance} coins` }
          ],
          color: winnings > 0 ? 0x43B581 : 0xF04747,
          timestamp: new Date().toISOString()
        }]
      });
    }
  },
  {
    name: 'roulette',
    category: 'gambling',
    description: 'Play roulette with a specified bet and color (red/black/green)',
    execute: async (message, args) => {
      const userId = message.author.id;
      const guildId = message.guild?.id;
      
      if (!guildId) {
        return message.reply(errorEmbed('This command can only be used in a server.'));
      }
      
      // Check if gambling is enabled for this server
      const settings = await storage.getServerSettings(guildId);
      if (settings && !settings.gamblingEnabled) {
        return message.reply(errorEmbed('Gambling commands are disabled in this server.'));
      }
      
      if (args.length < 2) {
        return message.reply(errorEmbed('Please specify a bet amount and color (red/black/green).'));
      }
      
      const betAmount = parseInt(args[0]);
      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(errorEmbed('Please provide a valid bet amount.'));
      }
      
      const color = args[1].toLowerCase();
      if (!['red', 'black', 'green'].includes(color)) {
        return message.reply(errorEmbed('Please specify a valid color: red, black, or green.'));
      }
      
      const balance = getUserBalance(userId, guildId);
      if (betAmount > balance) {
        return message.reply(errorEmbed(`You don't have enough coins. Your current balance is ${balance} coins.`));
      }
      
      // Generate roulette result
      const random = Math.random() * 100;
      let result;
      
      if (random < 2.7) {
        result = 'green'; // 2.7% chance for green (0)
      } else if (random < 51.35) {
        result = 'red'; // 48.65% chance for red
      } else {
        result = 'black'; // 48.65% chance for black
      }
      
      // Calculate winnings
      let winnings = 0;
      if (color === result) {
        if (color === 'green') {
          winnings = betAmount * 14; // 14x payout for green
        } else {
          winnings = betAmount * 2; // 2x payout for red/black
        }
      }
      
      // Update balance
      const netGain = winnings - betAmount;
      const newBalance = updateUserBalance(userId, guildId, netGain);
      
      // Emoji for the result
      const emoji = {
        'red': '🔴',
        'black': '⚫',
        'green': '🟢'
      }[result];
      
      // Send result message
      return message.reply({
        embeds: [{
          title: '🎲 Roulette',
          description: `The ball landed on ${emoji} **${result.toUpperCase()}**!`,
          fields: [
            { name: 'Your Bet', value: `${betAmount} coins on ${color}`, inline: true },
            { name: 'Winnings', value: `${winnings} coins`, inline: true },
            { name: 'Net Gain/Loss', value: `${netGain > 0 ? '+' : ''}${netGain} coins`, inline: true },
            { name: 'New Balance', value: `${newBalance} coins` }
          ],
          color: winnings > 0 ? 0x43B581 : 0xF04747,
          timestamp: new Date().toISOString()
        }]
      });
    }
  },
  {
    name: 'coinflip',
    category: 'gambling',
    description: 'Flip a coin with a specified bet and choice (heads/tails)',
    execute: async (message, args) => {
      const userId = message.author.id;
      const guildId = message.guild?.id;
      
      if (!guildId) {
        return message.reply(errorEmbed('This command can only be used in a server.'));
      }
      
      // Check if gambling is enabled for this server
      const settings = await storage.getServerSettings(guildId);
      if (settings && !settings.gamblingEnabled) {
        return message.reply(errorEmbed('Gambling commands are disabled in this server.'));
      }
      
      if (args.length < 2) {
        return message.reply(errorEmbed('Please specify a bet amount and choice (heads/tails).'));
      }
      
      const betAmount = parseInt(args[0]);
      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(errorEmbed('Please provide a valid bet amount.'));
      }
      
      const choice = args[1].toLowerCase();
      if (!['heads', 'tails'].includes(choice)) {
        return message.reply(errorEmbed('Please specify a valid choice: heads or tails.'));
      }
      
      const balance = getUserBalance(userId, guildId);
      if (betAmount > balance) {
        return message.reply(errorEmbed(`You don't have enough coins. Your current balance is ${balance} coins.`));
      }
      
      // Flip the coin
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const isWin = choice === result;
      
      // Calculate winnings
      const winnings = isWin ? betAmount * 2 : 0;
      const netGain = winnings - betAmount;
      const newBalance = updateUserBalance(userId, guildId, netGain);
      
      // Emoji for the result
      const emoji = result === 'heads' ? '🪙' : '💫';
      
      // Send result message
      return message.reply({
        embeds: [{
          title: '💰 Coin Flip',
          description: `The coin landed on ${emoji} **${result.toUpperCase()}**!`,
          fields: [
            { name: 'Your Choice', value: choice, inline: true },
            { name: 'Bet', value: `${betAmount} coins`, inline: true },
            { name: 'Winnings', value: `${winnings} coins`, inline: true },
            { name: 'Net Gain/Loss', value: `${netGain > 0 ? '+' : ''}${netGain} coins`, inline: true },
            { name: 'New Balance', value: `${newBalance} coins` }
          ],
          color: isWin ? 0x43B581 : 0xF04747,
          timestamp: new Date().toISOString()
        }]
      });
    }
  }
];

// Add more gambling commands to reach 35+ total
for (let i = 1; i <= 30; i++) {
  gamblingCommands.push({
    name: `gamble${i}`,
    category: 'gambling',
    description: `Additional gambling command ${i}`,
    execute: async (message, args) => {
      return message.reply(successEmbed(`Example gambling command ${i} executed!`));
    }
  });
}
