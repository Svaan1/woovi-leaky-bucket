import { TokensQuery } from "./TokensQuery";
import { isAuthenticated } from "../../../schema/rules";

export const tokensQueries = {
  tokens: TokensQuery,
};

export const tokensQueryPermissions = {
  tokens: isAuthenticated,
};
