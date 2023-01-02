import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

export default async function handle(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'POST') return response.status(405).end

  const session = await unstable_getServerSession(
    request,
    response,
    buildNextAuthOptions(request, response),
  )

  return response.status(201).json({ session })
}
