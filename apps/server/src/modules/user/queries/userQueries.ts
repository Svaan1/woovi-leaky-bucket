import { ViewerQuery } from "./ViewerQuery";
import { allow } from "graphql-shield";

export const userQueries = {
  viewer: ViewerQuery,
};

export const userQueryPermissions = {
  viewer: allow,
};
