import {
  Entity as TOEntity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";
import Entity from "./Entity";
import Comment from "./Comment";
import User from "./User";
import Vote from "./Vote";
import { makeId, slugify } from "../util/helpers";
import Sub from "./Sub";

@TOEntity("posts")
export default class Post extends Entity {
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  @Index()
  @Column()
  identifier: string; // 7 Character Id

  @Column()
  title: string; // title of posr

  @Index()
  @Column()
  slug: string; // slug of post for url
  
  @Column({ nullable: true, type: "text" }) // this can be null - the sql type is text
  body: string;

  @Column()
  subName: string;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: "subName", referencedColumnName: "name" })
  sub: Sub;
  
  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  // imported from class transformer this allows us to
  // add a getter
  @Expose() get url(): string {
    return `/r/${this.subName}/${this.identifier}/${this.slug}`;
  }

  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  // protected url: string
  // @AfterLoad()
  // createFields(){
  //   this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`
  // }

  @Expose() get commentCount(): number {
    return this.comments?.length;
  }
  @Expose() get voteScore(): number {
    return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
  }

  protected userVote: number;
  // sets a user vote on a post
  setUserVote(user: User) {
    const index = this.votes?.findIndex((v) => v.username === user.username);
    //  uservote if > -1 = the
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}
