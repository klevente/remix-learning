import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useParams,
  useCatch,
  Form,
} from "@remix-run/react";

import type { Joke } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { JokeDisplay } from "~/components/joke";

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  const { joke } = data;
  return {
    title: `"${joke.name}" joke`,
    description: `Enjoy the "${joke.name} joke and much more"`,
  };
};

type LoaderData = { joke: Joke; isOwner: boolean };

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  const { jokeId } = params;
  const joke = await db.joke.findUnique({
    where: {
      id: jokeId,
    },
  });
  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  const data: LoaderData = {
    joke,
    isOwner: userId === joke.jokesterId,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_method") !== "delete") {
    throw new Response(`The _method ${form.get("_method")} is not supported`, {
      status: 400,
    });
  }

  const userId = await requireUserId(request);
  const { jokeId } = params;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", { status: 401 });
  }
  await db.joke.delete({ where: { id: jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const { joke, isOwner } = useLoaderData<LoaderData>();

  return <JokeDisplay joke={joke} isOwner={isOwner} />;
}

export function CatchBoundary() {
  const { status } = useCatch();
  const { jokeId } = useParams();

  switch (status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {jokeId} is not your joke.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">Huh? What the heck is "{jokeId}"?</div>
      );
    }
  }

  throw new Error(`Unhandled error: ${status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">
      {`There was an error loading joke by the id ${jokeId}. Sorry.`}
    </div>
  );
}
