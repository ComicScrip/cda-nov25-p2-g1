import { createJWT, verifyJWT } from "../src/auth";
import { User } from "../src/entities/User";

describe("Auth functions", () => {
  describe("createJWT", () => {
    it("should create a valid JWT token for a user", async () => {
      const user = new User();
      user.id = "1";
      user.email = "test@example.com";

      const token = await createJWT(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT format: header.payload.signature
    });
  });

  describe("verifyJWT", () => {
    it("should verify a valid JWT token", async () => {
      const user = new User();
      user.id = "1";
      user.email = "test@example.com";

      const token = await createJWT(user);
      const payload = verifyJWT(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe("1");
    });

    it("should return null for an invalid token", () => {
      const invalidToken = "invalid.token.here";
      const payload = verifyJWT(invalidToken);

      expect(payload).toBeNull();
    });

    it("should return null for an empty token", () => {
      const payload = verifyJWT("");

      expect(payload).toBeNull();
    });

    it("should return null for a token with wrong secret", () => {
      // Créer un token avec un secret différent
      const wrongSecretToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.wrong-signature";
      const payload = verifyJWT(wrongSecretToken);

      expect(payload).toBeNull();
    });
  });
});
