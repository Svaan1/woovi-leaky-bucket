import { PixTransactionMutation } from "./PixTransactionMutation";

import { isAuthenticated } from '../../../schema/rules'

export const pixMutations = {
  PixTransaction: PixTransactionMutation,
};

export const pixMutationPermissions = {
  PixTransaction: isAuthenticated
}