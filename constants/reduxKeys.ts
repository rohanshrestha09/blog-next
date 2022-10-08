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
  FOLLOWERS_MODAL = 'followers-modal',
  PWD_AUTH_MODAL = 'password-auth-modal',
}

export enum SORT_FILTER_KEYS {
  HOME_SORT = 'home-sort',
  AUTH_PROFILE_SORT = 'auth-profile-search',
  USER_PROFILE_SORT = 'user-profile-search',
  BOOKMARKS_SORT = 'bookmarks-sort',
}

export enum PROFILE_KEYS {
  ALL_BLOGS = 'allblogs',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

export enum PROFILE_SIDER_KEYS {
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
}

export enum SORT_TYPE {
  LIKES = 'likes',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}
