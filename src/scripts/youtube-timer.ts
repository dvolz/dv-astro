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
    countMeasures?: number
    showAfterCountTo?: boolean
    color?: string
    resetBpm?: boolean
    newBpm?: number
    invisible?: boolean
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
let baseBeatInterval = 0 // Store the original/base beat interval
let currentBpm = 0 // Track current BPM for dynamic changes
let updateInterval: number
let activeNoteTimeout: number
let currentActiveNote: number | null = null
let lastDisplayedBeat: number | null = null
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
            baseBeatInterval = beatInterval
            currentBpm = bpm
            beatIntervalSpan.textContent = beatInterval.toFixed(3)
        } else {
            beatInterval = 0
            baseBeatInterval = 0
            currentBpm = 0
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
            // Allow invisible entries with just resetBpm, or entries with message or countTo
            if (!note.invisible && !note.resetBpm && !note.countTo && typeof note.message !== 'string') {
                throw new Error('Each note must have either "message", "countTo", "resetBpm", or "invisible" property')
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
        // Only show markers within the current viewing window and not invisible
        if (!note.invisible && note.time >= startTime && note.time <= endTime) {
            const marker = document.createElement('div')
            marker.className = 'marker'
            const position = ((note.time - startTime) / duration) * 100
            marker.style.left = `${position}%`
            marker.title = `${formatTime(note.time)}: ${note.message}${note.countTo ? ' (count-in)' : ''}`
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
        .filter((note) => !note.invisible)
        .map(
            (note, index) => {
                // Get the original index from timingNotes array
                const originalIndex = timingNotes.indexOf(note)
                const color = note.color || '#E8A87C'
                const bgColor = `color-mix(in srgb, ${color}, transparent 70%)`

                // Always display the actual note time (not the countdown start)
                const displayTime = note.time

                return `
		<div class="note-item" data-index="${originalIndex}" data-note-color="${color}" style="cursor: pointer; background-color: ${bgColor};" title="Click to jump to time">
			<strong>${formatTime(displayTime)}</strong> - ${note.message}${note.countTo ? ' 🎵' : ''}
			${note.duration ? ` (${note.duration}s)` : ''}
		</div>
	`
            }
        )
        .join('')

    // Add click listeners
    const items = notesList.querySelectorAll('.note-item')
    items.forEach((item) => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-index') || '0')
            const note = timingNotes[index]
            if (player && note) {
                // Always jump to the actual note time, not the count-in
                player.seekTo(note.time, true)
                updatePlaybackUI()
            }
        })
    })
}

// ============================================================================
// TIMING NOTE LOGIC
// ============================================================================

