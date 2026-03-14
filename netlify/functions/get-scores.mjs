import { getStore } from '@netlify/blobs'

export default async (req) => {
	const store = getStore('shark-leaderboard')

	const raw = await store.get('scores')
	const scores = raw ? JSON.parse(raw) : []

	return new Response(JSON.stringify(scores), {
		headers: { 'Content-Type': 'application/json' },
	})
}

export const config = {
	path: '/api/scores',
	method: 'GET',
}
