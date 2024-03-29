export enum NAV_KEYS {
  HOME_NAV = '/',
  PROFILE_NAV = '/profile',
  BOOKMARKS_NAV = '/blog/bookmark',
  CREATE_NAV = '/blog/create',
  NOTIF_NAV = '/notification',
  LOGOUT_NAV = 'logout',
}

export enum MODAL_KEYS {
  LOGIN_MODAL = 'login-modal',
  REGISTER_MODAL = 'register-modal',
  DELETE_MODAL = 'delete-modal',
  EDIT_PROFILE_MODAL = 'edit-profile-modal',
  AUTH_FOLLOWERS_MODAL = 'auth-followers-modal',
  USER_FOLLOWERS_MODAL = 'user-followers-modal',
  PASSWORD_AUTH_MODAL = 'password-auth-modal',
  DISCUSSIONS_MODAL = 'discussions-modal',
  LIKERS_MODAL = 'likers-modal',
  USER_SUGGESTIONS_MODAL = 'user-suggestions-modal',
  CHANGE_PASSWORD_MODAL = 'change-password-modal',
  DELETE_ACCOUNT_MODAL = 'delete-account-modal',
  COMPLETE_PROFILE_MODAL = 'complete-profile-modal',
}

export enum AUTH_PROFILE_KEYS {
  ALL_BLOGS = 'allblogs',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

export enum FOLLOWERS_KEYS {
  AUTH_FOLLOWERS = 'auth-followers',
  AUTH_FOLLOWING = 'auth-following',
  USER_FOLLOWERS = 'user-followers',
  USER_FOLLOWING = 'user-following',
}

export enum SORT_TYPE {
  LIKE_COUNT = 'likedBy',
  CREATED_AT = 'createdAt',
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export const NOTIFICATIONS_TYPE = Object.freeze({
  FOLLOW_USER: 'FOLLOW_USER',
  LIKE_BLOG: 'LIKE_BLOG',
  LIKE_COMMENT: 'LIKE_COMMENT',
  POST_COMMENT: 'POST_COMMENT',
  POST_BLOG: 'POST_BLOG',
});

export const NOTIFICATIONS_STATUS = Object.freeze({
  READ: 'READ',
  UNREAD: 'UNREAD',
});

export enum PROFILE_KEYS {
  AUTH_PROFILE = 'auth-profile',
  USER_PROFILE = 'user-profile',
}

export enum HOME_KEYS {
  HOME = 'home',
  FOLLOWING = 'following',
  USER_SUGGESTIONS = 'user-suggestions',
  GENERIC_BLOGS = 'generic-blogs',
}

export enum BOOKMARKS_KEYS {
  BOOKMARKS = 'bookmarks',
}

export enum NOTIFICATIONS_KEYS {
  NOTIFICATIONS = 'notifications',
}

export enum BLOG_KEYS {
  LIKES = 'likes',
  COMMENTS = 'comments',
}

const { HOME, USER_SUGGESTIONS } = HOME_KEYS;

const { AUTH_PROFILE } = PROFILE_KEYS;

export const getSortFilterKeys = {
  size: {
    ...HOME_KEYS,
    ...PROFILE_KEYS,
    ...FOLLOWERS_KEYS,
    ...BLOG_KEYS,
    ...BOOKMARKS_KEYS,
    ...NOTIFICATIONS_KEYS,
  },
  search: {
    HOME,
    USER_SUGGESTIONS,
    AUTH_PROFILE,
    ...BOOKMARKS_KEYS,
    ...FOLLOWERS_KEYS,
  },
  genre: { HOME, AUTH_PROFILE, ...BOOKMARKS_KEYS },
  sort: { HOME, AUTH_PROFILE },
  order: { AUTH_PROFILE },
};

export type SORT_FILTER_KEYS =
  | HOME_KEYS
  | PROFILE_KEYS
  | FOLLOWERS_KEYS
  | BLOG_KEYS
  | BOOKMARKS_KEYS
  | NOTIFICATIONS_KEYS;
