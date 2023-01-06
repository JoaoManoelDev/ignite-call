import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'GET') return response.status(405).end()

  const username = String(request.query.username)
  const { date } = request.query

  if (!date) {
    return response.status(400).json({ message: 'Date not provided.' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return response.status(400).json({ message: 'User does not exist.' })
  }

  const referencesDate = dayjs(String(date))
  const isPastDate = referencesDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    return response.json({ availability: [] })
  }

  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referencesDate.get('day'),
    },
  })

  if (!userAvailability) {
    return response.json({ availability: [] })
  }

  const { time_start_in_minutes, time_end_in_minutes } = userAvailability

  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60

  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i
    },
  )

  return response.status(200).json({ possibleTimes })
}
