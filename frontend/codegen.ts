import type { CodegenConfig } from "@graphql-codegen/cli";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;

const config: CodegenConfig = {
  overwrite: true,
  schema: uri,
  documents: ["**/*.{gql,graphql}"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/graphql/generated/schema.ts": {
      // see https://github.com/dotansimha/graphql-code-generator/issues/5073
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
        { add: { content: "// @ts-nocheck" } },
      ],
    },
  },
  // see https://github.com/dotansimha/graphql-code-generator-community/issues/1216
  config: {
    apolloReactCommonImportFrom: "@apollo/client/react",
    apolloReactHooksImportFrom: "@apollo/client/react",
  },
};

export default config;
