import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

async function main() {
  try {
    // Create default admin user
    const adminPassword = await hashPassword('1234') // Default password for admin

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: UserRole.ADMINISTRATOR,
        isActive: true
      }
    })

    console.log('Created admin user:', admin)

    // Create departments
    const departments = [
      { name: 'Marketing', description: 'Handles creative concepts and marketing strategies' },
      { name: 'Project Management', description: 'Manages project workflow and client communication' },
      { name: 'Design', description: 'Creates designs and handles artwork production' },
      { name: 'All Departments', description: 'Tasks that require collaboration across departments' },
      { name: 'Finance', description: 'Handles invoicing and financial tracking' },
      { name: 'Installation', description: 'Performs physical installation of products' },
      { name: 'Production', description: 'Handles manufacturing and production processes' },
      { name: 'Prep', description: 'Prepares surfaces and materials for installation' }
    ]

    for (const dept of departments) {
      await prisma.department.create({
        data: {
          ...dept,
          manager: {
            connect: {
              id: admin.id
            }
          }
        }
      })
    }

    console.log('Created departments')

    // Create customers
    const customers = [
      { name: 'Acme Corporation', email: 'contact@acmecorp.com', phone: '555-0123' },
      { name: 'Pacific Northwest Motors', email: 'fleet@pnwmotors.com', phone: '555-0124' },
      { name: 'Downtown Retail Group', email: 'signs@drg.com', phone: '555-0125' },
      { name: 'Fresh Foods Market', email: 'marketing@freshfoods.com', phone: '555-0126' },
      { name: 'Tech Solutions Inc', email: 'branding@techsolutions.com', phone: '555-0127' },
      { name: 'City Transit Authority', email: 'fleet.graphics@citytransit.org', phone: '555-0128' },
      { name: 'Mountain Brewery Co', email: 'design@mountainbrew.com', phone: '555-0129' }
    ]

    for (const customer of customers) {
      await prisma.customer.create({
        data: customer
      })
    }

    console.log('Created customers')

    // Create workflow
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Standard Vehicle Wrap Process',
        description: 'Standard workflow for vehicle wrap projects',
        version: '1.0',
        isActive: true,
        createdBy: {
          connect: {
            id: admin.id
          }
        },
        phases: {
          create: [
            {
              name: 'Marketing',
              description: 'Initial client contact and project setup',
              order: 1,
              estimatedDuration: 5,
              tasks: {
                create: [
                  { name: 'Creative Concept Meeting', description: 'Initial client meeting', estimatedHours: 2 },
                  { name: 'Follow up Email', description: 'Send follow-up documentation', estimatedHours: 1 },
                  { name: 'Rough Mock up', description: 'Create initial design concept', estimatedHours: 4 },
                  { name: 'Photos & Sizing', description: 'Vehicle documentation', estimatedHours: 2 },
                  { name: 'Physical Inspection', description: 'Vehicle inspection', estimatedHours: 2 },
                  { name: 'Confirm and Update Invoice', description: 'Financial documentation', estimatedHours: 1 }
                ]
              }
            },
            {
              name: 'Design',
              description: 'Design and approval process',
              order: 2,
              estimatedDuration: 10,
              tasks: {
                create: [
                  { name: 'Pre-Design Layout Meeting', description: 'Team planning meeting', estimatedHours: 2 },
                  { name: 'Create and verify Template', description: 'Technical setup', estimatedHours: 4 },
                  { name: 'Start High Res Design', description: 'Main design work', estimatedHours: 8 },
                  { name: 'Art Direction Sign Off', description: 'Internal approval', estimatedHours: 1 },
                  { name: 'Customer Sign Off', description: 'Client approval', estimatedHours: 2 }
                ]
              }
            },
            {
              name: 'Production',
              description: 'Material production and preparation',
              order: 3,
              estimatedDuration: 8,
              tasks: {
                create: [
                  { name: 'Order Raw Materials', description: 'Material procurement', estimatedHours: 2 },
                  { name: 'Print Ready Files', description: 'File preparation', estimatedHours: 4 },
                  { name: 'Printing', description: 'Material printing', estimatedHours: 6 },
                  { name: 'Quality Control', description: 'Production QC', estimatedHours: 2 }
                ]
              }
            },
            {
              name: 'Installation',
              description: 'Final installation and delivery',
              order: 4,
              estimatedDuration: 5,
              tasks: {
                create: [
                  { name: 'Pre-Installation Prep', description: 'Surface preparation', estimatedHours: 4 },
                  { name: 'Installation', description: 'Main installation work', estimatedHours: 8 },
                  { name: 'Quality Control', description: 'Final inspection', estimatedHours: 2 },
                  { name: 'Client Handoff', description: 'Project completion', estimatedHours: 1 }
                ]
              }
            }
          ]
        }
      }
    })

    console.log('Created workflow:', workflow)

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 