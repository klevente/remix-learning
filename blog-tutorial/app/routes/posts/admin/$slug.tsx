import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";

import type { Post } from "@prisma/client";
import { deletePost, getPost, updatePost } from "~/models/post.server";

type LoaderData = { post: Post };

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  invariant(slug, `params.slug is required`);

  const post = await getPost(slug);
  console.log(post);
  invariant(post, `Post not found: ${slug}`);

  return json<LoaderData>({ post });
};

export const action: ActionFunction = async ({ request }) => {
  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();

  const { _action, originalSlug, title, slug, markdown } =
    Object.fromEntries(formData);
  console.log(title, slug, markdown);

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof _action === "string", "action must be a string");
  invariant(typeof originalSlug === "string", "originalSlug must be a string");
  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (_action === "update") {
     await updatePost(originalSlug,{ title, slug, markdown });
     return redirect(`/posts/admin/${slug}`);
  } else if (_action === "delete") {
    await deletePost(slug);
    return redirect("/posts/admin");
  }
  return null;
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function UpdatePost() {
  const { post } = useLoaderData<LoaderData>();
  const { title, slug, markdown } = post;
  const errors = useActionData();

  const transition = useTransition();
  const isUpdating =
    transition.state === "submitting" &&
    transition.submission.formData.get("_action") === "update";

  const isDeleting =
    transition.state === "submitting" &&
    transition.submission.formData.get("_action") === "delete";

  return (
    <Form method="post" key={slug}>
      <input type="hidden" name="originalSlug" value={slug} />
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={markdown}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          name="_action"
          value="delete"
          className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting" : "Delete Post"}
        </button>
        <button
          type="submit"
          name="_action"
          value="update"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating" : "Update Post"}
        </button>
      </p>
    </Form>
  );
}
