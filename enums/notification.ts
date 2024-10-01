export type NOTIFICATION_STATUS = 'READ' | 'UNREAD';

export type NOTIFICATION_TYPE =
  | 'FOLLOW_USER'
  | 'POST_BLOG'
  | 'LIKE_BLOG'
  | 'POST_COMMENT'
  | 'LIKE_COMMENT';

export enum NotificationType {
  FOLLOW_USER = 'FOLLOW_USER',
  POST_BLOG = 'POST_BLOG',
  LIKE_BLOG = 'LIKE_BLOG',
  POST_COMMENT = 'POST_COMMENT',
  LIKE_COMMENT = 'LIKE_COMMENT',
}

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}
