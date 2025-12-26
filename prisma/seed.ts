import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const barbearia = await prisma.barbershop.create({
    data: {
      name: "Barbearia do Morais",
      address: "Avenida Central, 500, São Paulo",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })