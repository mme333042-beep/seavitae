/**
 * SeaVitae Message Service
 * Handles messaging between employers and jobseekers
 * Note: Messages are employer → jobseeker only
 */

import { PrismaClient } from "@prisma/client";
import { SendMessageInput, PaginationParams, PaginatedResult, UserRole } from "../types";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errors";
import { sendNewMessageNotification } from "./emailService";

const prisma = new PrismaClient();

/**
 * Send a message from employer to jobseeker
 */
export async function sendMessage(senderUserId: string, input: SendMessageInput) {
  // Verify sender is an employer
  const sender = await prisma.user.findUnique({
    where: { id: senderUserId },
    include: { employerProfile: true },
  });

  if (!sender || sender.role !== "EMPLOYER") {
    throw new ForbiddenError("Only employers can send messages");
  }

  if (!sender.employerProfile) {
    throw new BadRequestError("Please complete your employer profile first");
  }

  // Verify receiver is a jobseeker
  const receiver = await prisma.user.findUnique({
    where: { id: input.receiverId },
    include: { jobseekerProfile: true },
  });

  if (!receiver || receiver.role !== "JOBSEEKER") {
    throw new NotFoundError("Recipient not found");
  }

  if (!receiver.jobseekerProfile) {
    throw new NotFoundError("Recipient profile not found");
  }

  // Check if jobseeker's profile is visible
  if (!receiver.jobseekerProfile.isVisible) {
    throw new ForbiddenError("Cannot message this user - their profile is not visible");
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      senderId: senderUserId,
      receiverId: input.receiverId,
      content: input.content,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          employerProfile: {
            select: {
              displayName: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });

  // Send email notification to jobseeker
  try {
    const senderName = sender.employerProfile.displayName;
    await sendNewMessageNotification(receiver.email, senderName);
  } catch (error) {
    // Log but don't fail if email notification fails
    console.error("Failed to send message notification email:", error);
  }

  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      displayName: message.sender.employerProfile?.displayName || "Unknown",
      isVerified: message.sender.employerProfile?.isVerified || false,
    },
  };
}

/**
 * Get messages for a user (inbox)
 */
export async function getInbox(
  userId: string,
  userRole: UserRole,
  pagination: PaginationParams
): Promise<PaginatedResult<unknown>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Jobseekers see received messages, employers see sent messages
  const where = userRole === "JOBSEEKER"
    ? { receiverId: userId }
    : { senderId: userId };

  const [total, messages] = await Promise.all([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            employerProfile: {
              select: {
                displayName: true,
                isVerified: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            jobseekerProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    isRead: msg.isRead,
    createdAt: msg.createdAt,
    sender: {
      id: msg.sender.id,
      displayName: msg.sender.employerProfile?.displayName || msg.sender.email,
      isVerified: msg.sender.employerProfile?.isVerified || false,
    },
    receiver: {
      id: msg.receiver.id,
      fullName: msg.receiver.jobseekerProfile?.fullName || msg.receiver.email,
    },
  }));

  return {
    data: formattedMessages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get conversation between employer and jobseeker
 */
export async function getConversation(
  userId: string,
  userRole: UserRole,
  otherUserId: string,
  pagination: PaginationParams
): Promise<PaginatedResult<unknown>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Verify access to conversation
  const [employerId, jobseekerId] = userRole === "EMPLOYER"
    ? [userId, otherUserId]
    : [otherUserId, userId];

  const where = {
    senderId: employerId,
    receiverId: jobseekerId,
  };

  const [total, messages] = await Promise.all([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Mark messages as read if user is the receiver
  if (userRole === "JOBSEEKER") {
    await prisma.message.updateMany({
      where: {
        senderId: employerId,
        receiverId: jobseekerId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  return {
    data: messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      isOwnMessage: msg.senderId === userId,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single message
 */
export async function getMessage(userId: string, messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: {
          id: true,
          employerProfile: {
            select: {
              displayName: true,
              isVerified: true,
            },
          },
        },
      },
      receiver: {
        select: {
          id: true,
          jobseekerProfile: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Verify user has access to this message
  if (message.senderId !== userId && message.receiverId !== userId) {
    throw new ForbiddenError("You don't have access to this message");
  }

  // Mark as read if receiver is viewing
  if (message.receiverId === userId && !message.isRead) {
    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  return {
    id: message.id,
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      displayName: message.sender.employerProfile?.displayName || "Unknown",
      isVerified: message.sender.employerProfile?.isVerified || false,
    },
    receiver: {
      id: message.receiver.id,
      fullName: message.receiver.jobseekerProfile?.fullName || "Unknown",
    },
  };
}

/**
 * Get unread message count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });
}
