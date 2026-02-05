import { Howl } from "howler";

// Sound effect identifiers
type SoundId = "flip";

interface SoundConfig {
	src: string[];
	volume?: number;
}

const AUDIO_BASE_PATH = `${import.meta.env.BASE_URL}projects/cards/audio/`;

const SOUND_CONFIGS: Record<SoundId, SoundConfig> = {
	flip: {
		src: [`${AUDIO_BASE_PATH}flip.wav`],
		volume: 0.5,
	},
};

const PITCH_INCREMENT = 0.05;
const PITCH_MAX = 2.0;
const PITCH_DEFAULT = 1.0;
const STORAGE_KEY = "cards:muted";

class AudioManager {
	private sounds: Map<SoundId, Howl> = new Map();
	private muted = false;
	private currentPitch = PITCH_DEFAULT;

	constructor() {
		this.loadMutedState();
		this.loadSounds();
	}

	private loadMutedState(): void {
		if (typeof window === "undefined") return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			this.muted = stored === "true";
		} catch {
			// localStorage may be unavailable (e.g., private browsing)
		}
	}

	private saveMutedState(): void {
		try {
			localStorage.setItem(STORAGE_KEY, String(this.muted));
		} catch {
			// localStorage may be unavailable
		}
	}

	private loadSounds(): void {
		if (typeof window === "undefined") return;

		for (const [id, config] of Object.entries(SOUND_CONFIGS)) {
			const sound = new Howl({
				src: config.src,
				volume: config.volume ?? 1,
				preload: true,
				onloaderror: (_soundId, error) => {
					console.warn(`Failed to load sound "${id}":`, error);
				},
			});
			this.sounds.set(id as SoundId, sound);
		}
	}

	play(id: SoundId): void {
		if (this.muted) return;
		const sound = this.sounds.get(id);
		if (sound) {
			sound.rate(this.currentPitch);
			sound.play();
		}
	}

	increasePitch(): void {
		this.currentPitch = Math.min(
			this.currentPitch + PITCH_INCREMENT,
			PITCH_MAX,
		);
	}

	resetPitch(): void {
		this.currentPitch = PITCH_DEFAULT;
	}

	setMuted(muted: boolean): void {
		this.muted = muted;
		this.saveMutedState();
	}

	isMuted(): boolean {
		return this.muted;
	}

	toggleMute(): boolean {
		this.muted = !this.muted;
		this.saveMutedState();
		return this.muted;
	}
}

// Singleton instance
export const audio = new AudioManager();

// Convenience exports
export function playSound(id: SoundId): void {
	audio.play(id);
}

export function toggleMute(): boolean {
	return audio.toggleMute();
}

export function setMuted(muted: boolean): void {
	audio.setMuted(muted);
}

export function isMuted(): boolean {
	return audio.isMuted();
}

export function increasePitch(): void {
	audio.increasePitch();
}

export function resetPitch(): void {
	audio.resetPitch();
}
