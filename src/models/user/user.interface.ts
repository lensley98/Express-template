import { Payload } from '@/models/payload.interface.js';

export interface User extends Payload {
  email?: string;
  createdAt?: Date;
  isAdmin: boolean;
}
