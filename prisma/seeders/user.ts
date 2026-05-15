import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedUsers(prisma: PrismaClient) {
    const hashedPassword = await bcrypt.hash("SuperSecurePassword123!", 10);

    await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            username: "admin",
            email: "admin@example.com",
            password: hashedPassword,
        },
    });
}
