/**
 * SeaVitae Message Routes
 */

import { Router } from "express";
import * as messageController from "../controllers/messageController";
import { authenticate, requireEmailVerified } from "../middleware/auth";
import {
  sendMessageValidation,
  uuidParamValidation,
  paginationValidation,
} from "../middleware/validate";

const router = Router();

// All routes require authentication
router.use(authenticate, requireEmailVerified);

/**
 * @route   POST /messages
 * @desc    Send a message (employer to jobseeker only)
 * @access  Private (Employer)
 */
router.post("/", sendMessageValidation, messageController.sendMessage);

/**
 * @route   GET /messages
 * @desc    Get inbox (messages list)
 * @access  Private
 */
router.get("/", paginationValidation, messageController.getInbox);

/**
 * @route   GET /messages/unread/count
 * @desc    Get unread message count
 * @access  Private
 */
router.get("/unread/count", messageController.getUnreadCount);

/**
 * @route   GET /messages/conversation/:userId
 * @desc    Get conversation with specific user
 * @access  Private
 */
router.get("/conversation/:userId", uuidParamValidation, messageController.getConversation);

/**
 * @route   GET /messages/:id
 * @desc    Get single message
 * @access  Private
 */
router.get("/:id", uuidParamValidation, messageController.getMessage);

export default router;
