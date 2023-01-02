import { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import { prisma } from '../../../lib/prisma'

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'POST') return response.status(405).end()

  const { username, name } = request.body

  const usernameAlreadyExists = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (usernameAlreadyExists) {
    return response.status(400).json({ message: 'Username already exists' })
  }

  const user = await prisma.user.create({
    data: {
      username,
      name,
    },
  })

  setCookie({ res: response }, '@ignitecall:userId', user.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response.status(201).json(user)
}
