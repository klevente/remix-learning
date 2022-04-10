import { Link, Form } from "@remix-run/react";
import type { Joke } from "@prisma/client";

export function JokeDisplay({
  joke,
  isOwner,
  canDelete = true,
}: {
  joke: Pick<Joke, "content" | "name">;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  const { name, content } = joke;

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{content}</p>
      <Link to=".">{name} Permalink</Link>
      {isOwner ? (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}
