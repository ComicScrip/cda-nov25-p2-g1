// Configuration des variables d'environnement pour les tests
// Ces variables sont définies avant l'import de tout module qui utilise env.ts
// Cela garantit que ts-dotenv utilise ces valeurs plutôt que celles du .env

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-jwt-tests";
process.env.NODE_ENV = "test";
// Variables de base de données pour les tests (si nécessaire)
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_USER = process.env.DB_USER || "test";
process.env.DB_PASS = process.env.DB_PASS || "test";
process.env.DB_NAME = process.env.DB_NAME || "test";
process.env.GRAPHQL_SERVER_PORT = process.env.GRAPHQL_SERVER_PORT || "4000";
process.env.CORS_ALLOWED_ORIGINS =
  process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000";
