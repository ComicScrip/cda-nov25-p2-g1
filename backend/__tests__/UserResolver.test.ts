import gql from "graphql-tag";
import { execute } from "../jest.setup";
import { User } from "../src/entities/User";


describe("Tags Resolver", () => {
    it ("should read user from DB", async () => {
        await User.create({ email: "Test@mail.com", hashedPassword: "Test587412%" }).save();
        await User.create({ email: "Testfinal@mail.com", hashedPassword: "Test587412%" }).save();
        const res = await execute(gql`
            query User {
              users{
                id
                email
              }
            }
        `);

        expect(res).toMatchInlineSnapshot(`
{
  "body": {
    "kind": "single",
    "singleResult": {
      "data": {
        "users": [
          {
            "email": "Test@mail.com",
            "id": "578db86e-c0a4-41c8-9eba-4095bffb5b83",
          },
          {
            "email": "Testfinal@mail.com",
            "id": "13e35f29-dd03-4be9-86f4-132b1454d67f",
          },
        ],
      },
      "errors": undefined,
    },
  },
  "http": {
    "headers": Map {
      "cache-control" => "no-store",
    },
    "status": undefined,
  },
}
`);
    });
});