import React, { useEffect } from 'react'

export default function IsVisibleExample() {
	useEffect(() => {
		// Using console.log with native CSS styling
		console.log(
			'%cLazy loaded Javascript coming in HOT!!',
			'font-size: 20px; font-weight: bold; color: #39ff14; text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14; padding: 1rem;'
		)
	}, [])

	return (
		<div
			style={{
				fontFamily: 'var(--p-font)',

				fontSize: '1.8rem',
			}}
		>
			Loaded with client:visible!
		</div>
	)
}
