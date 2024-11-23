const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.message.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.workingHours.deleteMany()
  await prisma.therapist.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.therapistApplication.deleteMany()

  // Create admin user with hashed password
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin1',
      password: bcrypt.hashSync('12345', 10), // Hash password
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  })

  // Create therapist user with hashed password
  const therapistUser = await prisma.user.create({
    data: {
      username: 'therapist1',
      password: bcrypt.hashSync('12345', 10), // Hash password
      email: 'andie@example.com',
      name: 'Dr. Andie Smith',
      role: 'therapist',
    },
  })

  // Create therapist profile
  const therapist = await prisma.therapist.create({
    data: {
      userId: therapistUser.id,
      licenseNumber: 'PSY123455',
      languages: ['English', 'Spanish'],
      about: 'Experienced psychologist specializing in anxiety and depression treatment.',
      specialization: 'Cognitive Behavioral Therapy',
      yearsOfExperience: 8,
      education: 'Ph.D. in Clinical Psychology, Stanford University',
      workingHours: {
        create: {
          startDayInWeek: 'Monday',
          endDayInWeek: 'Friday',
          startHour: '09:00',
          endHour: '17:00',
        },
      },
      applicationStatus: 'approved',
    },
  })

  // Create patient user with hashed password
  const patientUser = await prisma.user.create({
    data: {
      username: 'patient1',
      password: bcrypt.hashSync('12345', 10),
      email: 'patient@example.com',
      name: 'John Doe',
      role: 'patient',
    },
  })

  // Create patient profile
  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+12345567890',
      address: '123 Main St, City',
      emergencyContact: 'Jane Doe'
    },
  })

  console.log({ adminUser, therapistUser, therapist, patientUser, patient })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })