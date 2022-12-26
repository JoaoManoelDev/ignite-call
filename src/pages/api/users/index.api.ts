import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'POST') return response.status(405).end

  const { username, name } = request.body

  const user = await prisma.user.create({
    data: {
      username,
      name,
    },
  })

  return response.status(201).json(user)
}
