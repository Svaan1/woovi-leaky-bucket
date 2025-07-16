import { rule } from 'graphql-shield'

export const isAuthenticated = rule({ cache: 'no_cache' })(async (parent, args, ctx, info) => {
  return ctx.user !== undefined
})