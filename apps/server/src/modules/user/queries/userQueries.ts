import { ViewerQuery } from "./ViewerQuery";
import { isAuthenticated } from "../../../schema/rules"

export const userQueries = {
  viewer: ViewerQuery,
};

export const userQueryPermissions = {
  viewer: isAuthenticated,
};
