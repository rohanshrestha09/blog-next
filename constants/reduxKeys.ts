export enum NAV_KEYS {
  HOME = '/',
  PROFILE = '/profile',
  BOOKMARKS = '/blog/bookmarks',
  CREATE = '/blog/create',
  NOTIFICATIONS = '/notifications',
  LOGOUT = 'logout',
}

export enum MODAL_KEYS {
  LOGIN = 'login',
  REGISTER = 'register',
  DELETE = 'delete',
  EDIT_PROFILE = 'edit-profile',
  FOLLOWERS_MODAL = 'followers-modal',
  PASSWORD_VERIFICATION = 'password',
}

export enum PROFILE_KEYS {
  ALL_BLOGS = 'allblogs',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
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

export enum PROFILE_SIDER_KEYS {
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
}
