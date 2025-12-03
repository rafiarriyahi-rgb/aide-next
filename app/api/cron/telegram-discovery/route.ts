/**
 * Telegram Chat Discovery Cron Job
 * Runs every 1 minute to poll Telegram for new messages and register chat IDs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUpdates, sendWelcomeMessage } from '@/lib/telegram/telegram';
import {
  getLastUpdateId,
  setLastUpdateId,
  saveActiveChatId,
} from '@/lib/firebase/telegram-chats';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get last processed update ID
    const lastUpdateId = await getLastUpdateId();
    const offset = lastUpdateId > 0 ? lastUpdateId + 1 : undefined;

    // Poll Telegram for new updates
    const updates = await getUpdates(offset, 30);

    if (!updates) {
      return NextResponse.json({
        success: true,
        message: 'No updates available',
        newChats: 0,
      });
    }

    let newChatsCount = 0;
    let latestUpdateId = lastUpdateId;

    // Process each update
    for (const update of updates) {
      // Update the latest update ID
      if (update.update_id > latestUpdateId) {
        latestUpdateId = update.update_id;
      }

      // Skip if no message
      if (!update.message) {
        continue;
      }

      const message = update.message;
      const chat = message.chat;

      // Only process private chats (direct messages to bot)
      if (chat.type !== 'private') {
        continue;
      }

      const chatId = chat.id;
      const username = chat.username;
      const firstName = chat.first_name;

      try {
        // Save chat ID to Firebase
        await saveActiveChatId(chatId, username, firstName);

        // Send welcome message to new user
        await sendWelcomeMessage(chatId, firstName);

        newChatsCount++;
        console.log(`Registered new chat: ${chatId} (${username || firstName})`);
      } catch (error) {
        console.error(`Failed to register chat ${chatId}:`, error);
      }
    }

    // Save the latest update ID to Firebase
    if (latestUpdateId > lastUpdateId) {
      await setLastUpdateId(latestUpdateId);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${updates.length} updates`,
      newChats: newChatsCount,
      lastUpdateId: latestUpdateId,
    });
  } catch (error) {
    console.error('Error in telegram-discovery cron:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
