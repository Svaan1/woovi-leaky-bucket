# Woovi Leaky Bucket

My attempt at implementing the code [challenge from woovi](https://github.com/woovibr/jobs/blob/main/challenges/woovi-leaky-bucket-challenge.md), my first experience implementing an API with Relay + GraphQL.

Template: [woovi-playground](https://github.com/woovibr/woovi-playground)

## Considerations

In this part i document some of my tought processes, difficulties, opinions i had during the development. I'm just yapping so any of this could be wrong or aggregate to nothing.

### Web Development is heavily opinionated

Too many tools, too many options, too many best practices. It's great to see an ever evolving ecosystem that tries at all times to create newer and better solutions to existing problems, but it makes it really damn hard to find solid ground when learning. I guess what makes a good developer nowadays is how fast they can adapt to these.

Specially when working with niche stacks that aim to solve specifics problems, like in the case of GraphQL. It creates great benefits on what it proposes, but at the cost of a completely different specification from most common options such as REST.

That being said, the developer experience wasn't bad at all, no typing problems from TS, no pipeline errors from Turbo, no package issues from PNPM, i will definitely use it again in the future, hopefully with some defined structure to refer to.

### AIs are not great yet

I don't think i ever had worst results using AI, my guess is the smaller number of public sample codes it can scan? It couldn't even write test cases properly, but once i've wrote the first it followed the patterns (something which they are best at) with no problems.

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- Node.js

  ```sh
  https://nodejs.org/en/download/
  ```

- PNPM

  ```sh
  npm install pnpm -g
  ```

- Docker

  ```sh
  https://www.docker.com/get-started/
  ```

## Installation

Clone the repo

```sh
git clone https://github.com/Svaan1/woovi-leaky-bucket.git
```

1. Install packages

   ```sh
   pnpm install
   ```

2. Run the container(or stop it, if necessary):

   ```sh
   pnpm compose:up
   ```

3. Setup Configuration

   ```sh
   pnpm config:local
   ```

4. Run the relay

   ```sh
   pnpm relay
   ```

5. Run the Project

   ```sh
   pnpm dev
   ```

6. The react application is available at port 3000 and the GraphQL API at 4000

7. Just create an account via the register page and search for keys (all of them are invalid except for valid-key)

<!-- MARKDOWN LINKS & IMAGES -->

[next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[next-url]: https://nextjs.org/
[react.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[node.js]: https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[node-url]: https://nodejs.org/
[graphql]: https://img.shields.io/badge/Graphql-E10098?style=for-the-badge&logo=graphql&logoColor=white
[graphql-url]: https://graphql.org/
[mongodb]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[mongodb-url]: https://mongodb.com
[koa]: https://img.shields.io/badge/Koa-F9F9F9?style=for-the-badge&logo=koa&logoColor=33333D
[koa-url]: https://koajs.com
