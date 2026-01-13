// Client-side notification helper functions

export interface NotificationPayload {
  type: 'new_message' | 'interview_request';
  recipientId: string;
  senderId: string;
  data?: {
    content?: string;
    interviewType?: string;
    proposedDate?: string;
    message?: string;
  };
}

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Notifications] Failed to send notification');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error);
    return false;
  }
}

// Send new message notification
export async function notifyNewMessage(
  recipientUserId: string,
  senderUserId: string,
  messageContent: string
): Promise<void> {
  await sendNotification({
    type: 'new_message',
    recipientId: recipientUserId,
    senderId: senderUserId,
    data: {
      content: messageContent,
    },
  });
}

// Send interview request notification
export async function notifyInterviewRequest(
  recipientUserId: string,
  senderUserId: string,
  interviewType: string,
  proposedDate?: string,
  message?: string
): Promise<void> {
  await sendNotification({
    type: 'interview_request',
    recipientId: recipientUserId,
    senderId: senderUserId,
    data: {
      interviewType,
      proposedDate,
      message,
    },
  });
}
