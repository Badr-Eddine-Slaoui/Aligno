import { PrismaClient } from "@prisma/client";

export async function seedTimeManagement(prisma: PrismaClient) {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  const jane = await prisma.user.findUnique({
    where: { email: "jane.doe@example.com" },
  });

  if (!admin || !jane) {
    console.error("❌ Could not find users for time management seeding.");
    return;
  }

  // ─── CLEAR EXISTING DATA ─────────────────────────────────────────────
  await prisma.timeBlock.deleteMany();
  await prisma.dailySchedule.deleteMany();
  await prisma.dailyTemplate.deleteMany();

  console.log("🧹 Cleared existing time management data");

  // ─── ADMIN TEMPLATE ─────────────────────────────────────────────────
  const adminTemplate = await prisma.dailyTemplate.create({
    data: {
      name: "Work Day",
      description: "Productive full work routine",
      userId: admin.id,
    },
  });

  // ─── JANE TEMPLATE ───────────────────────────────────────────────────
  const janeTemplate = await prisma.dailyTemplate.create({
    data: {
      name: "Student Day",
      description: "Study + personal balance",
      userId: jane.id,
    },
  });

  console.log("✅ Seeded 2 templates");

  // ─── TEMPLATE BLOCKS (10 records) ───────────────────────────────────
  await prisma.timeBlock.createMany({
    data: [
      // ADMIN TEMPLATE (5)
      {
        title: "Wake Up",
        startTime: "07:00",
        endTime: "07:30",
        duration: 30,
        category: "HEALTH",
        priority: "HIGH",
        position: 1,
        templateId: adminTemplate.id,
        userId: admin.id,
      },
      {
        title: "Morning Work",
        startTime: "08:00",
        endTime: "10:00",
        duration: 120,
        category: "WORK",
        priority: "HIGH",
        position: 2,
        templateId: adminTemplate.id,
        userId: admin.id,
      },
      {
        title: "Coding Session",
        startTime: "10:15",
        endTime: "12:00",
        duration: 105,
        category: "WORK",
        priority: "HIGH",
        position: 3,
        templateId: adminTemplate.id,
        userId: admin.id,
      },
      {
        title: "Gym",
        startTime: "16:00",
        endTime: "17:00",
        duration: 60,
        category: "HEALTH",
        priority: "MEDIUM",
        position: 4,
        templateId: adminTemplate.id,
        userId: admin.id,
      },
      {
        title: "Evening Review",
        startTime: "17:30",
        endTime: "18:00",
        duration: 30,
        category: "PERSONAL",
        priority: "LOW",
        position: 5,
        templateId: adminTemplate.id,
        userId: admin.id,
      },

      // JANE TEMPLATE (5)
      {
        title: "Wake Up",
        startTime: "08:00",
        endTime: "08:30",
        duration: 30,
        category: "HEALTH",
        priority: "HIGH",
        position: 6,
        templateId: janeTemplate.id,
        userId: jane.id,
      },
      {
        title: "Study Session",
        startTime: "09:00",
        endTime: "11:00",
        duration: 120,
        category: "STUDY",
        priority: "HIGH",
        position: 7,
        templateId: janeTemplate.id,
        userId: jane.id,
      },
      {
        title: "Break",
        startTime: "11:00",
        endTime: "11:30",
        duration: 30,
        category: "BREAK",
        priority: "MEDIUM",
        position: 8,
        templateId: janeTemplate.id,
        userId: jane.id,
      },
      {
        title: "Assignments",
        startTime: "14:00",
        endTime: "16:00",
        duration: 120,
        category: "STUDY",
        priority: "HIGH",
        position: 9,
        templateId: janeTemplate.id,
        userId: jane.id,
      },
      {
        title: "Free Time",
        startTime: "17:00",
        endTime: "18:00",
        duration: 60,
        category: "PERSONAL",
        priority: "LOW",
        position: 10,
        templateId: janeTemplate.id,
        userId: jane.id,
      },
    ],
  });

  console.log("✅ Seeded 10 template blocks");

  // ─── ADMIN SCHEDULE ────────────────────────────────────────────────
  const adminSchedule = await prisma.dailySchedule.create({
    data: {
      date: new Date(),
      userId: admin.id,
      templateId: adminTemplate.id,
    },
  });

  // ─── JANE SCHEDULE ──────────────────────────────────────────────────
  const janeSchedule = await prisma.dailySchedule.create({
    data: {
      date: new Date(),
      userId: jane.id,
      templateId: janeTemplate.id,
    },
  });

  console.log("✅ Seeded 2 schedules");

  // ─── REAL TIME BLOCKS (10 records) ──────────────────────────────────
  await prisma.timeBlock.createMany({
    data: [
      // ADMIN (5)
      {
        title: "Wake Up (Today)",
        startTime: "07:05",
        endTime: "07:35",
        duration: 30,
        category: "HEALTH",
        priority: "HIGH",
        position: 1,
        scheduleId: adminSchedule.id,
        userId: admin.id,
      },
      {
        title: "Work (Today)",
        startTime: "08:10",
        endTime: "10:10",
        duration: 120,
        category: "WORK",
        priority: "HIGH",
        position: 2,
        scheduleId: adminSchedule.id,
        userId: admin.id,
      },
      {
        title: "Coding (Today)",
        startTime: "10:20",
        endTime: "12:10",
        duration: 110,
        category: "WORK",
        priority: "HIGH",
        position: 3,
        scheduleId: adminSchedule.id,
        userId: admin.id,
      },
      {
        title: "Gym (Today)",
        startTime: "16:10",
        endTime: "17:10",
        duration: 60,
        category: "HEALTH",
        priority: "MEDIUM",
        position: 4,
        scheduleId: adminSchedule.id,
        userId: admin.id,
      },
      {
        title: "Review (Today)",
        startTime: "17:20",
        endTime: "18:00",
        duration: 40,
        category: "PERSONAL",
        priority: "LOW",
        position: 5,
        scheduleId: adminSchedule.id,
        userId: admin.id,
      },

      // JANE (5)
      {
        title: "Wake Up (Today)",
        startTime: "08:05",
        endTime: "08:35",
        duration: 30,
        category: "HEALTH",
        priority: "HIGH",
        position: 6,
        scheduleId: janeSchedule.id,
        userId: jane.id,
      },
      {
        title: "Study (Today)",
        startTime: "09:10",
        endTime: "11:10",
        duration: 120,
        category: "STUDY",
        priority: "HIGH",
        position: 7,
        scheduleId: janeSchedule.id,
        userId: jane.id,
      },
      {
        title: "Break (Today)",
        startTime: "11:15",
        endTime: "11:45",
        duration: 30,
        category: "BREAK",
        priority: "MEDIUM",
        position: 8,
        scheduleId: janeSchedule.id,
        userId: jane.id,
      },
      {
        title: "Assignments (Today)",
        startTime: "14:10",
        endTime: "16:10",
        duration: 120,
        category: "STUDY",
        priority: "HIGH",
        position: 9,
        scheduleId: janeSchedule.id,
        userId: jane.id,
      },
      {
        title: "Free Time (Today)",
        startTime: "17:10",
        endTime: "18:00",
        duration: 50,
        category: "PERSONAL",
        priority: "LOW",
        position: 10,
        scheduleId: janeSchedule.id,
        userId: jane.id,
      },
    ],
  });

  console.log("🔥 Time Management seeded successfully (10 + 10 + schedules)");
}