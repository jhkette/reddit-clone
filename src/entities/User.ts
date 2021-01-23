import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import { IsEmail, Length } from "class-validator";
import { Exclude } from "class-transformer";
import bcrypt from "bcrypt";
import Entity from "./Entity";
import Post from "./Post";

@TOEntity("users")
// extends base class Entity
export default class User extends Entity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 255, { message: "Username must be at least 3 characters long" })
  @Column({ unique: true })
  username: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  // hide password
  @Exclude()
  @Column()
  @Length(6, 255)
  password: string;

  // lifecycle hook
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
