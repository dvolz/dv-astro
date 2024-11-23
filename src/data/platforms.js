export const platforms = {
	linkedin: {
		url: (username) => `https://www.linkedin.com/in/${username}`,
		icon: 'mdi:linkedin',
	},
	twitter: {
		url: (username) => `https://www.twitter.com/${username}`,
		icon: 'mdi:twitter',
	},
	instagram: {
		url: (username) => `https://www.instagram.com/${username}`,
		icon: 'mdi:instagram',
	},
}

export const defaultPlatform = {
	url: (platform, username) => `https://www.${platform}.com/${username}`,
	icon: (platform) => `mdi:${platform}`,
}
