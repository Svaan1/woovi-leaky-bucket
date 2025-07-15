import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import { UsersQuery as UsersQueryType } from "../__generated__/UsersQuery.graphql";

const User = () => {

    const UsersQuery = graphql`
        query UsersQuery {
            users(first: 10) {
                edges {
                    node {
                        email
                    }
                    cursor
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    `

    const teste = "aaaa"


    const data = useLazyLoadQuery<UsersQueryType>(UsersQuery, {})
    return <>
        {JSON.stringify(data)}
    </>
}

export default User;