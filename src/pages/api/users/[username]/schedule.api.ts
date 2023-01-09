import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { string, z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'POST') return response.status(405).end()

  const username = String(request.query.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return response.status(400).json({ message: 'User does not exist.' })
  }

  const createSchedulingBody = z.object({
    name: z.string(),
    email: z.string().email(),
    observations: z.string(),
    date: string().datetime(),
  })

  const { name, email, observations, date } = createSchedulingBody.parse(
    request.body,
  )

  const schedulingDate = dayjs(date).startOf('hour')

  if (schedulingDate.isBefore(new Date())) {
    return response.status(400).json({
      message: 'Date is in the past.',
    })
  }

  const conflictingScheduling = await prisma.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: schedulingDate.toDate(),
    },
  })

  if (conflictingScheduling) {
    return response.status(400).json({
      message: 'There is another scheduling at the same time.',
    })
  }

  await prisma.scheduling.create({
    data: {
      name,
      email,
      observations,
      date: schedulingDate.toDate(),
      user_id: user.id,
    },
  })

  return response.status(201).end()
}
