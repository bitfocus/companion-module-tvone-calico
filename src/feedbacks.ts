import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		canvasaudiomute: {
			name: 'Canvas Audio Mute Status',
			type: 'boolean',
			description: 'Indicate the current status of canvas audio mute for the specified canvas',
			defaultStyle: {
				bgcolor: combineRgb(37, 104, 49),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'canvas',
					type: 'textinput',
					label: 'Canvas',
					description: 'Specify the canvas by using the full name. For example, Canvas1',
					regex: '/^canvas\\d$/i',
					default: 'Canvas1',
				},
			],
			callback: (feedback) => {
				const val = self.getVariableValue(`${String(feedback.options.canvas).toLowerCase()}_mute_audio`) as boolean
				self.log('debug', `Check feedback: [${feedback.options.canvas} ${feedback.feedbackId}] [${val}]`)

				return val ?? false
			},
		},
		canvasvideomute: {
			name: 'Canvas Video Mute Status',
			type: 'boolean',
			description: 'Indicate the current status of canvas video mute for the specified canvas',
			defaultStyle: {
				bgcolor: combineRgb(37, 104, 49),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'canvas',
					type: 'textinput',
					label: 'Canvas',
					description: 'Specify the canvas by using the full name. For example, Canvas1',
					regex: '/^canvas\\d$/i',
					default: 'Canvas1',
				},
			],
			callback: (feedback) => {
				const val = self.getVariableValue(`${String(feedback.options.canvas).toLowerCase()}_mute_video`) as boolean
				self.log('debug', `Check feedback: [${feedback.options.canvas} ${feedback.feedbackId}] [${val}]`)

				return val ?? false
			},
		},
	})
}
