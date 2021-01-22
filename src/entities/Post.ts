import { IsEmail, Length } from 'class-validator'
import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import bcrypt from 'bcrypt'
import { Exclude } from 'class-transformer'

import Entity from './Entity'
import User from './User'
// import { makeId, slugify } from '../util/helpers'
// import Sub from './Sub'

@TOEntity('posts')
export default class Post extends Entity {
  constructor(post: Partial<Post>) {
    super()
    Object.assign(this, post)
  }

  @Index()
  @Column()
  identifier: string // 7 Character Id

  @Column()
  title: string // title of posr

  @Index()
  @Column()
  slug: string  // slug of post for url

  @Column({ nullable: true, type: 'text' }) // this can be null - the sql type is text  
  body: string

  @Column()
  subName: string

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User

//   @ManyToOne(() => Sub, (sub) => sub.posts)
//   @JoinColumn({ name: 'subName', referencedColumnName: 'name' })
//   sub: Sub

//   @BeforeInsert()
//   makeIdAndSlug() {
//     this.identifier = makeId(7)
//     this.slug = slugify(this.title)
//   }
}