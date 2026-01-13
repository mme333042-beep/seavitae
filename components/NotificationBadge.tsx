"use client";

interface NotificationBadgeProps {
  count: number;
  showZero?: boolean;
}

export default function NotificationBadge({ count, showZero = false }: NotificationBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      className="notification-badge"
      aria-label={`${count} new notification${count !== 1 ? "s" : ""}`}
    >
      {displayCount}
    </span>
  );
}
