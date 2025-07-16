import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "kcors";
import { graphqlHTTP } from "koa-graphql";
import Router from "koa-router";
import logger from "koa-logger";

import { getContext } from "./getContext";
import { applyMiddleware } from "graphql-middleware";
import { schema, permissions } from "../schema/schema";

const app = new Koa();

app.use(cors({ origin: "*" }));
app.use(logger());
app.use(
  bodyParser({
    onerror(err, ctx) {
      ctx.throw(err, 422);
    },
  }),
);

const routes = new Router();

routes.all(
  "/graphql",
  graphqlHTTP((request, response, ctx) => ({
    schema: applyMiddleware(schema, permissions),
    graphiql: true,
    context: getContext(ctx),
  })),
);

app.use(routes.routes());
app.use(routes.allowedMethods());

export { app };
