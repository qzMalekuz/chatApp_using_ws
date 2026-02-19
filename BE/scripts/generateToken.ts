import jwt from "jsonwebtoken";
import "dotenv/config";

const username = process.argv[2];

if (!username) {
    console.error("Usage: npx ts-node scripts/generateToken.ts <username>");
    process.exit(1);
}

const secret = process.env.JWT_SECRET || "default-secret";
const token = jwt.sign({ username }, secret, { expiresIn: "24h" });

console.log(`\nToken for "${username}":\n`);
console.log(token);
console.log(`\nConnect with: ws://localhost:${process.env.PORT || 3000}?token=${token}\n`);
