import { json } from "@remix-run/server-runtime";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";

type LoaderData = {
  // handy way of saying: "`posts` is whatever type `getPosts` resolves to"
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader = async () => {
  return json<LoaderData>({
    posts: await getPosts(),
  });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();
  return (
    <main>
      <h1>Posts</h1>
      <Link to="admin" className="text-red-600 underline">
        Admin
      </Link>
      <ul>
        {posts.map(({ slug, title }) => (
          <li key={slug}>
            <Link to={slug} className="text-blue-600 underline">
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
