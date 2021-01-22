import { isEmail } from "class-validator";
import {Entity,PrimaryGeneratedColumn,Column,BaseEntity,Index, CreateDateColumn, UpdateDateColumn, BeforeInsert} from "typeorm";
import { IsEmail, Length } from 'class-validator'
import { classToPlain, Exclude } from 'class-transformer'
import bcrypt from 'bcrypt'

@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
  //   hide password from api req
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 255, { message: 'Username must be at least 3 characters long' })
  @Column({ unique: true })
  username: string;
//   hide password
  @Exclude()
  @Column()
  @Length(6, 255)
  password: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
//   lifecycle hook
  @BeforeInsert()
  async hashPassword(){
      this.password = await bcrypt.hash(this.password, 6)
  }
//   this goes through model , if field has exclude decorator it hides it
  toJSON(){
      return classToPlain(this)
  }
}
