export type CanvasData = {
	id: string
	value: Canvas
}

type CanvasValue = {
	FullName: string | undefined
	StbdCurrent: string
	AudioMute: boolean
	AudioVolume: number
	CutToBlack: boolean
}

export class Canvas implements CanvasValue {
	FullName: string | undefined
	StbdCurrent: string = ''
	AudioMute: boolean = false
	AudioVolume: number = 0
	CutToBlack: boolean = false

	constructor(name?: string) {
		this.FullName = name
	}

	public toString(): string {
		const result = `${this.FullName} AM=${this.AudioMute}, VM=${this.CutToBlack}, AV=${this.AudioVolume}`
		return result
	}
}
