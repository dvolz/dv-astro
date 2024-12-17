import fs from 'fs'
import path from 'path'

// Define the path to your .env file
const envFilePath = path.resolve(process.cwd(), '.env')

// Get the current date
const currentDate = new Date().toISOString().split('T')[0]

// Read the existing .env file
fs.readFile(envFilePath, 'utf8', (err, data) => {
	if (err) {
		console.error(`Error reading .env file: ${err.message}`)
		process.exit(1)
	}

	// Update or add the LAST_UPDATED field
	let updatedEnv = data
		.split('\n')
		.map((line) =>
			line.startsWith('LAST_UPDATED=') ? `LAST_UPDATED=${currentDate}` : line
		)
		.join('\n')

	// If LAST_UPDATED doesn't exist, append it
	if (!updatedEnv.includes('LAST_UPDATED=')) {
		updatedEnv += `\nLAST_UPDATED=${currentDate}`
	}

	// Write the updated .env file
	fs.writeFile(envFilePath, updatedEnv, 'utf8', (err) => {
		if (err) {
			console.error(`Error writing .env file: ${err.message}`)
			process.exit(1)
		}
		console.log(`.env file updated with LAST_UPDATED=${currentDate}`)
	})
})
