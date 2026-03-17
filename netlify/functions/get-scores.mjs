import { getStore } from '@netlify/blobs'

const VALID_MAPS = ['small', 'medium', 'large', 'xl', 'extreme']

function blobKey(map) {
	return map === 'medium' ? 'scores' : `scores-${map}`
}

export default async (req) => {
	const url = new URL(req.url)
	const map = url.searchParams.get('map') || 'medium'
	const mapKey = VALID_MAPS.includes(map) ? map : 'medium'

	const store = getStore('shark-leaderboard')
	const raw = await store.get(blobKey(mapKey))
	const scores = raw ? JSON.parse(raw) : []

	return new Response(JSON.stringify(scores), {
		headers: { 'Content-Type': 'application/json' },
	})
}

export const config = {
	path: '/api/scores',
	method: 'GET',
}
