import { seedDefaultRoles } from "./src/lib/seed-roles";

async function main() {
    console.log("🌱 Starting database seed...\n");

    const result = await seedDefaultRoles();

    if (result.success) {
        console.log("\n✅ Database seeded successfully!");
        process.exit(0);
    } else {
        console.error("\n❌ Database seed failed!");
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
