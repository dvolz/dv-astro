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
// COLOR PALETTE
// ============================================================================

const COLOR_PALETTE = [
    '#D8A7B1',
    '#E8A87C',
    '#D4B483',
    '#A3B18A',
    '#E5989B',
    '#B8A9C9',
    '#C97C5D',
    '#7D9BA6',
]

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
let isActiveMode = false // Track active mode state
let lastActiveNoteForReorder: number | null = null // Track when to rebuild list

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

    // Parse config values immediately so BPM/time signature are available
    // without needing to click "Load Video"
    updateTimeSignature()
    updateBeatInterval()

    // Auto-load if all params present
    if (videoId && start && dur) {
        setTimeout(() => {
            document.getElementById('loadVideo')?.click()
        }, 1000)
    }

    // Restore saved notes from localStorage
    if (loadNotesFromStorage()) {
        const textarea = document.getElementById('timingNotes') as HTMLTextAreaElement
        if (textarea) {
            textarea.value = JSON.stringify(timingNotes, null, 2)
        }
        displayNotesList()
        createMarkers()
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function saveNotesToStorage(): void {
    try {
        localStorage.setItem('yt-timer-notes', JSON.stringify(timingNotes))
    } catch (e) {
        // Storage full or unavailable
    }
}

function loadNotesFromStorage(): boolean {
    try {
        const saved = localStorage.getItem('yt-timer-notes')
        if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
                timingNotes = parsed.sort((a: TimingNote, b: TimingNote) => a.time - b.time)
                assignColors(timingNotes)
                return true
            }
        }
    } catch (e) {
        // Invalid data, ignore
    }
    return false
}