function checkTimingNotes(currentTime: number): void {
    const noteDisplay = document.getElementById('currentNote')
    const nextNoteText = document.getElementById('nextNoteText')
    if (!noteDisplay) return

    let foundActive = false
    let nextNoteIndex = -1

    // Clear all active states first
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active')
    })

    // Check for BPM resets at current time
    for (const note of timingNotes) {
        if (note.resetBpm && Math.abs(note.time - currentTime) < 0.1) {
            if (note.newBpm && note.newBpm > 0) {
                currentBpm = note.newBpm
                beatInterval = 60 / note.newBpm
            }
            // Reset beat tracking
            lastDisplayedBeat = null
            break
        }
    }

    for (let index = 0; index < timingNotes.length; index++) {
        const note = timingNotes[index]
        const noteItem = document.querySelector(`[data-index="${index}"]`)

        // Skip invisible notes - they shouldn't affect display
        if (note.invisible) {
            continue
        }

        // Determine show and hide times for this note
        let showTime = note.time
        let hideTime = Infinity

        // If countTo is enabled and we have BPM, count starts before the time
        if (note.countTo && beatInterval > 0) {
            const measuresToCount = note.countMeasures || 1
            const countInDuration = beatInterval * beatsPerMeasure * measuresToCount
            showTime = note.time - countInDuration
        }

        // Find when this note should hide (when next note starts)
        for (let i = index + 1; i < timingNotes.length; i++) {
            const nextNote = timingNotes[i]
            // Skip invisible notes when calculating hide time
            if (nextNote.invisible) {
                continue
            }
            let nextShowTime = nextNote.time
            if (nextNote.countTo && beatInterval > 0) {
                const nextMeasuresToCount = nextNote.countMeasures || 1
                const nextCountInDuration = beatInterval * beatsPerMeasure * nextMeasuresToCount
                nextShowTime = nextNote.time - nextCountInDuration
            }
            hideTime = nextShowTime
            break
        }

        // Check if this note is currently active
        if (currentTime >= showTime && currentTime < hideTime) {
            // Handle count-in display
            if (note.countTo && beatInterval > 0) {
                const measuresToCount = note.countMeasures || 1
                const countInDuration = beatInterval * beatsPerMeasure * measuresToCount
                const countStartTime = note.time - countInDuration
                const timeIntoCountIn = currentTime - countStartTime

                // If we're in the count-in phase
                if (timeIntoCountIn >= 0 && timeIntoCountIn < countInDuration) {
                    const totalBeats = Math.floor(timeIntoCountIn / beatInterval) + 1
                    const currentMeasureUp = Math.floor((totalBeats - 1) / beatsPerMeasure) + 1
                    const beatInMeasure = ((totalBeats - 1) % beatsPerMeasure) + 1
                    // Count measures down from measuresToCount to 1
                    const currentMeasure = measuresToCount - currentMeasureUp + 1

                    if (currentActiveNote !== index) {
                        currentActiveNote = index
                    }
                    
                    // Always set active class (since we clear all at the start)
                    noteItem?.classList.add('active')
                    if (noteItem instanceof HTMLElement) {
                        noteItem.style.setProperty('--note-color', note.color || '#E8A87C')
                    }
                    
                    noteDisplay.classList.add('active', 'counting')
                    // Show count-up: measure.beat format (e.g., 1.1, 1.2, 1.3, 1.4, 2.1, 2.2...)
                    if (measuresToCount > 1) {
                        noteDisplay.textContent = `${currentMeasure}.${beatInMeasure}`
                    } else {
                        noteDisplay.textContent = beatInMeasure.toString()
                    }

                    const color = note.color || '#E8A87C'
                    noteDisplay.style.setProperty('--note-color', color)
                    noteDisplay.style.removeProperty('border-color')

                    if (noteDisplay.parentElement) {
                        noteDisplay.parentElement.style.backgroundColor = `color-mix(in srgb, ${color}, transparent 85%)`
                    }

                    // Beat animation
                    if (totalBeats !== lastDisplayedBeat) {
                        lastDisplayedBeat = totalBeats
                        noteDisplay.classList.remove('beat-pop', 'downbeat')
                        void noteDisplay.offsetWidth
                        noteDisplay.classList.add('beat-pop')
                        // Emphasize first beat of each measure
                        if (beatInMeasure === 1) {
                            noteDisplay.classList.add('downbeat')
                        }
                    }

                    // During count-in, show the current note being counted into
                    nextNoteIndex = index

                    foundActive = true
                }
                // After count-in, show the message
                else if (currentTime >= note.time) {
                    if (currentActiveNote !== index || noteDisplay.classList.contains('counting')) {
                        currentActiveNote = index
                        noteDisplay.classList.remove('counting')
                        noteDisplay.classList.add('active')
                        noteDisplay.textContent = note.message || 'Now'

                        const color = note.color || '#E8A87C'
                        noteDisplay.style.setProperty('--note-color', color)
                        noteDisplay.style.removeProperty('border-color')

                        if (noteDisplay.parentElement) {
                            noteDisplay.parentElement.style.backgroundColor = `color-mix(in srgb, ${color}, transparent 85%)`
                        }
                    }
                    
                    // Always set active class (since we clear all at the start)
                    const color = note.color || '#E8A87C'
                    noteItem?.classList.add('active')
                    if (noteItem instanceof HTMLElement) {
                        noteItem.style.setProperty('--note-color', color)
                    }
                    
                    foundActive = true
                }
            }
            // No count-in, just show the message
            else if (note.message) {
                if (currentActiveNote !== index) {
                    currentActiveNote = index
                    noteDisplay.classList.add('active')
                    noteDisplay.classList.remove('counting')
                    noteDisplay.textContent = note.message

                    const color = note.color || '#E8A87C'
                    noteDisplay.style.setProperty('--note-color', color)
                    noteDisplay.style.removeProperty('border-color')

                    if (noteDisplay.parentElement) {
                        noteDisplay.parentElement.style.backgroundColor = `color-mix(in srgb, ${color}, transparent 85%)`
                    }
                }
                
                // Always set active class (since we clear all at the start)
                const color = note.color || '#E8A87C'
                noteItem?.classList.add('active')
                if (noteItem instanceof HTMLElement) {
                    noteItem.style.setProperty('--note-color', color)
                }
                
                foundActive = true
            }

            // Find next note for display (only if not already set during count-in)
            if (nextNoteIndex === -1 && index + 1 < timingNotes.length) {
                // Find the next visible note with a message
                for (let i = index + 1; i < timingNotes.length; i++) {
                    if (!timingNotes[i].invisible && timingNotes[i].message) {
                        nextNoteIndex = i
                        break
                    }
                }
            }
        } else {
            noteItem?.classList.remove('active')
        }
    }

    // Update next note display
    if (nextNoteText) {
        if (nextNoteIndex >= 0 && nextNoteIndex < timingNotes.length) {
            const nextNote = timingNotes[nextNoteIndex]
            // Find the next visible note with a message if current one doesn't have it
            let displayNote = nextNote
            if (!displayNote.message || displayNote.invisible) {
                for (let i = nextNoteIndex + 1; i < timingNotes.length; i++) {
                    if (!timingNotes[i].invisible && timingNotes[i].message) {
                        displayNote = timingNotes[i]
                        break
                    }
                }
            }
            nextNoteText.textContent = displayNote.message || 'Next section'
            nextNoteText.parentElement?.classList.add('visible')
        } else {
            nextNoteText.textContent = '--'
            nextNoteText.parentElement?.classList.remove('visible')
        }
    }

    if (!foundActive && currentActiveNote !== null) {
        currentActiveNote = null
        lastDisplayedBeat = null
        noteDisplay.classList.remove('active', 'beat-pop', 'downbeat', 'counting')
        noteDisplay.textContent = 'No note active'
        noteDisplay.style.removeProperty('--note-color')
        noteDisplay.style.removeProperty('border-color')

        if (noteDisplay.parentElement) {
            noteDisplay.parentElement.style.removeProperty('background-color')
        }
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
    document.getElementById('slowBtn')?.removeAttribute('disabled')
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

    // Handle optional start time and duration
    const hasStartTime = startTimeInput.value.trim() !== ''
    const hasDuration = durationInput.value.trim() !== ''

    startTime = hasStartTime ? parseFloat(startTimeInput.value) : 0
    // Duration will be set after we know video duration if not specified
    const userDuration = hasDuration ? parseFloat(durationInput.value) : null

    updateTimeSignature()
    updateBeatInterval()

    const bpmInput = document.getElementById('bpm') as HTMLInputElement
    const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement
    const bpmValue = bpmInput.value ? parseFloat(bpmInput.value) : undefined
    const timeSigValue = timeSigSelect.value ? parseInt(timeSigSelect.value) : undefined

    if (!validateTimingNotes()) return

    // Create or update player
    if (player) {
        player.loadVideoById({
            videoId: videoId,
            startSeconds: startTime,
        })
        // Wait for video to load to get duration
        const checkDuration = setInterval(() => {
            if (player.getDuration && player.getDuration() > 0) {
                clearInterval(checkDuration)
                const videoDuration = player.getDuration()
                duration = userDuration !== null ? userDuration : (videoDuration - startTime)
                endTime = startTime + duration
                updateURL(videoId, startTime, duration, bpmValue, timeSigValue)
                createMarkers()
                updatePlaybackUI() // Update current note display immediately
            }
        }, 100)
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
                    const videoDuration = player.getDuration()
                    duration = userDuration !== null ? userDuration : (videoDuration - startTime)
                    endTime = startTime + duration
                    updateURL(videoId, startTime, duration, bpmValue, timeSigValue)
                    enableControls()
                    createMarkers()
                    updatePlaybackUI() // Update current note display immediately
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

    const slowBtn = document.getElementById('slowBtn')
    slowBtn?.addEventListener('click', () => {
        if (player && player.setPlaybackRate) {
            // Get current state (default is null/empty means 'off' with speed 1)
            const currentState = slowBtn.getAttribute('data-speed')

            // Cycle through states: null -> slow-1 (0.8) -> slow-2 (0.6) -> slow-3 (0.4) -> null
            let newState: string | null
            let newSpeed: number

            if (!currentState || currentState === 'off') {
                newState = 'slow-1'
                newSpeed = 0.9
            } else if (currentState === 'slow-1') {
                newState = 'slow-2'
                newSpeed = 0.7
            } else if (currentState === 'slow-2') {
                newState = 'slow-3'
                newSpeed = 0.5
            } else {
                // slow-3 or anything else goes back to off
                newState = null
                newSpeed = 1
            }

            // Update playback speed
            player.setPlaybackRate(newSpeed)

            // Update button state and classes
            slowBtn.classList.remove('active', 'slow-1', 'slow-2', 'slow-3')

            if (newState) {
                slowBtn.setAttribute('data-speed', newState)
                slowBtn.classList.add('active', newState)
            } else {
                slowBtn.removeAttribute('data-speed')
            }

            // Update speed display
            const speedDisplay = document.getElementById('speedDisplay')
            if (speedDisplay) {
                if (newSpeed === 1) {
                    speedDisplay.textContent = ''
                } else {
                    speedDisplay.textContent = `${newSpeed}x`
                }
            }
        }
    })

    document.getElementById('resetBtn')?.addEventListener('click', () => player?.seekTo(startTime, true))

    // Load Example Song button - Funk #49
    document.getElementById('loadExample')?.addEventListener('click', () => {
        const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement
        const startTimeInput = document.getElementById('startTime') as HTMLInputElement
        const durationInput = document.getElementById('duration') as HTMLInputElement
        const bpmInput = document.getElementById('bpm') as HTMLInputElement
        const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement
        const timingNotesTextarea = document.getElementById('timingNotes') as HTMLTextAreaElement

        if (videoUrlInput) videoUrlInput.value = 'uOm-ccnhrjk'
        if (startTimeInput) startTimeInput.value = '133'
        if (durationInput) durationInput.value = '70'
        if (bpmInput) bpmInput.value = '149'
        if (timeSigSelect) timeSigSelect.value = '3'

        // Load the See You Later Alligator timing notes
        if (timingNotesTextarea && (window as any).timingNotesData) {
            timingNotesTextarea.value = JSON.stringify((window as any).timingNotesData, null, 2)
        }

        updateBeatInterval()
        updateTimeSignature()
        validateTimingNotes()
        loadVideo()
    })

    // Load Example Song 2 - Mighty to Save
    document.getElementById('loadExample2')?.addEventListener('click', () => {
        const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement
        const startTimeInput = document.getElementById('startTime') as HTMLInputElement
        const durationInput = document.getElementById('duration') as HTMLInputElement
        const bpmInput = document.getElementById('bpm') as HTMLInputElement
        const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement
        const timingNotesTextarea = document.getElementById('timingNotes') as HTMLTextAreaElement

        if (videoUrlInput) videoUrlInput.value = 'GEAcs2B-kNc'
        if (startTimeInput) startTimeInput.value = ''
        if (durationInput) durationInput.value = ''
        if (bpmInput) bpmInput.value = '73'
        if (timeSigSelect) timeSigSelect.value = '4'

        // Load the Mighty to Save timing notes
        if (timingNotesTextarea && (window as any).mightyToSaveTimingData) {
            timingNotesTextarea.value = JSON.stringify((window as any).mightyToSaveTimingData, null, 2)
        }

        updateBeatInterval()
        updateTimeSignature()
        validateTimingNotes()
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
