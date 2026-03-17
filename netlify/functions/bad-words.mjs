// List of words to reject from leaderboard name submissions.
// Matched against lowercase input; checks for whole-word and substring matches.

const BAD_WORDS = [
	// Profanity
	'ass',
	'asshole',
	'bastard',
	'bitch',
	'bollocks',
	'bullshit',
	'cock',
	'crap',
	'cunt',
	'damn',
	'dick',
	'douche',
	'fag',
	'faggot',
	'fuck',
	'goddamn',
	'jackass',
	'motherfucker',
	'nigger',
	'nigga',
	'piss',
	'prick',
	'pussy',
	'shit',
	'slut',
	'twat',
	'whore',
	'wanker',

	// Slurs & hate speech
	'chink',
	'gook',
	'kike',
	'spic',
	'wetback',
	'retard',
	'tranny',
	'dyke',

	// Sexual
	'blowjob',
	'dildo',
	'handjob',
	'jizz',
	'porn',
	'tits',
	'boobs',
	'penis',
	'vagina',
	'anal',
	'cum',
	'orgasm',

	// Misc offensive
	'nazi',
	'hitler',
	'kkk',
	'rape',
	'molest',
	'pedo',
	'pedophile',
]

/**
 * Returns true if the input string contains a bad word.
 * Checks for substrings so variants like "f u c k" won't bypass,
 * and also strips non-alpha characters before checking.
 */
export function containsBadWord(input) {
	const lower = input.toLowerCase()
	const stripped = lower.replace(/[^a-z]/g, '')

	return BAD_WORDS.some(
		(word) => lower.includes(word) || stripped.includes(word)
	)
}
