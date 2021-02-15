import { Request, Response, Router } from "express";
import auth from "../middleware/auth";
import user from "../middleware/user"; 
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import Comment from "../entities/Comment";


const createPost = async (req: Request, res: Response) => {
    // destructure stuff from req.body
  const { title, body, sub } = req.body;
  const user = res.locals.user;
  //    title cannot be empty
  if (title.trim() === "") {
    return res.status(400).json({ title: "Title must not be empty" });
  }
  try {
    //   find sub
    const subRecord = await Sub.findOneOrFail({ name: sub });
    // create new Post
    const post = new Post({ title, body, user, sub: subRecord });
    // save post
    await post.save();
    // return post
    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "error with db" });
  }
};

const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number
  const postsPerPage: number = (req.query.count || 8) as number

  try {
    const posts = await Post.find({
      order: { createdAt: 'DESC' },
      relations: ['comments', 'votes', 'sub'],
      skip: currentPage * postsPerPage,
      take: postsPerPage,
    })

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user))
    }

    return res.json(posts)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}
const getPost = async (req: Request, res: Response) => {
  try {
    const { identifier, slug } = req.params;
    const post = await Post.findOneOrFail(
      {
        identifier,
        slug,
      },
      {
        relations: ["sub", "votes"],
      }
    );
    if(res.locals.user){
      post.setUserVote(res.locals.user)
    }
    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: "Post not found" });
  }
};

const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const body = req.body.body;
  try {
    const post = await Post.findOneOrFail({
      identifier,
      slug,
    });
    
    const comment = new Comment({
      body,
      user: res.locals.user,
      post,
    });
    await comment.save();
    return res.json(comment);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: "post not found" });
  }
};

const getPostComments = async (req: Request, res: Response) => {
  const {identifier, slug} = req.params;

  try {
    const post = await Post.findOneOrFail({identifier, slug})
    const comments = await Comment.find({
      where: {post},
      order: {createdAt: 'DESC'},
      relations: ['votes']
    })

    if(res.locals.user){
      comments.forEach((c => c.setUserVote(res.locals.user )))
    }
    return res.json(comments)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong" });
    
  }
}

const router = Router();
router.post("/", user, auth, createPost);
// we can get user here - but we don't needd to see if they are auth
// for getPosts
router.get("/", user, getPosts);
router.get("/:identifier/:slug", user, getPost);

router.post("/:identifier/:slug/comments", user, auth, commentOnPost);
router.get("/:identifier/:slug/comments", user, getPostComments);

export default router;
