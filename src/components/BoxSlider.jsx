import React from 'react'

function BoxSlider() {
	const [boxWidth, setBoxWidth] = React.useState(56.08)

	React.useEffect(() => {
		if (typeof window === 'undefined') return

		const columns = document.querySelectorAll('.column-box-lines')
		const box = document.querySelector('.box-lines .box')

		columns.forEach((column, index) => {
			const width = index === 0 || index === 3 ? boxWidth : 100 - boxWidth
			column.style.flexBasis = `${width}%`
			column.innerText = `${width}%`
		})

		const squareWidth = 100 - (100 - boxWidth) * 2
		if (box) {
			box.style.width = `${squareWidth + 0.1}%`
			box.style.paddingBottom = `${squareWidth}%`
			box.innerText = `${squareWidth}%`
		}
	}, [boxWidth])

	return (
		<div>
			<label>
				Box Width: <span>{boxWidth.toFixed(2)}</span>%
				<input
					type="range"
					min="51"
					max="99"
					value={boxWidth}
					onChange={(e) => setBoxWidth(Number(e.target.value))}
				/>
			</label>
		</div>
	)
}

export default BoxSlider
