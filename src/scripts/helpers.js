// helpers.js
export function formatDate(dateString) {
	// Parse the date string in UTC to avoid time zone offset issues
	const dateParts = dateString.split('-')
	const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])) // Months are 0-indexed

	const options = { year: 'numeric', month: 'long', day: 'numeric' }
	const formattedDate = date.toLocaleDateString('en-US', options)

	const day = date.getUTCDate()
	const suffix =
		day % 10 === 1 && day !== 11
			? 'st'
			: day % 10 === 2 && day !== 12
			? 'nd'
			: day % 10 === 3 && day !== 13
			? 'rd'
			: 'th'

	return formattedDate.replace(/\d+/, `${day}${suffix}`)
}
