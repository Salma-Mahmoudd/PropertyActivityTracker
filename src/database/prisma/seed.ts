import { PrismaClient, AccountStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.userActivity.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: passwordHash,
        role: UserRole.ADMIN,
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: passwordHash,
        role: UserRole.SALES_REP,
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: passwordHash,
        role: UserRole.SALES_REP,
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        name: 'Michael Brown',
        email: 'mike@example.com',
        password: passwordHash,
        role: UserRole.SALES_REP,
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        password: passwordHash,
        role: UserRole.SALES_REP,
        accountStatus: AccountStatus.INACTIVE,
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: passwordHash,
        role: UserRole.SALES_REP,
        accountStatus: AccountStatus.DELETED,
      },
      {
        name: 'Chris Johnson',
        email: 'chris@example.com',
        password: passwordHash,
        role: UserRole.ADMIN,
        accountStatus: AccountStatus.INACTIVE,
      },
      {
        name: 'Laura Garcia',
        email: 'laura@example.com',
        password: passwordHash,
        role: UserRole.ADMIN,
        accountStatus: AccountStatus.DELETED,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Users created');

  // Create Activities
  const activities = [
    {
      name: 'visit',
      description: 'Sales rep visited property',
      icon: 'https://drive.google.com/uc?export=view&id=1TgSBLv5TnVg5DYxOSC3LW-Zt86cYQbVI',
      weight: 10,
    },
    {
      name: 'call',
      description: 'Called property contact',
      icon: 'https://drive.google.com/uc?export=view&id=109kNErvUNz6EHbEPMzUdZxHDW5tdiSRX',
      weight: 8,
    },
    {
      name: 'inspection',
      description: 'Physical inspection logged',
      icon: 'https://drive.google.com/uc?export=view&id=1oo4DMcF1tMCKgswNZy6YLGygahSwTfJA',
      weight: 6,
    },
    {
      name: 'follow-up',
      description: 'Follow-up action taken',
      icon: 'https://drive.google.com/uc?export=view&id=1wpfTLTWxPvv-R_4D6TGGUl_rapZtyFng',
      weight: 4,
    },
    {
      name: 'note',
      description: 'Note left about property',
      icon: 'https://drive.google.com/uc?export=view&id=1Wq9-YaKy7cpr8q3hv5LLiGxbHwIJqErg',
      weight: 2,
    },
  ];

  await prisma.activity.createMany({ data: activities, skipDuplicates: true });

  console.log('Activities created');

  // Create Properties from CSV
  const csvPath = path.join(__dirname, 'Data sample.csv');
  const properties: {
    name?: string;
    latitude: number;
    longitude: number;
    address: string;
  }[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on(
        'data',
        (row: {
          name?: string;
          latitude: string;
          longitude: string;
          address: string;
        }) => {
          properties.push({
            name: row.name || undefined,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
          });
        },
      )
      .on('end', () => {
        if (properties.length > 0) {
          prisma.property
            .createMany({
              data: properties,
              skipDuplicates: true,
            })
            .then(() => {
              console.log(`${properties.length} Properties seeded from CSV`);
              resolve();
            })
            .catch(reject);
        } else {
          resolve();
        }
      })
      .on('error', reject);
  });

  // Create random UserActivities and calculate scores
  const salesReps = await prisma.user.findMany({
    where: { role: UserRole.SALES_REP, accountStatus: AccountStatus.ACTIVE },
  });
  const allActivities = await prisma.activity.findMany();
  const allProperties = await prisma.property.findMany();

  const userActivitiesData: any[] = [];
  const userScores: Record<number, number> = {};

  for (const rep of salesReps) {
    userScores[rep.id] = 0;
    for (let i = 0; i < 20; i++) {
      const randomActivity =
        allActivities[Math.floor(Math.random() * allActivities.length)];
      const randomProperty =
        allProperties[Math.floor(Math.random() * allProperties.length)];

      userActivitiesData.push({
        userId: rep.id,
        propertyId: randomProperty.id,
        activityId: randomActivity.id,
        note: `${randomActivity.name} for property ${randomProperty.name || randomProperty.address}`,
        latitude: randomProperty.latitude + (Math.random() - 0.5) * 0.001,
        longitude: randomProperty.longitude + (Math.random() - 0.5) * 0.001,
      });

      userScores[rep.id] += randomActivity.weight;
    }
  }

  await prisma.userActivity.createMany({ data: userActivitiesData });
  console.log(`${userActivitiesData.length} user activities created`);

  // Update user scores in DB
  for (const [userId, score] of Object.entries(userScores)) {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { score },
    });
  }

  console.log('Scores updated for all users');
}

main()
  .then(() => {
    console.log('Seed completed successfully');
    return prisma.$disconnect();
  })
  .catch((err) => {
    console.error('Seed failed', err);
    return prisma.$disconnect();
  });
