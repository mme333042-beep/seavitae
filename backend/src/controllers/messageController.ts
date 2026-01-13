/**
 * SeaVitae Message Controller
 * Handles HTTP requests for messaging endpoints
 */

import { Response, NextFunction } from "express";
import * as messageService from "../services/messageService";
import { AuthenticatedRequest, ApiResponse, PaginationParams } from "../types";
import { config } from "../config";

/**
 * POST /messages
 * Send a message (employer to jobseeker only)
 */
export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { receiverId, content } = req.body;
    const message = await messageService.sendMessage(req.user.id, {
      receiverId,
      content,
    });

    const response: ApiResponse = {
      success: true,
      message: "Message sent successfully",
      data: { message },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /messages
 * Get inbox (messages list)
 */
export async function getInbox(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const pagination: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit
        ? Math.min(parseInt(req.query.limit as string, 10), config.pagination.maxLimit)
        : config.pagination.defaultLimit,
    };

    const result = await messageService.getInbox(
      req.user.id,
      req.user.role,
      pagination
    );

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /messages/conversation/:userId
 * Get conversation with specific user
 */
export async function getConversation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { userId } = req.params;

    const pagination: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit
        ? Math.min(parseInt(req.query.limit as string, 10), config.pagination.maxLimit)
        : config.pagination.defaultLimit,
    };

    const result = await messageService.getConversation(
      req.user.id,
      req.user.role,
      userId,
      pagination
    );

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /messages/:id
 * Get single message
 */
export async function getMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const message = await messageService.getMessage(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      data: { message },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /messages/unread/count
 * Get unread message count
 */
export async function getUnreadCount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const count = await messageService.getUnreadCount(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: { unreadCount: count },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
