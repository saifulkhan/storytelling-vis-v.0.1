# About

## Getting Started

This is tested in Ubuntu 20+ and WSL2

### Start Development Instance in Container

The following commands will stop the container and clean the image (optional).

```sh
docker-compose stop
docker-compose rm
docker rmi rampvis-ui-rampvis-ui
```

Start the server

```bash
docker-compose up -d

# see the log to check if the server has started
docker logs rampvis-ui
```

Navigate to [localhost:3000](localhost:3000) to open the UI.

### Start Development Instance Locally

Please make sure you have [Node.js](https://nodejs.org) (LTS version) and [Yarn](https://www.npmjs.com/package/yarn) (`npm install --global yarn`).

```sh
node --version
## should output ≥ 14.17

yarn --version
## should output ≥ 1.22
```

Install the dependencies and run the app in development mode using production APIs (you don’t need to start the development instances of the API endpoints).

```sh
yarn install
yarn dev
```

While the web server is running, you can open [http://localhost:3000](http://localhost:3000) in your browser to view the app.
To stop the server, press `CTRL+C` in the terminal.

If you want to use remote API endpoints instead of the local ones remove the `.env.local`.

---

The URLs may differ from the examples above depending on your server settings.

Note that you need to restart the server (`yarn dev`) for the changes to take effect.
See [Next.js docs → Environment Variables](https://nextjs.org/docs/basic-features/environment-variables) for more info.

## Local production build

1. Build the app

   ```sh
   yarn build
   ```

1. Make sure that port 3000 is not used and launch a simple HTTP server for the just-created `out` directory.

   ```sh
   npx serve out
   ```

1. Navigate to <http://localhost:3000> in your browser.

## Deployment

Running `yarn build` produces a [static HTML export](https://nextjs.org/docs/advanced-features/static-html-export), which means that the app can be served without Node.js.
One of the options is to use [nginx](https://www.nginx.com) with the following example config: [`nginx.conf`](nginx.conf).
It maps URLs like `/my/page` to files like `/my/page.html`, removes trailing slashes and applies several output-specific optimizations.
As a result, production URLs match the ones we see during `yarn dev` and `npx serve out`.

It is possible to locally test `nginx.conf` after running `yarn build`.
This requires [Docker](https://www.docker.com/products/docker-desktop).

1. Build the container (see [Dockerfile](./Dockerfile)):

   ```sh
   docker build . --tag=rampvis-ui:local
   ```

1. Make sure that port 3000 is not used and start the container:

   ```sh
   docker run -p 3000:80 rampvis-ui:local
   ```

1. Navigate to <http://localhost:3000> in your browser.

## Tests

### Run Unit Tests

```sh
yarn test
```

### Test & Debug Visualizations

- <http://localhost:3000/storyboards/_tests_/test-features>
- <http://localhost:3000/storyboards/_tests_/test-actions>
- <http://localhost:3000/storyboards/_tests_/test-plots>

## Documentation

Create object

```ts
visObject = new VISObject()
                .properties({...})
                .draw(svg)
                .coordinate(x, y, x0, y0)
```

Animate object

```ts
await visObject.show(delay, duration);
await visObject.hide(delay, duration);
```

## References

- For the Observable prototypes developed during the initial phases of RAMPVIS project, [see](https://observablehq.com/d/0a6e9c35a809660e>).
- Bootstrapped with [Next.js](https://github.com/vercel/next.js)
- Using [React MUI dashboard style](https://mui.com)
