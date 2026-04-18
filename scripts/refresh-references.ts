import { computeAllReferences } from "../src/lib/references/computed";
import { prisma } from "../src/lib/db";

async function main() {
  console.log("Refreshing computed references…");
  const result = await computeAllReferences();
  console.log("Done.", result);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
