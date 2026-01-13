import { getSupabaseClient } from '../client'
import type { Message, MessageInsert, User } from '../types'

// Send a message
export async function sendMessage(
  recipientId: string,
  content: string,
  subject?: string,
  parentMessageId?: string
): Promise<{ success: boolean; message?: Message; error?: string }> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // SECURITY: Check if sender is an employer and verify they're verified
  // Employers must be verified to send initial messages to jobseekers
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role === 'employer') {
    const { data: employer } = await supabase
      .from('employers')
      .select('is_verified')
      .eq('user_id', user.id)
      .single()

    if (!employer?.is_verified) {
      return { success: false, error: 'Your account must be verified to send messages' }
    }
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content,
      subject,
      parent_message_id: parentMessageId,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message }
}

// Get inbox messages
export async function getInbox(
  page: number = 1,
  pageSize: number = 20
): Promise<{
  messages: (Message & { sender?: User })[]
  total: number
  unread: number
}> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { messages: [], total: 0, unread: 0 }
  }

  // Get messages with count
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: messages, count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to get inbox:', error)
    return { messages: [], total: 0, unread: 0 }
  }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  // Get sender details
  const senderIds = [...new Set((messages || []).map((m) => m.sender_id))]

  let senders: User[] = []
  if (senderIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .in('id', senderIds)

    senders = data || []
  }

  const messagesWithSenders = (messages || []).map((message) => ({
    ...message,
    sender: senders.find((s) => s.id === message.sender_id),
  }))

  return {
    messages: messagesWithSenders,
    total: count || 0,
    unread: unreadCount || 0,
  }
}

// Get sent messages
export async function getSentMessages(
  page: number = 1,
  pageSize: number = 20
): Promise<{
  messages: (Message & { recipient?: User })[]
  total: number
}> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { messages: [], total: 0 }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: messages, count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to get sent messages:', error)
    return { messages: [], total: 0 }
  }

  // Get recipient details
  const recipientIds = [...new Set((messages || []).map((m) => m.recipient_id))]

  let recipients: User[] = []
  if (recipientIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .in('id', recipientIds)

    recipients = data || []
  }

  const messagesWithRecipients = (messages || []).map((message) => ({
    ...message,
    recipient: recipients.find((r) => r.id === message.recipient_id),
  }))

  return {
    messages: messagesWithRecipients,
    total: count || 0,
  }
}

// Get message thread (a message and its replies)
export async function getMessageThread(
  messageId: string
): Promise<Message[]> {
  const supabase = getSupabaseClient()

  // Get the root message (either this message or its parent)
  const { data: message, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (error || !message) {
    return []
  }

  const rootId = message.parent_message_id || message.id

  // Get all messages in the thread
  const { data: thread } = await supabase
    .from('messages')
    .select('*')
    .or(`id.eq.${rootId},parent_message_id.eq.${rootId}`)
    .order('created_at', { ascending: true })

  return thread || []
}

// Mark message as read
export async function markAsRead(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', messageId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Mark all messages as read
export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Delete a message (only sender can delete)
export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get unread message count
export async function getUnreadCount(): Promise<number> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to get unread count:', error)
    return 0
  }

  return count || 0
}

// Get conversation between two users
export async function getConversation(
  otherUserId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{
  messages: Message[]
  total: number
}> {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { messages: [], total: 0 }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Get messages between the two users
  const { data: messages, count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to get conversation:', error)
    return { messages: [], total: 0 }
  }

  return {
    messages: messages || [],
    total: count || 0,
  }
}
