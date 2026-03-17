import { getStore } from '@netlify/blobs'
import { containsBadWord } from './bad-words.mjs'

const MAX_SCORES = 500
const MAX_SCORE_VALUE = 10000
const VALID_MAPS = ['small', 'medium', 'large', 'xl', 'extreme']

function blobKey(map) {
	return map === 'medium' ? 'scores' : `scores-${map}`
}

export default async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	const url = new URL(req.url)
	const map = url.searchParams.get('map') || 'medium'
	const mapKey = VALID_MAPS.includes(map) ? map : 'medium'

	// Simple rate limiting via IP
	const ip =
		req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
	const store = getStore('shark-leaderboard')

	const rateLimitKey = `rate:${ip}`
	const lastSubmit = await store.get(rateLimitKey)
	if (lastSubmit) {
		const elapsed = Date.now() - Number(lastSubmit)
		if (elapsed < 10_000) {
			// 10 second cooldown
			return new Response('Too many submissions, wait a moment', {
				status: 429,
			})
		}
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
	if (typeof score !== 'number' || score < 1 || score > MAX_SCORE_VALUE) {
		return new Response('Valid score is required', { status: 400 })
	}

	const cleanName = name.trim().slice(0, 20)

	if (containsBadWord(cleanName)) {
		return new Response('Invalid name', {
			status: 400,
		})
	}

	const raw = await store.get(blobKey(mapKey))
	const scores = raw ? JSON.parse(raw) : []

	scores.push({ name: cleanName, score, date: new Date().toISOString() })

	// Sort descending and cap the leaderboard
	scores.sort((a, b) => b.score - a.score)
	const capped = scores.slice(0, MAX_SCORES)

	await store.set(blobKey(mapKey), JSON.stringify(capped))
	await store.set(rateLimitKey, String(Date.now()))

	return new Response(JSON.stringify(capped), {
		headers: { 'Content-Type': 'application/json' },
	})
}

export const config = {
	path: '/api/scores',
	method: 'POST',
}
