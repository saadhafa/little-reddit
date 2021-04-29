import {Request,Response} from 'express'
import {Session} from "express-session";
import { Redis } from "ioredis";
export type MyContext = {
  req: Request & {session:Session};
  redis:Redis;
  res:Response;
}

export {};

declare module 'express-session' {
    interface SessionData {
        userId:number
    }
}