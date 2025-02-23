import { User } from '../models/User';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface AuthRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
  user?: User;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; 