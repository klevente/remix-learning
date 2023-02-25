import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

function createPromise<T>(data: T, timeout = 1000): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, timeout);
  });
}

export async function loader() {
  const important = await createPromise("important", 0);
  const notImportant1 = createPromise("not-important-1", 1000);
  const notImportant2 = createPromise("not-important-2", 2000);
  const notImportant3 = createPromise("not-important-3", 3000);
  return defer({
    important,
    notImportant1,
    notImportant2,
    notImportant3,
  });
}

export default function Index() {
  const { important, notImportant1, notImportant2, notImportant3 } =
    useLoaderData<typeof loader>();

  // const combined = Promise.all([notImportant1, notImportant2, notImportant3]);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <p>{important}</p>
      <Suspense fallback={<p>Loading 1...</p>}>
        <Await resolve={notImportant1}>{(result) => <p>{result}</p>}</Await>
      </Suspense>
      <Suspense fallback={<p>Loading 2...</p>}>
        <Await resolve={notImportant2}>{(result) => <p>{result}</p>}</Await>
      </Suspense>
      <Suspense fallback={<p>Loading 3...</p>}>
        <Await resolve={notImportant3}>{(result) => <p>{result}</p>}</Await>
      </Suspense>

      {/*<Suspense fallback={<p>Loading...</p>}>
        <Await resolve={notImportant1}>{(result) => <p>{result}</p>}</Await>
        <Await resolve={notImportant2}>{(result) => <p>{result}</p>}</Await>
        <Await resolve={notImportant3}>{(result) => <p>{result}</p>}</Await>
      </Suspense>*/}
      <p>More content here</p>
    </div>
  );
}