function assignColors(notes: TimingNote[]): void {
    let colorIndex = 0
    for (const note of notes) {
        // Only assign color if the note doesn't already have one
        // and if it's visible and has a message
        if (!note.color && !note.invisible && note.message) {
            note.color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length]
            colorIndex++
        }
    }
}

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
        assignColors(timingNotes)
        displayNotesList()
        createMarkers()
        saveNotesToStorage()

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

    let visibleNotes = timingNotes.filter((note) => !note.invisible)

    // If active mode is enabled and there's a current active note, reorder the list
    if (isActiveMode && currentActiveNote !== null) {
        const activeIndex = visibleNotes.findIndex((note) => timingNotes.indexOf(note) === currentActiveNote)
        
        if (activeIndex !== -1) {
            // Create a reordered array: previous, current, next, then the rest
            const reordered = []
            
            // Add previous note if exists
            if (activeIndex > 0) {
                reordered.push(visibleNotes[activeIndex - 1])
            }
            
            // Add current note
            reordered.push(visibleNotes[activeIndex])
            
            // Add next notes
            for (let i = activeIndex + 1; i < visibleNotes.length; i++) {
                reordered.push(visibleNotes[i])
            }
            
            // Add earlier notes at the end
            for (let i = 0; i < activeIndex - 1; i++) {
                reordered.push(visibleNotes[i])
            }
            
            visibleNotes = reordered
        }
    }

    notesList.innerHTML = visibleNotes
        .map(
            (note) => {
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
                updatePlaybackUI(note.time)
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

    // Apply the most recent BPM reset that we've passed
    // Start from the base BPM and apply resets in order
    let effectiveBpm = baseBeatInterval > 0 ? 60 / baseBeatInterval : 0
    let effectiveBeatInterval = baseBeatInterval
    for (const note of timingNotes) {
        if (note.resetBpm && note.newBpm && note.newBpm > 0 && currentTime >= note.time) {
            effectiveBpm = note.newBpm
            effectiveBeatInterval = 60 / note.newBpm
        }
    }
    currentBpm = effectiveBpm
    beatInterval = effectiveBeatInterval

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

                // If we're in the count-in phase (before the actual note time)
                if (timeIntoCountIn >= 0 && timeIntoCountIn < countInDuration) {
                    const totalBeats = Math.floor(timeIntoCountIn / beatInterval) + 1
                    const currentMeasureUp = Math.floor((totalBeats - 1) / beatsPerMeasure) + 1
                    const beatInMeasure = ((totalBeats - 1) % beatsPerMeasure) + 1
                    // Count measures down from measuresToCount to 1
                    const currentMeasure = measuresToCount - currentMeasureUp + 1

                    // Show countdown in the current note display
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

                    // During count-in, show this note in "Up Next"
                    nextNoteIndex = index

                    // Keep previous note highlighted in the list
                    if (index > 0) {
                        // Find the previous visible note with a message
                        for (let i = index - 1; i >= 0; i--) {
                            if (!timingNotes[i].invisible && timingNotes[i].message) {
                                const prevNoteItem = document.querySelector(`[data-index="${i}"]`)
                                prevNoteItem?.classList.add('active')
                                if (prevNoteItem instanceof HTMLElement) {
                                    prevNoteItem.style.setProperty('--note-color', timingNotes[i].color || '#E8A87C')
                                }
                                break
                            }
                        }
                    }

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
    
    // Update notes list if active mode is enabled
    if (isActiveMode) {
        // Only rebuild the list if the active note has changed
        if (lastActiveNoteForReorder !== currentActiveNote) {
            lastActiveNoteForReorder = currentActiveNote
            displayNotesList()
        }
        
        // Re-apply active class to the current note only
        if (currentActiveNote !== null) {
            const activeNoteItem = document.querySelector(`[data-index="${currentActiveNote}"]`)
            if (activeNoteItem) {
                activeNoteItem.classList.add('active')
                if (activeNoteItem instanceof HTMLElement) {
                    const note = timingNotes[currentActiveNote]
                    activeNoteItem.style.setProperty('--note-color', note.color || '#E8A87C')
                }
            }
        }
    }
}

// ============================================================================
// PLAYBACK MANAGEMENT
// ============================================================================

function updatePlaybackUI(overrideTime?: number): void {
    if (!player || typeof player.getCurrentTime !== 'function') return

    const currentTime = overrideTime !== undefined ? overrideTime : player.getCurrentTime()

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

    document.getElementById('resetBtn')?.addEventListener('click', () => {
        player?.seekTo(startTime, true)
        updatePlaybackUI(startTime)
    })

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
        renderNotesBuilder()
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
        renderNotesBuilder()
        loadVideo()
    })

    // Load Example Song 3 - Always Invisible
    document.getElementById('loadExample3')?.addEventListener('click', () => {
        const videoUrlInput = document.getElementById('videoUrl') as HTMLInputElement
        const startTimeInput = document.getElementById('startTime') as HTMLInputElement
        const durationInput = document.getElementById('duration') as HTMLInputElement
        const bpmInput = document.getElementById('bpm') as HTMLInputElement
        const timeSigSelect = document.getElementById('timeSignature') as HTMLSelectElement
        const timingNotesTextarea = document.getElementById('timingNotes') as HTMLTextAreaElement

        if (videoUrlInput) videoUrlInput.value = '-BQOzXUchS4'
        if (startTimeInput) startTimeInput.value = '150'
        if (durationInput) durationInput.value = '93'
        if (bpmInput) bpmInput.value = '154'
        if (timeSigSelect) timeSigSelect.value = '4'

        // Load the Always Invisible timing notes
        if (timingNotesTextarea && (window as any).alwaysInvisibleTimingData) {
            timingNotesTextarea.value = JSON.stringify((window as any).alwaysInvisibleTimingData, null, 2)
        }

        updateBeatInterval()
        updateTimeSignature()
        validateTimingNotes()
        renderNotesBuilder()
        loadVideo()
    })

    // ============================================================================
    // BUILDER MODE
    // ============================================================================

    let currentEditIndex: number | null = null
    let isBuilderMode = true

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    function renderNotesBuilder() {
        const builderDiv = document.getElementById('notesBuilder')
        if (!builderDiv) return

        if (timingNotes.length === 0) {
            builderDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No notes yet. Click "Add Note at Current Time" to get started.</p>'
            return
        }

        const html = timingNotes.map((note, index) => {
            const badges = []
            if (note.countTo) badges.push('<span class="badge badge-count">Count-in</span>')
            if (note.resetBpm) badges.push('<span class="badge badge-bpm">BPM Reset</span>')
            if (note.invisible) badges.push('<span class="badge badge-hidden">Hidden</span>')
            
            const colorDot = note.color ? `<span class="color-dot" style="background: ${note.color}"></span>` : ''
            
            return `
                <div class="note-builder-item" data-index="${index}">
                    <div class="note-builder-main">
                        <span class="note-time">${note.time}s</span>
                        ${colorDot}
                        <span class="note-message">${note.message || '(no message)'}</span>
                    </div>
                    <div class="note-builder-badges">${badges.join(' ')}</div>
                    <div class="note-builder-actions">
                        <button class="btn-edit" data-index="${index}">Edit</button>
                        <button class="btn-duplicate" data-index="${index}">Duplicate</button>
                    </div>
                </div>
            `
        }).join('')

        builderDiv.innerHTML = html

        // Add click handlers
        builderDiv.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.index!)
                openEditPanel(index)
            })
        })

        builderDiv.querySelectorAll('.btn-duplicate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.index!)
                const note = { ...timingNotes[index] }
                note.time += 5 // Add 5 seconds
                timingNotes.push(note)
                timingNotes.sort((a, b) => a.time - b.time)
                assignColors(timingNotes)
                renderNotesBuilder()
                displayNotesList()
                createMarkers()
                saveNotesToStorage()
            })
        })
    }

    function openEditPanel(index: number) {
        currentEditIndex = index
        const note = timingNotes[index]
        const panel = document.getElementById('editPanel')
        if (!panel) return

        // Fill form
        (document.getElementById('editTime') as HTMLInputElement).value = note.time.toString();
        (document.getElementById('editMessage') as HTMLInputElement).value = note.message || '';
        (document.getElementById('editCountTo') as HTMLInputElement).checked = note.countTo || false;
        (document.getElementById('editCountMeasures') as HTMLInputElement).value = (note.countMeasures || 1).toString();
        (document.getElementById('editResetBpm') as HTMLInputElement).checked = note.resetBpm || false;
        (document.getElementById('editNewBpm') as HTMLInputElement).value = (note.newBpm || '').toString();
        (document.getElementById('editInvisible') as HTMLInputElement).checked = note.invisible || false;
        (document.getElementById('editColor') as HTMLSelectElement).value = note.color || ''

        updateTimeFormatted()
        panel.classList.remove('hidden')
        panel.scrollIntoView({ behavior: 'smooth' })
    }

    function closeEditPanel() {
        const panel = document.getElementById('editPanel')
        if (panel) {
            panel.classList.add('hidden')
            // Scroll back to top of the notes builder to prevent whitespace
            const builderDiv = document.getElementById('notesBuilder')
            if (builderDiv) {
                builderDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
        }
        currentEditIndex = null
    }

    function updateTimeFormatted() {
        const timeInput = document.getElementById('editTime') as HTMLInputElement
        const formatted = document.getElementById('editTimeFormatted')
        if (timeInput && formatted) {
            const time = parseFloat(timeInput.value) || 0
            formatted.textContent = `(${time}s)`
        }
    }

    function syncToJSON() {
        const textarea = document.getElementById('timingNotes') as HTMLTextAreaElement
        if (textarea) {
            textarea.value = JSON.stringify(timingNotes, null, 2)
        }
    }

    // Toggle between builder and JSON mode
    document.getElementById('toggleBuilderMode')?.addEventListener('click', () => {
        isBuilderMode = !isBuilderMode
        const builderDiv = document.getElementById('builderMode')
        const jsonDiv = document.getElementById('jsonMode')
        const toggleBtn = document.getElementById('toggleBuilderMode')
        const validateBtn = document.getElementById('validateJson')

        if (isBuilderMode) {
            builderDiv!.classList.remove('hidden')
            jsonDiv!.classList.add('hidden')
            toggleBtn!.textContent = 'JSON Editor'
            renderNotesBuilder()
        } else {
            builderDiv!.classList.add('hidden')
            jsonDiv!.classList.remove('hidden')
            toggleBtn!.textContent = 'Builder'
            syncToJSON()
        }
    })

    // Add note at current time
    document.getElementById('addNoteAtTime')?.addEventListener('click', () => {
        const currentTime = player ? player.getCurrentTime() : 0
        const newNote: TimingNote = {
            time: Math.round(currentTime * 10) / 10,
            message: ''
        }
        timingNotes.push(newNote)
        timingNotes.sort((a, b) => a.time - b.time)
        assignColors(timingNotes)
        renderNotesBuilder()
        displayNotesList()
        createMarkers()
        saveNotesToStorage()
        
        // Open edit panel for the new note
        const newIndex = timingNotes.findIndex(n => n.time === newNote.time && n.message === newNote.message)
        openEditPanel(newIndex)
    })

    // Save note edits
    document.getElementById('saveNote')?.addEventListener('click', () => {
        if (currentEditIndex === null) return

        const note = timingNotes[currentEditIndex]
        note.time = parseFloat((document.getElementById('editTime') as HTMLInputElement).value)
        note.message = (document.getElementById('editMessage') as HTMLInputElement).value
        note.countTo = (document.getElementById('editCountTo') as HTMLInputElement).checked
        note.countMeasures = parseInt((document.getElementById('editCountMeasures') as HTMLInputElement).value)
        note.resetBpm = (document.getElementById('editResetBpm') as HTMLInputElement).checked
        note.newBpm = parseInt((document.getElementById('editNewBpm') as HTMLInputElement).value) || undefined
        note.invisible = (document.getElementById('editInvisible') as HTMLInputElement).checked
        note.color = (document.getElementById('editColor') as HTMLSelectElement).value || undefined

        timingNotes.sort((a, b) => a.time - b.time)
        assignColors(timingNotes)
        renderNotesBuilder()
        displayNotesList()
        createMarkers()
        saveNotesToStorage()
        closeEditPanel()
    })

    // Cancel edit
    document.getElementById('cancelEdit')?.addEventListener('click', closeEditPanel)

    // Delete note
    document.getElementById('deleteNote')?.addEventListener('click', () => {
        if (currentEditIndex === null) return
        if (confirm('Delete this note?')) {
            timingNotes.splice(currentEditIndex, 1)
            assignColors(timingNotes)
            renderNotesBuilder()
            displayNotesList()
            createMarkers()
            saveNotesToStorage()
            closeEditPanel()
        }
    })

    // Update formatted time on input
    document.getElementById('editTime')?.addEventListener('input', updateTimeFormatted)

    // Toggle Sidebar Mode (Play vs Edit)
    let isSidebarEditMode = false
    document.getElementById('toggleSidebarMode')?.addEventListener('click', function () {
        isSidebarEditMode = !isSidebarEditMode
        const playMode = document.getElementById('playMode')
        const editMode = document.getElementById('editMode')
        const btn = this as HTMLButtonElement

        if (isSidebarEditMode) {
            playMode!.classList.add('hidden')
            editMode!.classList.remove('hidden')
            btn.textContent = 'Edit Mode'
            renderNotesBuilder()
        } else {
            playMode!.classList.remove('hidden')
            editMode!.classList.add('hidden')
            btn.textContent = 'Play Mode'
            closeEditPanel()
        }
    })

    // Toggle Video Player
    const toggleBtn = document.getElementById('toggleVideo')
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const playerWrapper = document.getElementById('playerWrapper')

            if (playerWrapper) {
                const isHidden = playerWrapper.classList.contains('hidden')
                playerWrapper.classList.toggle('hidden')
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

    // Toggle Active Mode
    document.getElementById('toggleActiveMode')?.addEventListener('click', () => {
        isActiveMode = !isActiveMode
        const toggleActiveModeBtn = document.getElementById('toggleActiveMode')
        if (toggleActiveModeBtn) {
            toggleActiveModeBtn.textContent = `Active: ${isActiveMode ? 'ON' : 'OFF'}`
            toggleActiveModeBtn.classList.toggle('active', isActiveMode)
        }
        // Redisplay the notes list with new mode
        displayNotesList()
        // Update the highlighting
        if (player && player.getCurrentTime) {
            checkTimingNotes(player.getCurrentTime())
        }
    })

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
                const clickPosition = Math.max(0, Math.min(1, (event.clientX - scrubberRect.left) / scrubberRect.width))
                const seekTime = startTime + clickPosition * duration
                player.seekTo(seekTime, true)
                updatePlaybackUI(seekTime) // Use seekTime directly since player hasn't updated yet
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
        if (playerWrapper && !playerWrapper.classList.contains('hidden')) {
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
