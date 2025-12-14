/**
 * YouTube Timer Controller
 * Manages video playback with timed annotations and BPM-based counting
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TimingNote {
    time: number
    message?: string
    duration?: number
    countTo?: boolean
    showAfterCountTo?: boolean
    color?: string
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let player: any
let timingNotes: TimingNote[] = []
let startTime = 0
let duration = 60
let endTime = 60
let beatsPerMeasure = 4
let beatInterval = 0
let updateInterval: number
let activeNoteTimeout: number
let currentActiveNote: number | null = null
let isScrubbing = false
let scrubbingInterval: number

// ============================================================================
// URL MANAGEMENT
// ============================================================================

function updateURL(
    videoId: string,
    start: number,
    dur: number,
    bpm?: number,
    timeSig?: number
): void {
    const url = new URL(window.location.href)
    url.searchParams.set('v', videoId)
    url.searchParams.set('start', start.toString())
    url.searchParams.set('duration', dur.toString())
    if (bpm) url.searchParams.set('bpm', bpm.toString())
    if (timeSig) url.searchParams.set('timeSig', timeSig.toString())
    window.history.pushState({}, '', url.toString())
}

function loadFromURL(): void {
    const params = new URLSearchParams(window.location.search)
    const videoId = params.get('v')
    const start = params.get('start')
    const dur = params.get('duration')
    const bpm = params.get('bpm')
    const timeSig = params.get('timeSig')

    if (videoId) {
        const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement
        if (videoUrlInput) videoUrlInput.value = videoId
    }
    if (start) {
        const startTimeInput = document.getElementById('startTime') as HTMLInputElement
        if (startTimeInput) startTimeInput.value = start
    }
    if (dur) {
        const durationInput = document.getElementById('duration') as HTMLInputElement
        if (durationInput) durationInput.value = dur
    }
    if (bpm) {
        const bpmInput = document.getElementById('bpm') as HTMLInputElement
        if (bpmInput) bpmInput.value = bpm
    }
    if (timeSig) {
        const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement
        if (timeSigSelect) timeSigSelect.value = timeSig
    }

    // Auto-load if all params present
    if (videoId && start && dur) {
        setTimeout(() => {
            document.getElementById('loadVideo')?.click()
        }, 1000)
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getVideoId(input: string): string | null {
    if (!input) return null

    // If it's already just an ID
    if (input.length === 11 && !input.includes('/')) {
        return input
    }

    // Extract from various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
    ]

    for (const pattern of patterns) {
        const match = input.match(pattern)
        if (match && match[1]) {
            return match[1]
        }
    }

    return null
}

function formatTime(seconds: number): string {
    return seconds.toFixed(1) + 's'
}

function updateBeatInterval(): void {
    const bpmInput = document.getElementById('bpm') as HTMLInputElement
    const beatIntervalSpan = document.getElementById('beatInterval')

    if (bpmInput && beatIntervalSpan) {
        const bpm = parseFloat(bpmInput.value)
        if (bpm > 0) {
            beatInterval = 60 / bpm
            beatIntervalSpan.textContent = beatInterval.toFixed(3)
        } else {
            beatInterval = 0
            beatIntervalSpan.textContent = '0'
        }
    }
}

function updateTimeSignature(): void {
    const timeSignatureSelect = document.getElementById('timeSignature') as HTMLSelectElement
    if (timeSignatureSelect) {
        beatsPerMeasure = parseInt(timeSignatureSelect.value)
    }
}

// ============================================================================
// JSON VALIDATION
// ============================================================================

function validateTimingNotes(): boolean {
    const textarea = document.getElementById('timingNotes') as HTMLTextAreaElement
    const statusDiv = document.getElementById('jsonStatus')
    const label = document.getElementById('timingNotesLabel')
    const value = textarea.value.trim()

    if (!value) {
        timingNotes = []
        if (statusDiv) {
            statusDiv.className = 'json-status'
            statusDiv.style.display = 'none'
        }
        if (label) {
            label.textContent = 'Timing Notes (JSON)'
        }
        return true
    }

    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) {
            throw new Error('JSON must be an array')
        }

        // Validate structure
        for (const note of parsed) {
            if (typeof note.time !== 'number') {
                throw new Error('Each note must have a "time" number property')
            }
            if (!note.countTo && typeof note.message !== 'string') {
                throw new Error('Each note must have either "message" or "countTo" property')
            }
            if (note.duration && typeof note.duration !== 'number') {
                throw new Error('Duration must be a number')
            }
            if (note.countTo && typeof note.countTo !== 'boolean') {
                throw new Error('countTo must be a boolean')
            }
        }

        timingNotes = parsed.sort((a, b) => a.time - b.time)
        displayNotesList()
        createMarkers()

        if (statusDiv) {
            statusDiv.className = 'json-status valid'
            statusDiv.textContent = `Valid JSON ✓ (${timingNotes.length} notes)`
        }
        if (label) {
            label.textContent = `Timing Notes (JSON) ✅ Valid`
        }
        return true
    } catch (e) {
        if (statusDiv) {
            statusDiv.className = 'json-status invalid'
            statusDiv.textContent = `Error: ${(e as Error).message}`
        }
        if (label) {
            label.textContent = `Timing Notes (JSON) 💣 Invalid`
        }
        return false
    }
}

// ============================================================================
// UI DISPLAY FUNCTIONS
// ============================================================================

function createMarkers(): void {
    const markersContainer = document.getElementById('markers')
    if (!markersContainer || !player) return

    markersContainer.innerHTML = ''

    timingNotes.forEach((note) => {
        // Only show markers within the current viewing window
        if (note.time >= startTime && note.time <= endTime) {
            const marker = document.createElement('div')
            marker.className = 'marker'
            const position = ((note.time - startTime) / duration) * 100
            marker.style.left = `${position}%`
            marker.title = `${formatTime(note.time)}: ${note.countTo ? 'COUNT-TO' : note.message}`
            markersContainer.appendChild(marker)
        }
    })
}

function displayNotesList(): void {
    const notesList = document.getElementById('notesList')
    if (!notesList) return

    if (timingNotes.length === 0) {
        notesList.innerHTML = 'No notes loaded'
        return
    }

    notesList.innerHTML = timingNotes
        .map(
            (note, index) => `
		<div class="note-item" data-index="${index}">
			<strong>${formatTime(note.time)}</strong> - ${note.countTo ? '🎵 COUNT-TO' : note.message}
			${note.duration ? ` (${note.duration}s)` : ''}
		</div>
	`
        )
        .join('')
}

// ============================================================================
// TIMING NOTE LOGIC
// ============================================================================

function checkTimingNotes(currentTime: number): void {
    const noteDisplay = document.getElementById('currentNote')
    if (!noteDisplay) return

    let foundActive = false

    for (let index = 0; index < timingNotes.length; index++) {
        const note = timingNotes[index]
        const noteItem = document.querySelector(`[data-index="${index}"]`)

        // Handle count-to: count starts one measure BEFORE the target time
        if (note.countTo) {
            if (beatInterval <= 0) {
                noteItem?.classList.remove('active')
                continue
            }

            const countInDuration = beatInterval * beatsPerMeasure
            const countStartTime = note.time - countInDuration
            const timeIntoCountIn = currentTime - countStartTime

            // Count starts one measure before target, ends at target
            if (timeIntoCountIn >= 0 && timeIntoCountIn < countInDuration) {
                const currentBeat = Math.floor(timeIntoCountIn / beatInterval) + 1

                if (currentBeat <= beatsPerMeasure) {
                    if (currentActiveNote !== index) {
                        currentActiveNote = index
                        noteItem?.classList.add('active')
                    }
                    noteDisplay.classList.add('active')
                    noteDisplay.textContent = currentBeat.toString()
                    noteDisplay.style.borderColor = note.color || '#E8A87C'
                    foundActive = true
                }
            } else {
                noteItem?.classList.remove('active')
            }

            if (foundActive) continue
        }

        // Handle regular message notes
        if (note.message) {
            let showTime = note.time
            let hideTime = Infinity

            // If showAfterCountTo, start showing right when the previous countTo ends
            if (note.showAfterCountTo) {
                for (let i = index - 1; i >= 0; i--) {
                    if (timingNotes[i].countTo && timingNotes[i].time <= note.time) {
                        showTime = timingNotes[i].time
                        break
                    }
                }
            }

            // Find the next note (countTo or message) to determine when to hide
            for (let i = index + 1; i < timingNotes.length; i++) {
                const nextNote = timingNotes[i]

                // If next note is a countTo, hide when its count-in starts
                if (nextNote.countTo && beatInterval > 0) {
                    const nextCountInDuration = beatInterval * beatsPerMeasure
                    const nextCountStartTime = nextNote.time - nextCountInDuration
                    hideTime = nextCountStartTime
                    break
                }

                // If next note is a message, hide when it starts
                if (nextNote.message) {
                    let nextShowTime = nextNote.time
                    if (nextNote.showAfterCountTo) {
                        // Find when it actually shows (at the previous countTo)
                        for (let j = i - 1; j >= 0; j--) {
                            if (timingNotes[j].countTo && timingNotes[j].time <= nextNote.time) {
                                nextShowTime = timingNotes[j].time
                                break
                            }
                        }
                    }
                    hideTime = nextShowTime
                    break
                }
            }

            if (currentTime >= showTime && currentTime < hideTime) {
                if (currentActiveNote !== index) {
                    currentActiveNote = index
                    noteDisplay.classList.add('active')
                    noteDisplay.textContent = note.message
                    noteDisplay.style.borderColor = note.color || '#E8A87C'
                    noteItem?.classList.add('active')
                }
                foundActive = true
            } else {
                noteItem?.classList.remove('active')
            }
        }
    }

    if (!foundActive && currentActiveNote !== null) {
        currentActiveNote = null
        noteDisplay.classList.remove('active')
        noteDisplay.textContent = 'No note active'
        noteDisplay.style.borderColor = 'var(--text-color)'
    }
}

// ============================================================================
// PLAYBACK MANAGEMENT
// ============================================================================

function updatePlaybackUI(): void {
    if (!player || typeof player.getCurrentTime !== 'function') return

    const currentTime = player.getCurrentTime()

    // Stop at end time
    if (currentTime >= endTime) {
        player.pauseVideo()
        player.seekTo(startTime, true)
        return
    }

    // Update time display
    const currentTimeSpan = document.getElementById('currentTime')
    const totalTimeSpan = document.getElementById('totalTime')
    if (currentTimeSpan) currentTimeSpan.textContent = formatTime(currentTime)
    if (totalTimeSpan) totalTimeSpan.textContent = formatTime(endTime)

    // Update scrubber
    const scrubber = document.getElementById('scrubber') as HTMLInputElement
    if (scrubber) {
        const progress = ((currentTime - startTime) / duration) * 100
        scrubber.value = Math.max(0, Math.min(100, progress)).toString()
    }

    // Check timing notes
    checkTimingNotes(currentTime)
}

function enableControls(): void {
    document.getElementById('playBtn')?.removeAttribute('disabled')
    document.getElementById('pauseBtn')?.removeAttribute('disabled')
    document.getElementById('resetBtn')?.removeAttribute('disabled')
    document.getElementById('scrubber')?.removeAttribute('disabled')
}

function loadVideo(): void {
    const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement
    const startTimeInput = document.getElementById('startTime') as HTMLInputElement
    const durationInput = document.getElementById('duration') as HTMLInputElement

    const videoId = getVideoId(videoUrlInput.value)
    if (!videoId) {
        alert('Please enter a valid YouTube video ID or URL')
        return
    }

    startTime = parseFloat(startTimeInput.value) || 0
    duration = parseFloat(durationInput.value) || 60
    endTime = startTime + duration

    updateTimeSignature()
    updateBeatInterval()

    const bpmInput = document.getElementById('bpm') as HTMLInputElement
    const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement
    const bpmValue = bpmInput.value ? parseFloat(bpmInput.value) : undefined
    const timeSigValue = timeSigSelect.value ? parseInt(timeSigSelect.value) : undefined

    updateURL(videoId, startTime, duration, bpmValue, timeSigValue)

    if (!validateTimingNotes()) return

    // Create or update player
    if (player) {
        player.loadVideoById({
            videoId: videoId,
            startSeconds: startTime,
        })
    } else {
        player = new (window as any).YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                start: startTime,
                controls: 1,
                modestbranding: 1,
            },
            events: {
                onReady: () => {
                    console.log('Player ready')
                    enableControls()
                    createMarkers()
                    updateInterval = window.setInterval(updatePlaybackUI, 100)
                },
                onStateChange: (event: any) => {
                    if (event.data === (window as any).YT.PlayerState.PLAYING) {
                        updateInterval = window.setInterval(updatePlaybackUI, 100)
                    } else {
                        clearInterval(updateInterval)
                    }
                },
            },
        })
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initializeEventListeners(): void {
    // Load video
    document.getElementById('loadVideo')?.addEventListener('click', loadVideo)

    // Playback controls
    document.getElementById('playBtn')?.addEventListener('click', () => player?.playVideo())
    document.getElementById('pauseBtn')?.addEventListener('click', () => player?.pauseVideo())
    document.getElementById('resetBtn')?.addEventListener('click', () => player?.seekTo(startTime, true))

    // Load Example Song button
    document.getElementById('loadExample')?.addEventListener('click', () => {
        const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement
        const startTimeInput = document.getElementById('startTime') as HTMLInputElement
        const durationInput = document.getElementById('duration') as HTMLInputElement
        const bpmInput = document.getElementById('bpm') as HTMLInputElement
        const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement

        if (videoUrlInput) videoUrlInput.value = 'uOm-ccnhrjk'
        if (startTimeInput) startTimeInput.value = '133'
        if (durationInput) durationInput.value = '70'
        if (bpmInput) bpmInput.value = '149'
        if (timeSigSelect) timeSigSelect.value = '3'

        updateBeatInterval()
        updateTimeSignature()
        loadVideo()
    })

    // Toggle Video Player
    const toggleBtn = document.getElementById('toggleVideo')
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const playerWrapper = document.getElementById('playerWrapper')

            if (playerWrapper) {
                const isHidden = playerWrapper.style.display === 'none'
                playerWrapper.style.display = isHidden ? 'block' : 'none'
                toggleBtn.textContent = isHidden ? '▲ Hide Video' : '▼ Show Video'
                toggleBtn.classList.toggle('expanded', isHidden)

                // Align notes list after toggle
                // Use requestAnimationFrame to ensure DOM has updated
                requestAnimationFrame(() => {
                    alignNotesWithTimingDisplay()
                    // Double check after a small delay for transitions
                    setTimeout(alignNotesWithTimingDisplay, 300)
                })
            }
        })
    }

    // Time signature
    document.getElementById('timeSignature')?.addEventListener('change', updateTimeSignature)

    // BPM input
    document.getElementById('bpm')?.addEventListener('input', updateBeatInterval)

    // JSON validation
    document.getElementById('validateJson')?.addEventListener('click', validateTimingNotes)
    document.getElementById('timingNotes')?.addEventListener('input', () => {
        clearTimeout((window as any).jsonValidationTimeout)
            ; (window as any).jsonValidationTimeout = setTimeout(validateTimingNotes, 500)
    })

    // Scrubber
    const scrubber = document.getElementById('scrubber') as HTMLInputElement
    if (scrubber) {
        const handleScrub = (event: MouseEvent) => {
            if (player) {
                const scrubberRect = scrubber.getBoundingClientRect()
                const clickPosition = (event.clientX - scrubberRect.left) / scrubberRect.width
                const seekTime = startTime + clickPosition * duration
                player.seekTo(seekTime, true)
                updatePlaybackUI() // Manually update UI immediately for responsiveness
            }
        }

        scrubber.addEventListener('mousedown', (e) => {
            isScrubbing = true
            clearInterval(updateInterval) // Pause updates
            handleScrub(e) // Handle the initial click position

            const onMouseMove = (moveEvent: MouseEvent) => {
                if (isScrubbing) {
                    handleScrub(moveEvent)
                }
            }

            const onMouseUp = () => {
                isScrubbing = false
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                // Restart updates if the video was playing
                if (player && player.getPlayerState() === (window as any).YT.PlayerState.PLAYING) {
                    updateInterval = window.setInterval(updatePlaybackUI, 100)
                }
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        })
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval)
        clearTimeout(activeNoteTimeout)
    })
}

// Function to align timing notes with timing display
function alignNotesWithTimingDisplay() {
    const notesList = document.querySelector('.notes-list') as HTMLElement
    const playerSection = document.querySelector('.player-section') as HTMLElement
    const playerWrapper = document.getElementById('playerWrapper')
    const timingDisplay = document.querySelector('.timing-display') as HTMLElement

    if (notesList && playerSection) {
        let targetElement: HTMLElement | null = null

        // Determine what to align with
        // If video is visible, align with video player
        if (playerWrapper && playerWrapper.style.display !== 'none') {
            targetElement = playerWrapper
        } else if (timingDisplay) {
            // If video is hidden, align with current note display
            targetElement = timingDisplay
        }

        if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect()
            const playerSectionRect = playerSection.getBoundingClientRect()

            // Calculate offset from top of container
            const offset = targetRect.top - playerSectionRect.top

            // Apply offset
            notesList.style.marginTop = `${Math.max(0, offset)}px`
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Load YouTube IFrame API
const tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
const firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // YouTube API Ready callback
    ; (window as any).onYouTubeIframeAPIReady = function () {
        console.log('YouTube API Ready')
    }

function init() {
    loadFromURL()
    initializeEventListeners()
    alignNotesWithTimingDisplay()

    window.addEventListener('resize', alignNotesWithTimingDisplay)

    // Watch for layout changes in the player section (e.g. video toggle)
    const playerSection = document.querySelector('.player-section')
    if (playerSection) {
        const resizeObserver = new ResizeObserver(() => {
            alignNotesWithTimingDisplay()
        })
        resizeObserver.observe(playerSection)
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
