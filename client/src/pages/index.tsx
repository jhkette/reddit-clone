import Head from "next/head";
import { Fragment } from "react";
import PostCard from "../components/PostCard";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Post, Sub } from "../types";

export default function Home() {
  const { data: posts } = useSWR<Post[]>("./posts");
  const { data: topSubs } = useSWR<Sub[]>("./misc/top-subs");
  return (
    <Fragment>
      <Head>
        <title>readit: the front page of the internet</title>
      </Head>
      <div className="container flex pt-4">
        {/* Posts feed */}
        <div className="w-160">
          {posts?.map((post) => (
            <PostCard post={post} key={post.identifier} />
          ))}
        </div>
        {/* Sidebar */}
        <div className="ml-6 w-80">
          <div className="bg-white rounded">
            <div className="p-4 border-b-2">
              <p className="text-lg font-semibold text-center">
                Top communities
              </p>
            </div>
            <div className="">
              {topSubs?.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center px-4 py-2 text-xs border-b"
                >
                  <Link href={`/r/${sub.name}`}>
                    <a>
                      <Image
                        src={sub.imageUrl}
                        className="rounded-full cursor-pointer"
                        alt="Sub"
                        width={(6 * 16) / 4}
                        height={(6 * 16) / 4}
                      />
                    </a>
                  </Link>

                  <Link href={`/r/${sub.name}`}>
                    <a className="ml-2 font-bold hover:cursor-pointer">
                      /r/{sub.name}
                    </a>
                  </Link>
                  <p className="ml-auto font-med">{sub.postCount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

// server side rendering
// see https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     const res = await Axios.get('/posts')

//     return { props: { posts: res.data } }
//   } catch (err) {
//     return { props: { error: 'Something went wrong' } }
//   }
// }
