import "dotenv/config";

export async function main(): Promise<void> {
  console.log("Hello via Bun from Monorepo!");
}

if (require.main === module) {
  if (process.argv[2] === "init") {
    main().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}
