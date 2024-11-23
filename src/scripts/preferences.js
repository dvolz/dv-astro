// src/scripts/preferences.js
export const preferences = {
	theme: 'light', // default value
}

export const setPreference = (key, value) => {
	preferences[key] = value
	document.dispatchEvent(
		new CustomEvent('preferenceChange', { detail: { key, value } })
	)
}
