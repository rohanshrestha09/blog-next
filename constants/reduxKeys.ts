export enum NAV_KEYS {
  HOME_NAV = '/',
  PROFILE_NAV = '/profile',
  BOOKMARKS_NAV = '/blog/bookmarks',
  CREATE_NAV = '/blog/create',
  NOTIF_NAV = '/notifications',
  LOGOUT_NAV = 'logout',
}

export enum MODAL_KEYS {
  LOGIN_MODAL = 'login-modal',
  REGISTER_MODAL = 'register-modal',
  DELETE_MODAL = 'delete-modal',
  EDIT_PROFILE_MODAL = 'edit-profile-modal',
  AUTH_FOLLOWERS_MODAL = 'auth-followers-modal',
  USER_FOLLOWERS_MODAL = 'user-followers-modal',
  PWD_AUTH_MODAL = 'password-auth-modal',
  DISCUSSIONS_MODAL = 'discussions-modal',
  LIKERS_MODAL = 'likers-modal',
  USER_SUGGESTIONS_MODAL = 'user-suggestions-modal',
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
  LIKES = 'likes',
  CREATED_AT = 'createdAt',
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

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

export enum BOOKMARKS_KEY {
  BOOKMARKS = 'bookmarks',
}

export enum BLOG_KEYS {
  LIKES = 'likes',
  COMMENTS = 'comments',
}

const { HOME, USER_SUGGESTIONS } = HOME_KEYS;

const { AUTH_PROFILE } = PROFILE_KEYS;

const { BOOKMARKS } = BOOKMARKS_KEY;

export const getSortFilterKeys = {
  pageSize: { ...HOME_KEYS, ...PROFILE_KEYS, ...FOLLOWERS_KEYS, ...BLOG_KEYS, BOOKMARKS },
  search: {
    HOME,
    USER_SUGGESTIONS,
    AUTH_PROFILE,
    BOOKMARKS,
    ...FOLLOWERS_KEYS,
  },
  genre: { HOME, AUTH_PROFILE, BOOKMARKS },
  sort: { HOME, AUTH_PROFILE },
  sortOrder: { AUTH_PROFILE },
};

export type SORT_FILTER_KEYS =
  | HOME_KEYS
  | PROFILE_KEYS
  | FOLLOWERS_KEYS
  | BLOG_KEYS
  | BOOKMARKS_KEY;
