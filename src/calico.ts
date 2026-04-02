import { CalicoAPI, CalicoEvent, CanvasEventTypes, CanvasNames, CanvasPropertyChangedEventData } from './calico_api.js'
import { Canvas, CanvasData } from './canvas.js'
import { ModuleInstance } from './main.js'
import { InstanceStatus, type CompanionVariableValues } from '@companion-module/base'

export class Calico {
	private calicoAPI: CalicoAPI
	private module: ModuleInstance
	private canvases: Array<CanvasData> = []

	constructor(module: ModuleInstance) {
		this.module = module

		this.canvases.push({ id: 'canvas1', value: new Canvas('Canvas1') })
		this.canvases.push({ id: 'canvas2', value: new Canvas('Canvas2') })
		this.canvases.push({ id: 'canvas3', value: new Canvas('Canvas3') })
		this.canvases.push({ id: 'canvas4', value: new Canvas('Canvas4') })

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

						this.updateCanvasProperties(data.canvas, data.propertyName, data.value)
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

			for (const c of this.canvases) {
				const canvasName = CanvasNames[String(c.id).toLowerCase() as keyof typeof CanvasNames]
				await this.updateCanvas(canvasName)
			}

			this.module.checkFeedbacks()
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

	public async updateCanvas(canvasName: CanvasNames): Promise<void> {
		if (!(canvasName in CanvasNames)) {
			return
		}

		await this.calicoAPI
			.GetREST(
				new URL(`${this.module.config.httpMode}://${this.module.config.host}/api/v1/routing/canvases/${canvasName}`),
			)
			.then((c) => {
				const responseData = c as CanvasData
				const canvas = this.canvases.find((c) => c.id.toLowerCase() == responseData.id.toLowerCase())
				if (canvas) {
					canvas.value = responseData.value
					this.module.log('debug', `Canvas Data: ${canvas.value.toString()}`)
				}

				this.updateCanvasVariables(canvasName)
			})
			.catch((err) => {
				this.module.log('error', `Update canvas failed: ${err}`)
			})
	}

	private updateCanvasProperties(canvasId: string, propertyName: string, value: string): void {
		const canvas = this.canvases.find((c) => c.id.toLowerCase() == canvasId.toLowerCase())

		if (canvas) {
			switch (propertyName) {
				case 'AudioMute':
				case 'CutToBlack':
					Reflect.set(canvas.value, propertyName, value == 'On')
					break
				case 'AudioVolume':
					Reflect.set(canvas.value, propertyName, Number(value))
					break
				default:
					Reflect.set(canvas.value, propertyName, value)
					break
			}

			this.module.log('debug', `New Canvas values: ${JSON.stringify(canvas.value)}`)
		}

		this.module.log('debug', `No canvas found (${canvasId})`)
	}

	private updateCanvasVariables(canvasName: CanvasNames): void {
		const canvas = this.canvases.find((c) => c.id.toLowerCase() == canvasName.toLowerCase())

		if (canvas) {
			this.module.log(
				'info',
				`updateCanvasVariables: ${canvas.id} ${canvas.value.AudioMute} ${canvas.value.CutToBlack}`,
			)

			const variables: CompanionVariableValues = {}
			variables[`${canvasName}_mute_audio`] = canvas.value.AudioMute
			variables[`${canvasName}_mute_video`] = canvas.value.CutToBlack

			this.module.setVariableValues(variables)
		}
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
				this.module.config.httpMode,
				this.module.config.host,
				`${CalicoAPI.canvasBaseApiPath}${canvasName}`,
				'PUT',
				JSON.stringify(body),
			)

			this.updateCanvasVariables(canvasName)

			//this.module.checkFeedbacks('canvasaudiomute')
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
				this.module.config.httpMode,
				this.module.config.host,
				`${CalicoAPI.canvasBaseApiPath}${canvasName}`,
				'PUT',
				JSON.stringify(body),
			)

			this.updateCanvasVariables(canvasName)

			//this.module.checkFeedbacks('canvasvideomute')
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
				this.module.config.httpMode,
				this.module.config.host,
				`${CalicoAPI.storyboardBaseApiPath}Storyboard${presetNumber}/Take`,
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
				this.module.config.httpMode,
				this.module.config.host,
				`${CalicoAPI.windowBaseApiPath}${window}`,
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

	public async genericPropertySet(resourceApiPath: string, body: string): Promise<void> {
		try {
			await this.calicoAPI.SendREST(this.module.config.httpMode, this.module.config.host, resourceApiPath, 'PUT', body)
		} catch (err) {
			if (err instanceof Error) {
				this.module.log('error', `${err.message} [${err.cause}]`)
			} else {
				this.module.log('error', `${err}]`)
			}
		}
	}

	public async genericCommandExecute(resourceApiPath: string, body?: string): Promise<void> {
		try {
			await this.calicoAPI.SendREST(this.module.config.httpMode, this.module.config.host, resourceApiPath, 'POST', body)
		} catch (err) {
			if (err instanceof Error) {
				this.module.log('error', `${err.message} [${err.cause}]`)
			} else {
				this.module.log('error', `${err}]`)
			}
		}
	}
}
