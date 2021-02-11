import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import User  from '../entities/User'

// this middleware function checks for a cookie, decodes token using jwt verify
// then find a user. then assign res.locals.user = user
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get token from cookies
    const token = req.cookies.token
    // if no token next()
    if (!token) return next()
    // get username from jwt.verify
    const { username }: any = jwt.verify(token, process.env.JWT_SECRET!)
    // find user 
    const user = await User.findOne({ username })
    // assign locals to user
    res.locals.user = user
    // return next
    return next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Unauthenticated' })
  }
}