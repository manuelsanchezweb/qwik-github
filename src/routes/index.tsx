import { component$, Resource, useResource$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { GitHubLogo } from "~/components/icons/github";
import { QwikLogo } from "~/components/icons/qwik";

export default component$(() => {
  const github = useStore({
    org: "manuelsanchezweb",
  });

  const reposResource = useResource$<string[]>(({ track, cleanup }) => {
    // We need a way to re-run fetching data whenever the `github.org` changes.
    // Use `track` to trigger re-running of the this data fetching function.
    track(() => github.org);

    // A good practice is to use `AbortController` to abort the fetching of data if
    // new request comes in. We create a new `AbortController` and register a `cleanup`
    // function which is called when this function re-runs.
    const controller = new AbortController();
    cleanup(() => controller.abort());

    // Fetch the data and return the promises.
    return getRepositories(github.org, controller);
  });

  return (
    <>
      <div class="logos">
        <QwikLogo />
        +
        <GitHubLogo />
      </div>
      <h1>Encuentra tus repositorios</h1>
      <div class="repos">
        <span>
          <strong>Usuario de GitHub:</strong>
          <input
            style={{ margin: "0 10px" }}
            value={github.org}
            onInput$={(ev) =>
              (github.org = (ev.target as HTMLInputElement).value)
            }
          />
        </span>

        <div class="repos__container">
          <Resource
            value={reposResource}
            onPending={() => <>Cargando...</>}
            onRejected={(error) => <>Error: {error.message}</>}
            onResolved={(repos) => (
              <ul>
                {repos.map((repo) => (
                  <li>
                    <a
                      target="_blank"
                      rel="nofollow noopener"
                      href={`https://github.com/${github.org}/${repo}`}
                    >
                      {repo}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          />
        </div>
      </div>
      <div>
        Ejemplo sacado de{" "}
        <a
          target="_blank"
          rel="nofollow noopener"
          href="https://qwik.builder.io/tutorial/introduction/resource/#fetching-data"
        >
          la documentación oficial de Qwik
        </a>
      </div>
    </>
  );
});

export async function getRepositories(
  username: string,
  controller?: AbortController
): Promise<string[]> {
  console.log("FETCH", `https://api.github.com/users/${username}/repos`);
  const resp = await fetch(`https://api.github.com/users/${username}/repos`, {
    signal: controller?.signal,
  });
  console.log("FETCH resolved");
  const json = await resp.json();
  return Array.isArray(json)
    ? json.map((repo: { name: string }) => repo.name)
    : Promise.reject(json);
}

export const head: DocumentHead = {
  title: "⭐️ GitHub Repos con Qwik",
  meta: [
    {
      name: "description",
      content: "GitHub Repos con Qwik",
    },
  ],
};
