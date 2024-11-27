export function formatDate(dateString) {
	// Parse the date string into a Date object
	const date = new Date(dateString)

	// Ensure we only work with the date portion and avoid time
	const year = date.getUTCFullYear()
	const month = date.getUTCMonth() // 0-indexed
	const day = date.getUTCDate()

	// Create a new Date object using just the date (ignoring time)
	const cleanDate = new Date(Date.UTC(year, month, day))

	// Format options for the date
	const options = { year: 'numeric', month: 'long', day: 'numeric' }
	const formattedDate = cleanDate.toLocaleDateString('en-US', options)

	// Determine the ordinal suffix for the day
	const suffix =
		day % 10 === 1 && day !== 11
			? 'st'
			: day % 10 === 2 && day !== 12
			? 'nd'
			: day % 10 === 3 && day !== 13
			? 'rd'
			: 'th'

	// Replace the day with its ordinal suffix
	return formattedDate.replace(/\d+/, `${day}${suffix}`)
}
