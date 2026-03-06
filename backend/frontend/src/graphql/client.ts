import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;

console.log("GQL API URL :", uri);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: uri || "/graphql",
    credentials: "include", // Important: Include cookies with requests
  }),
});

export default client;
