import { allow, not } from "graphql-shield";

import { UserSignupMutation } from "./UserSignupMutation";
import { UserLoginMutation } from "./UserLoginMutation";

import { isAuthenticated } from '../../../schema/rules'

export const userMutations = {
  UserSignup: UserSignupMutation,
  UserLogin: UserLoginMutation,
};

export const userMutationPermissions = {
  UserLogin: allow,
  UserSignup: allow,
}