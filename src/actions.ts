import { CanvasNames } from './calico_api.js'
import { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		preset_execute: {
			name: 'Execute preset',
			options: [
				{
					id: 'presetID',
					type: 'number',
					label: 'Preset number',
					description: 'Enter the number of the preset',
					default: 1,
					min: 1,
					max: 500,
				},
			],
			callback: async (event) => {
				try {
					self.log('info', 'Preset execute ' + event.options.presetID)
					await self.calico?.executePreset(event.options.presetID as number)
				} catch (error) {
					self.log('error', `Failed to execute preset (${error})`)
				}
			},
		},
		switch_window_source: {
			name: 'Switch Window Source',
			options: [
				{
					id: 'window',
					type: 'textinput',
					label: 'Window name',
					description: 'Fullname of the window, for example, Window1',
					regex: '/^window\\d$/i',
					default: 'Window1',
				},
				{
					id: 'input',
					type: 'textinput',
					label: 'Source name',
					description: 'Fullname of the source, for example, Slot3.In1',
				},
			],
			callback: async (event) => {
				self.log('info', 'Switch window ' + event.options.window + ' to source ' + event.options.input)
				await self.calico?.switchWindowSource(event.options.window as string, event.options.input as string)
			},
		},
		canvas_mute_audio: {
			name: 'Mute Canvas Audio',
			description: 'Mute or un-mute audio for the specified canvas',
			options: [
				{
					id: 'canvas',
					type: 'textinput',
					label: 'Canvas name',
					description: 'Fullname of the canvas, for example, Canvas1',
					regex: '/^canvas\\d$/i',
					default: 'Canvas1',
				},
				{
					id: 'enableMute',
					type: 'checkbox',
					label: 'Mute',
					description: 'Enable to mute audio, Disable to un-mute audio',
					default: true,
				},
			],
			callback: async (event) => {
				self.log('info', 'Canvas mute audio: ' + event.options.canvas)

				const canvasName = CanvasNames[String(event.options.canvas).toLowerCase() as keyof typeof CanvasNames]

				if (canvasName != undefined) {
					await self.calico?.muteCanvasAudio(canvasName, event.options.enableMute as boolean)
				} else {
					self.log('error', `Canvas name not supported (${event.options.canvas})`)
				}
			},
		},
		canvas_mute_video: {
			name: 'Mute Canvas Video',
			description: 'Cut all video to black for the specified canvas',
			options: [
				{
					id: 'canvas',
					type: 'textinput',
					label: 'Canvas name',
					description: 'Fullname of the canvas, for example, Canvas1',
					regex: '/^canvas\\d$/i',
					default: 'Canvas1',
				},
				{
					id: 'enableMute',
					type: 'checkbox',
					label: 'Mute',
					description: 'Enable to mute video, Disable to unmute',
					default: true,
				},
			],
			callback: async (event) => {
				self.log('info', 'Canvas mute video: ' + event.options.canvas)

				const canvasName = CanvasNames[String(event.options.canvas).toLowerCase() as keyof typeof CanvasNames]

				if (canvasName != undefined) {
					await self.calico?.muteCanvasVideo(canvasName, event.options.enableMute as boolean)
				} else {
					self.log('error', `Canvas name not supported (${event.options.canvas})`)
				}
			},
		},
	})
}
