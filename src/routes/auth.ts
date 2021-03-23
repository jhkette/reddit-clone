import { Request, Response, Router } from "express";
import { validate, isEmpty} from 'class-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

import  User  from "../entities/User";
import auth from '../middleware/auth'
import user from "../middleware/user"; 

// Map errors helper function
// return object with key - value of errors
const mapErrors = (errors: Object[]): Object => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1]
    return prev
  }, {})
}

// register function
const register = async (req: Request, res: Response) : Promise<Object> => {
  const { email, username, password } = req.body;
  try {
    // errors object
    let errors: any = {}
    const emailUser = await User.findOne({ email })
    const usernameUser = await User.findOne({ username })

    if (emailUser) errors.email = 'Email is already taken'
    if (usernameUser) errors.username = 'Username is already taken'
    
    // if there are objects.keys send errors object
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors)
    }
    // create new User
    const user = new User({ email, username, password });
    
    // validate user
    errors = await validate(user)
    // if errors send 400 error message
    if (errors.length > 0) {
      return res.status(400).json(mapErrors(errors))
    }
    await user.save();
    return res.json(user);
  } catch (err) {
      console.log(err)
      return res.status(500).json(err)
  }
};

const login = async (req: Request, res: Response): Promise<Object> => {
  const {username, password} = req.body;
  try {
    // initialise errors object
    let errors: any ={}
    if(isEmpty(username)) errors.username = "Username must not be empty"
    if(isEmpty(password)) errors.password = "Password must not be empty"
    // if errors send 400 status with errors
    if(Object.keys(errors).length > 0){
      return res.status(400).json(errors)
    }
    // find user
    const user = await User.findOne({username})
    // if no user send error
    if(!user) return res.status(404).json({error: "User not found"})
    const passwordMatches = await bcrypt.compare(password, user.password)
    if(!passwordMatches){
      return res.status(401).json({password: 'Password is incorrect'})
    }
    // token - sign token with secret
    const token = jwt.sign({username}, process.env.JWT_SECRET! )
    //  set cookie with token
    res.set('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      // change in production
      // secure: false,
      sameSite: 'strict',
      maxAge: 3600,
      path: "/"
    }))
    // return user
    return res.json(user)

  } catch(err){
      console.log(err)
      return res.json({error: 'something went wrong'})
  }
}

const me = (_: Request, res: Response): Object => {
    return res.json(res.locals.user)
}

// logout function
const logout = (_: Request, res: Response): void|Object => {
  // we remove cookie here by making it out of data
  res.set(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    })
  )
  // send success json object
  return res.status(200).json({ success: true })
}


const router = Router();

router.post("/register", register);
router.post("/login",  login);
router.get('/me', user, auth, me)
router.get('/logout', user, auth, logout)
export default router;
