// // prisma/seed.ts

// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   // Hash the password
//   const saltRounds = 10;
//   const hashedPassword = await bcrypt.hash('iphone4s', saltRounds);

//   // Create the User (ragulbahee@gmail.com)
//   const user = await prisma.user.create({
//     data: {
//       email: 'ragulbahee@gmail.com',
//       password: hashedPassword,
//       firstName: 'Ragul',
//       lastName: 'Bahee',
//     },
//   });

//   console.log('Created user:', user);

// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });