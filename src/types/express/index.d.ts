import { Payload } from '@/models/payload.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: Payload;
    }
  }
}
