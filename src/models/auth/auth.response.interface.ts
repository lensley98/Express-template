import { User } from '@/models/user/user.interface.js';
import { ApiResponse } from '@/models/core/core.response.interface.js';

export interface AuthResponse extends ApiResponse {
  accessToken?: string;
  user?: Partial<User>;
}
