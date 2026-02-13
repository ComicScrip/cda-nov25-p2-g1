import { runSeeds } from "./seed/orchestrator";

runSeeds()
  .then(() => {
    console.log("All seeds executed successfully");
  })
  .catch((err) => {
    console.error(err);
  });
