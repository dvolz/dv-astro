import { getStore } from '@netlify/blobs'

export default async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	let body
	try {
		body = await req.json()
	} catch {
		return new Response('Invalid JSON', { status: 400 })
	}

	const { name, score } = body

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		return new Response('Name is required', { status: 400 })
	}
	if (typeof score !== 'number' || score < 1) {
		return new Response('Valid score is required', { status: 400 })
	}

	const cleanName = name.trim().slice(0, 20)
	const store = getStore('shark-leaderboard')

	const raw = await store.get('scores')
	const scores = raw ? JSON.parse(raw) : []

	scores.push({ name: cleanName, score, date: new Date().toISOString() })

	// Sort descending — keep all submissions
	scores.sort((a, b) => b.score - a.score)

	await store.set('scores', JSON.stringify(scores))

	return new Response(JSON.stringify(scores), {
		headers: { 'Content-Type': 'application/json' },
	})
}

export const config = {
	path: '/api/scores',
	method: 'POST',
}
