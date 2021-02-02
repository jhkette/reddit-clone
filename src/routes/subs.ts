import { Request, Response, Router } from 'express'
import { isEmpty } from 'class-validator'
import { getRepository } from 'typeorm'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'

import User from '../entities/User'
import Sub from '../entities/Sub'
import auth from '../middleware/auth'
import user from "../middleware/user"; 
import Post from '../entities/Post'
import {makeId} from '../util/helpers'

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body

  const user: User = res.locals.user

  try {
    let errors: any = {}
    if (isEmpty(name)) errors.name = 'Name must not be empty'
    if (isEmpty(title)) errors.title = 'Title must not be empty'

    const sub = await getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne()

    if (sub) errors.name = 'Sub exists already'

    if (Object.keys(errors).length > 0) {
      throw errors
    }
  } catch (err) {
    return res.status(400).json(err)
  }

  try {
    const sub = new Sub({ name, description, title, user })
    await sub.save()

    return res.json(sub)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
} 

const getSub = async (req: Request, res: Response) => {

 

  const name = req.params.name
  try {
    const sub = await Sub.findOneOrFail({name})
    const posts = await Post.find({
      where: {sub},
      order: {createdAt: 'DESC'},
      relations: ['comments', 'votes']
    }) 
    sub.posts = posts

    if(res.locals.user){
      sub.posts.forEach(p => p.setUserVote(res.locals.user))
    }
    return res.json(sub)
    
  } catch (err) {
    console.log(err)
    return res.status(404).json({sub: 'Sub not found'})
    
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images',
    filename: (_, file, callback) => {
      const name = makeId(15)
      callback(null, name+ path.extname(file.originalname))
    }
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
      callback(null, true)
    }else{
      callback(new Error('Not an image'))
    }
  }

}) 


const uploadSubImage = async (_: Request, res: Response) => {
    return res.json({success: true})
}

const router = Router()

router.post('/:name/image', user, auth, upload.single('file'), uploadSubImage)
router.post('/', user, auth, createSub)
router.get('/:name', user, getSub)

export default router