import { NextFunction, Request, Response, Router } from 'express'
import { isEmpty } from 'class-validator'
import { getRepository } from 'typeorm'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'

import User from '../entities/User'
import Sub from '../entities/Sub'
import auth from '../middleware/auth'
import user from "../middleware/user"; 
import Post from '../entities/Post'
import {makeId} from '../util/helpers'

const createSub = async (req: Request, res: Response):Promise<Object> => {
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

const getSub = async (req: Request, res: Response): Promise<Object> => {
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
const ownSub = async (req: Request, res: Response, next: NextFunction): Promise<void|Object> => {
  const user: User = res.locals.user

  try {
    const sub = await Sub.findOneOrFail({where: {name: req.params.name}})
    if(sub.username !== user.username){
      return res.status(403).json({error: 'You dont own this'})
    }
    res.locals.sub = sub
    return next()
    
  } catch (err) {
    console.log(err)
    return res.status(500).json({error: 'Something went wrong'})
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
  fileFilter: (_, file, callback: FileFilterCallback) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
      callback(null, true)
    }else{
      callback(new Error('Not an image'))
    }
  }

}) 

const searchSubs = async (req: Request, res: Response) :Promise<Object> => {
   try {
     const name = req.params.name
     if(isEmpty(name)){
       return res.status(400).json({error: 'Name must not be empty'})
     }
     
     const subs = await getRepository(Sub)
      .createQueryBuilder() 
      // `${name.toLowerCase().trim()}% 
      // with the percentage at the  end it will find rea => react 
      // but will not find ea => react - this make more sense for our search
      // without % search would fail most of the time - as search would need to be exact 
      .where('LOWER(name) LIKE :name', {name: `${name.toLowerCase().trim()}%`})
      .getMany()
      return res.json(subs)
   } catch (err) {
     console.log(err)
     return res.status(500).json({error: 'Something went wrong'})
   }
}


const uploadSubImage = async (req: Request, res: Response) : Promise<Object> => {
  const sub: Sub = res.locals.sub
  try {
    const type = req.body.type
    console.log(req.file)

    if (type !== 'image' && type !== 'banner') {
      // delete file
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Invalid type' })
    }
    // declare imageURN
    let oldImageUrn: string = ''
    // if type == 
    if (type === 'image') {
      // if sub.imageUrn is null  oldImageUrn == null
      oldImageUrn = sub.imageUrn ?? ''
      sub.imageUrn = req.file.filename
    } else if (type === 'banner') {
      // if sub.bannerUrn is null  oldImageUrn == null
      oldImageUrn = sub.bannerUrn ?? ''
      sub.bannerUrn = req.file.filename
    }
    // save sub
    await sub.save()
    // if sub.image or banner.image != an empty string delete old image
    if (oldImageUrn !== '') {
      fs.unlinkSync(`public\\images\\${oldImageUrn}`)
    }
    return res.json(sub)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

const router = Router()

router.post('/:name/image', user, auth, ownSub, upload.single('file'), uploadSubImage)
router.post('/', user, auth, createSub)
router.get('/:name', user, getSub)
router.get('/search/:name', searchSubs)

export default router