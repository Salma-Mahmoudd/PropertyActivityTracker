export interface ActivityFilters {
  userId?: number;
  activityId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  afterTimestamp?: Date;
}

export interface ActivityWithWeight {
  id: number;
  weight: number;
  name: string;
}

export interface ReplayActivityData {
  id: number;
  userId: number;
  propertyId: number;
  activityId: number;
  note?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
  };
  property: {
    id: number;
    name?: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  activity: {
    id: number;
    name: string;
    weight: number;
    icon?: string;
    description?: string;
  };
}

export interface AuthenticatedSocket {
  userId?: number;
  userEmail?: string;
  id: string;
  disconnect: () => void;
  emit: (event: string, data: unknown) => void;
  handshake: {
    auth?: { token?: string };
    headers?: { authorization?: string };
  };
}

export interface JwtPayload {
  sub: string | number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface HandshakeData {
  auth?: { token?: string };
  headers?: { authorization?: string };
}

export interface UserStatusChangeData {
  userId: number;
  status: 'ONLINE' | 'OFFLINE';
  userEmail?: string;
  timestamp: Date;
}

export interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  data?: unknown;
  timestamp: Date;
  userId?: number;
}
