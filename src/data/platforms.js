export const platforms = {
	linkedin: {
		url: (username) => `https://www.linkedin.com/in/${username}`,
		icon: 'mdi:linkedin',
	},
	bluesky: {
		url: (username) => `https://bsky.app/profile/${username}.bsky.social`,
		icon: 'mdi:twitter',
	},
	instagram: {
		url: (username) => `https://www.instagram.com/${username}`,
		icon: 'mdi:instagram',
	},
}

export const defaultPlatform = {
	url: (platform, username) => `https://www.${platform}.com/${username}`,
	icon: (platform) => `${platform}`,
}
