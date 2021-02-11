import { NextFunction, Request, Response } from 'express'
import User  from '../entities/User'

// middleware function that just checks if res.locals.user is assigned to a user
export default async (_: Request, res: Response, next: NextFunction) => {
  try {
   const user: User | undefined = res.locals.user
    if(!user) throw new Error('Unauthenticated')
    return next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Unauthenticated' })
  }
}