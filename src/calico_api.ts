import type { ModuleInstance } from './main.js'
import { EventEmitter } from 'node:events'

export enum CanvasNames {
	canvas1 = 'canvas1',
	canvas2 = 'canvas2',
	canvas3 = 'canvas3',
	canvas4 = 'canvas4',
}

export type CalicoEvent = {
	category: string
	event: string
	data: any
}

export enum CanvasEventTypes {
	PROPERTY_CHANGED = 'PROPERTY_CHANGED',
	STBDCURRENT_CHANGED = 'STBDCURRENT_CHANGED',
}

export type CanvasPropertyChangedEventData = {
	canvas: string
	propertyName: string
	value: string
}

export class CalicoAPI extends EventEmitter {
	private module: ModuleInstance
	private websocket!: WebSocket
	private isConnected: boolean

	public static canvasBaseApiPath: string = '/routing/canvases/'
	public static storyboardBaseApiPath: string = '/routing/storyboards/'
	public static windowBaseApiPath: string = '/routing/windows/'

	constructor(module: ModuleInstance) {
		super()
		this.module = module
		this.isConnected = false
	}

	public getIsConnected(): boolean {
		return this.isConnected
	}

	public async connect(): Promise<void> {
		this.module.log('info', `Connecting to device ${this.module.config.host}...`)

		this.websocket = new WebSocket(`ws://${this.module.config.host}/ws/v1/`)

		this.websocket.addEventListener('open', (event) => {
			this.module.log('info', 'WebSocket connection established')
			this.isConnected = true

			this.subscribeToCalicoEvents()

			this.emit('open', event)
		})

		this.websocket.addEventListener('message', (event) => {
			try {
				const jsonData: CalicoEvent = JSON.parse(event.data) as CalicoEvent
				this.handleCalicoEvents(jsonData)
			} catch (error) {
				this.module.log('error', `Websocket falied to parse response as JSON [${error}]`)
			}
		})

		this.websocket.addEventListener('close', (event) => {
			this.module.log('info', `WebSocket connection closed: [${event.code}] ${event.reason}`)
			this.isConnected = false
			this.emit('close', event)
		})

		this.websocket.addEventListener('error', (event) => {
			this.module.log('error', `WebSocket error: ${event.error}`)
			this.isConnected = false
			this.emit('error', event)
		})
	}

	public async disconnect(): Promise<void> {
		if (this.websocket) {
			this.module.log('info', `Disconnect from device: ${this.websocket.url}`)
			this.websocket.close()
		}
	}

	private subscribeToCalicoEvents() {
		const subscribe: string = '[{"subscribe":{"category":"CANVAS"}}]'
		this.websocket.send(subscribe)
	}

	private handleCalicoEvents(jsonMessage: CalicoEvent) {
		this.module.log(
			'info',
			`JSON Message data: ${jsonMessage.event} ${jsonMessage.category} ${JSON.stringify(jsonMessage.data)}`,
		)
		this.emit('message', jsonMessage)
	}

	public async GetREST(url: URL): Promise<any> {
		const request = new Request(url, {
			method: 'GET',
			headers: {
				Authorization: 'Basic ' + btoa(this.module.config.username + ':' + this.module.config.password),
				'Content-Type': 'application/json',
			},
		})

		try {
			const response = await fetch(request)
			const data = await response.json()
			return data
		} catch (err) {
			if (err instanceof TypeError) {
				this.module.log('error', `Failed to fetch GetREST: ${err.cause}`)
			}
			throw err
		}
	}

	public async SendREST(httpMode: string, host: string, path: string, method: string, body?: string): Promise<void> {
		const cleanPath = path.replace(/\/$/, '')
		this.module.log('debug', `Clean Path ${cleanPath}`)

		const url = new URL(`${httpMode}://${host}/api/v1${cleanPath}`)
		this.module.log('debug', `Send URL ${url}`)

		const request = new Request(url, {
			method: method,
			headers: {
				Authorization: 'Basic ' + btoa(this.module.config.username + ':' + this.module.config.password),
				'Content-Type': 'application/json',
			},
			body: body ?? '',
		})

		this.module.log('info', `SendPresetREST Sending: [${request.method}] ${request.url}`)
		this.module.log('debug', `SendPresetREST Body: ${body}`)

		const response = await fetch(request)

		if (response.ok) {
			this.module.log('info', `SendPresetREST Reponse: ${response.statusText} [${response.status}] ${response.url}`)
		} else {
			const message = `An error has occured: ${response.status}`
			throw new Error(message)
		}
	}
}
