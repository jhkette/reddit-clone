

import { Request, Response, Router } from "express";
import { validate, isEmpty} from 'class-validator'
import auth from '../middleware/auth'
import Post from "../entities/Post";

const createPost =  async (req: Request, res: Response) => {
   const {title, body, sub} = req.body;
   const user = res.locals.user

   if(title.trim() === ''){
       return res.status(400).json({title: 'Title must not be empty'})
       
   }
   try {
    const post = new Post({title, body, user, subName: sub })
    await post.save()
    return res.json(post)
   } catch (err) {
       console.log(err)
       return res.status(500).json({error: "error with db"})
   }

}


const router = Router();
router.post('/', auth, createPost)
export default router