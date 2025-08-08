export const ACTIVITY_CONSTANTS = {
  NOTIFICATION_SCORE_THRESHOLD: 100,
  HIGH_IMPACT_ACTIVITY_WEIGHT: 8,
  REPLAY_SPEED_MULTIPLIER: 10,
  REPLAY_INTERVAL_MS: 100,
  MAX_ACTIVITIES_PER_QUERY: 1000,
  JWT_TOKEN_EXPIRY: '1d',
  REPLAY_DELAY_MS: 2000,
} as const;

export const ACTIVITY_TYPES = {
  VISIT: 'visit',
  CALL: 'call',
  INSPECTION: 'inspection',
  FOLLOW_UP: 'follow-up',
  NOTE: 'note',
} as const;

export const ACTIVITY_WEIGHTS = {
  [ACTIVITY_TYPES.VISIT]: 10,
  [ACTIVITY_TYPES.CALL]: 8,
  [ACTIVITY_TYPES.INSPECTION]: 6,
  [ACTIVITY_TYPES.FOLLOW_UP]: 4,
  [ACTIVITY_TYPES.NOTE]: 2,
} as const;

export const WEBSOCKET_EVENTS = {
  LIVE_ACTIVITY: 'live-activity',
  NOTIFICATION: 'notification',
  USER_STATUS_CHANGED: 'user-status-changed',
  REPLAY_START: 'replay-start',
  REPLAY_ACTIVITY: 'replay-activity',
  REPLAY_END: 'replay-end',
  ONLINE_USERS: 'online-users',
  PONG: 'pong',
  PING: 'ping',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const USER_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
} as const;
