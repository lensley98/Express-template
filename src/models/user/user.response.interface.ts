import { User } from '@/models/user/user.interface.js';
import { ApiResponse } from '@/models/core/core.response.interface.js';

export interface UserResponse extends ApiResponse {
  users?: User[];
  user?: User;
}
