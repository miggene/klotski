import { AudioClip, AudioSource, resources } from 'cc';

export const SOUND_CLIPS = {
	BG: 'sounds/bg',
	CLICK_FOOD: 'sounds/clickFood',
	DEFAULT_CLICK: 'sounds/defaultClick',
	FLIP: 'sounds/flip',
	FOOD_ENTER: 'sounds/foodEnter',
	SLIDE: 'sounds/slide',
	THANKS: 'sounds/thanks',
	WIN: 'sounds/win',
	FAIL: 'sounds/fail',
};

class AudioMgr {
	private static _instance: AudioMgr;
	public static get instance() {
		if (!this._instance) this._instance = new AudioMgr();
		return this._instance;
	}
	private _audioSource: AudioSource;
	public init(audioSource: AudioSource) {
		this._audioSource = audioSource;
		resources.preloadDir('sounds', AudioClip);
	}

	public playBgMusic(path: string = SOUND_CLIPS.BG) {
		if (this._audioSource.playing) return;
		resources.load(path, AudioClip, (err, clip) => {
			if (!err) {
				this._audioSource.clip = clip;
				this._audioSource.loop = true;
				this._audioSource.play();
			}
		});
	}
	public stopBgMusic() {
		this._audioSource.stop();
	}

	public playSound(path: string) {
		resources.load(path, AudioClip, (err, clip) => {
			if (!err) {
				this._audioSource.playOneShot(clip);
			}
		});
	}
}
export const audioMgr = AudioMgr.instance;
