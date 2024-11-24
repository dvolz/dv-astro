import { useState, useEffect } from 'react'

export default function SliderComponent() {
	const [boxWidth, setBoxWidth] = useState(56.08)

	const getSquareWidth = (width) => 100 - (100 - width) * 2

	useEffect(() => {
		const squareWidth = getSquareWidth(boxWidth)
		const columns = document.querySelectorAll('.column-box-lines')
		const box = document.querySelector('.box-lines .box')

		columns.forEach((column, index) => {
			let width = index === 0 || index === 3 ? boxWidth : 100 - boxWidth
			column.style.flexBasis = `${width}%`
			column.innerText = `${width}%`
		})

		if (box) {
			box.style.width = `${squareWidth + 0.1}%`
			box.style.paddingBottom = `${squareWidth}%`
			box.innerText = `${squareWidth}%`
		}
	}, [boxWidth])

	return (
		<div>
			<label>
				Box Width: <span>{boxWidth}</span>%
				<input
					type="range"
					min="51"
					max="99"
					value={boxWidth}
					onChange={(e) => setBoxWidth(parseFloat(e.target.value))}
				/>
			</label>

			<div className="row box-lines">
				<div className="column column-box-lines"></div>
				<div className="column column-box-lines"></div>
				<div className="column column-box-lines"></div>
				<div className="column column-box-lines"></div>
				<div className="box"></div>
			</div>
		</div>
	)
}
