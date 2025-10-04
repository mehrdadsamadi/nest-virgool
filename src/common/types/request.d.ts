import { UserEntity } from '../../modules/user/entities/user.entity';

// declare module 'express-serve-static-core' {
//   export interface Request {
//     user?: UserEntity;
//   }
// }

declare global {
  namespace Express {
    interface User extends UserEntity {}
  }
}

export {};
