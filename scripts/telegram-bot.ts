/**
 * Telegram Bot Script
 * Automatically sends "HI" message when run
 *
 * Run with: npm run telegram-bot
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env.local');
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface Update {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

/**
 * Send a message to a chat
 */
async function sendMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Error sending message:', data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return false;
  }
}

/**
 * Get the most recent chat ID
 */
async function getRecentChatId(): Promise<number | null> {
  try {
    const response = await fetch(`${TELEGRAM_API}/getUpdates?limit=1&offset=-1`);
    const data = await response.json();

    if (!data.ok || !data.result || data.result.length === 0) {
      return null;
    }

    const lastUpdate = data.result[0];
    if (lastUpdate.message) {
      return lastUpdate.message.chat.id;
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting chat ID:', error);
    return null;
  }
}

/**
 * Main function - Send HI message automatically
 */
async function sendHiMessage() {
  console.log('🤖 Telegram Bot - Auto Send HI');
  console.log('🔗 Bot: @aidenext_bot\n');

  // First, try to get the most recent chat ID
  console.log('🔍 Looking for recent chat...');
  const chatId = await getRecentChatId();

  if (chatId) {
    console.log(`✅ Found chat ID: ${chatId}`);
    console.log('📤 Sending HI message...\n');

    const sent = await sendMessage(chatId, 'HI');

    if (sent) {
      console.log('✅ Message sent successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📨 Sent: HI');
      console.log('📱 To: Chat ID ' + chatId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } else {
    console.log('⚠️  No recent chat found!');
    console.log('\n📝 To use this bot:');
    console.log('1. Open Telegram');
    console.log('2. Search for @aidenext_bot');
    console.log('3. Send any message to the bot');
    console.log('4. Run this script again\n');
  }

  process.exit(0);
}

// Run the function
sendHiMessage().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
