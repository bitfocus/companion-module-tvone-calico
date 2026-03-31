import { CalicoAPI, CalicoEvent, CanvasEventTypes, CanvasNames, CanvasPropertyChangedEventData } from './calico_api.js'
import { ModuleInstance } from './main.js'
import { InstanceStatus, type CompanionVariableValues } from '@companion-module/base'

export type CanvasData = {
	id: string
	value: Canvas
}

type CanvasValue = {
	FullName: string
	StbdCurrent: string
	AudioMute: boolean
	AudioVolume: number
	CutToBlack: boolean
}

class Canvas implements CanvasValue {
	FullName: string = ''
	StbdCurrent: string = ''
	AudioMute: boolean = false
	AudioVolume: number = 0
	CutToBlack: boolean = false
}

export class Calico {
	canvas!: CanvasData
	private calicoAPI: CalicoAPI
	private module: ModuleInstance

	constructor(module: ModuleInstance) {
		this.module = module

		this.calicoAPI = new CalicoAPI(this.module)
		this.calicoAPI.on('message', (message) => this.handleCalicoMessage(message))
		this.calicoAPI.on('error', (_) => this.module.updateStatus(InstanceStatus.ConnectionFailure))
		this.calicoAPI.on('open', (_) => this.module.updateStatus(InstanceStatus.Ok))
		this.calicoAPI.on('close', (_) => this.module.updateStatus(InstanceStatus.Disconnected))
	}

	private handleCalicoMessage(message: CalicoEvent) {
		try {
			switch (message.category) {
				case 'CANVAS': {
					const eventType = CanvasEventTypes[message.event as keyof typeof CanvasEventTypes]

					if (eventType == CanvasEventTypes.PROPERTY_CHANGED) {
						const data = message.data as CanvasPropertyChangedEventData
						this.module.log('info', `Canvas PROPERTY_CHANGED event: ${data.canvas} ${data.propertyName} ${data.value}`)

						this.updateCanvasProperties(data.propertyName, data.value)
						const canvasName = CanvasNames[String(data.canvas).toLowerCase() as keyof typeof CanvasNames]
						this.updateCanvasVariables(canvasName)
						this.module.checkFeedbacks('canvasaudiomute', 'canvasvideomute')
					}

					break
				}
				default:
					this.module.log('debug', `Unsupported CALICO message received: ${message.category} ${message.event}`)
					break
			}
		} catch (err) {
			this.module.log('error', `Error handling CALICO event message: [${err}]`)
		}
	}

	public async connect(): Promise<void> {
		try {
			this.module.updateStatus(InstanceStatus.Connecting)

			if (this.calicoAPI.getIsConnected()) {
				await this.calicoAPI.disconnect()
			}
			await this.calicoAPI.connect()
			await this.updateCanvas(CanvasNames.canvas1)
		} catch (err) {
			this.module.log('error', `Unable to connect to device: ${err}`)
		}
	}

	public async disconnect(): Promise<void> {
		if (this.calicoAPI) {
			await this.calicoAPI.disconnect()
			this.calicoAPI.removeAllListeners()
		}
	}

	public isConnected(): boolean {
		if (this.calicoAPI) {
			return this.calicoAPI.getIsConnected()
		}
		return false
	}

	public async updateCanvas(canvasName: CanvasNames): Promise<boolean> {
		return await this.calicoAPI
			.GetREST(
				new URL(`${this.module.config.httpMode}://${this.module.config.host}/api/v1/routing/canvases/${canvasName}`),
			)
			.then((c) => {
				this.canvas = c as CanvasData
				this.updateCanvasVariables(canvasName)
				return true
			})
			.catch((err) => {
				this.module.log('error', `Update canvas failed: ${err}`)
				return false
			})
	}

	private updateCanvasProperties(propertyName: string, value: string): void {
		switch (propertyName) {
			case 'AudioMute':
			case 'CutToBlack':
				Reflect.set(this.canvas.value, propertyName, value == 'On')
				break
			case 'AudioVolume':
				Reflect.set(this.canvas.value, propertyName, Number(value))
				break
			default:
				Reflect.set(this.canvas.value, propertyName, value)
				break
		}
		this.module.log('debug', `New Canvas values: ${JSON.stringify(this.canvas.value)}`)
	}

	private updateCanvasVariables(canvasName: CanvasNames): void {
		this.module.log('info', `updateCanvasVariables: ${this.canvas.value.AudioMute} ${this.canvas.value.CutToBlack}`)
		const variables: CompanionVariableValues = {}
		variables[`${canvasName}_mute_audio`] = this.canvas.value.AudioMute
		variables[`${canvasName}_mute_video`] = this.canvas.value.CutToBlack

		this.module.setVariableValues(variables)
	}

	public async muteCanvasAudio(canvasName: CanvasNames, isMuted: boolean): Promise<void> {
		if (!(canvasName in CanvasNames)) {
			return
		}

		const body = {
			AudioMute: isMuted,
		}

		try {
			await this.calicoAPI.SendREST(
				new URL(`${this.module.config.httpMode}://${this.module.config.host}/api/v1/routing/canvases/${canvasName}`),
				'PUT',
				JSON.stringify(body),
			)

			this.updateCanvasVariables(canvasName)

			this.module.checkFeedbacks('canvasaudiomute')
		} catch (err) {
			if (err instanceof Error) {
				this.module.log('error', `${err.message} [${err.cause}]`)
			} else {
				this.module.log('error', `${err}]`)
			}
		}
	}

	public async muteCanvasVideo(canvasName: CanvasNames, isMuted: boolean): Promise<void> {
		if (!(canvasName in CanvasNames)) {
			return
		}

		const body = {
			CutToBlack: isMuted,
		}

		try {
			await this.calicoAPI.SendREST(
				new URL(`${this.module.config.httpMode}://${this.module.config.host}/api/v1/routing/canvases/${canvasName}`),
				'PUT',
				JSON.stringify(body),
			)

			this.updateCanvasVariables(canvasName)

			this.module.checkFeedbacks('canvasvideomute')
		} catch (err) {
			if (err instanceof Error) {
				this.module.log('error', `${err.message} [${err.cause}]`)
			} else {
				this.module.log('error', `${err}]`)
			}
		}
	}

	public async executePreset(presetNumber: number): Promise<void> {
		try {
			await this.calicoAPI.SendREST(
				new URL(
					`${this.module.config.httpMode}://${this.module.config.host}/api/v1/routing/Storyboards/Storyboard${presetNumber}/Take`,
				),
				'POST',
			)
		} catch (err) {
			if (err instanceof Error) {
				this.module.log('error', `${err.message} [${err.cause}]`)
			} else {
				this.module.log('error', `${err}]`)
			}
		}
	}

	public async switchWindowSource(window: string, source: string): Promise<void> {
		const sourceREST = source.replace('.', '/')
		const body = {
			Input: `${sourceREST}`,
		}

		try {
			await this.calicoAPI.SendREST(
				new URL(`${this.module.config.httpMode}://${this.module.config.host}/api/v1/routing/windows/${window}`),
				'PUT',
				JSON.stringify(body),
			)
		} catch (err) {
			if (err instanceof Error) {
				this.module.log('error', `${err.message} [${err.cause}]`)
			} else {
				this.module.log('error', `${err}]`)
			}
		}
	}
}
