import type { ModuleInstance } from './main.js'
import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}
	presets['basic_button'] = {
		type: 'button',
		category: 'Template',
		name: 'Basic',
		style: {
			text: 'CALICO',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(31, 78, 121),
			show_topbar: true,
		},
		steps: [],
		feedbacks: [],
	}

	presets['audio_mute_button'] = {
		type: 'button',
		category: 'Canvas',
		name: 'Mute Audio',
		style: {
			text: 'Mute\nAudio',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(31, 78, 121),
			show_topbar: true,
		},
		steps: [
			{
				down: [
					{
						actionId: 'canvas_mute_audio',
						options: {
							canvas: 'Canvas1',
							enableMute: true,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['video_mute_button'] = {
		type: 'button',
		category: 'Canvas',
		name: 'Mute Video',
		style: {
			text: 'Mute\nVideo',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(31, 78, 121),
			show_topbar: true,
		},
		steps: [
			{
				down: [
					{
						actionId: 'canvas_mute_video',
						options: {
							canvas: 'Canvas1',
							enableMute: true,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['window_switch_source'] = {
		type: 'button',
		category: 'Window',
		name: 'Switch window source',
		style: {
			text: 'Win1\ns3i1',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(31, 78, 121),
			show_topbar: true,
		},
		steps: [
			{
				down: [
					{
						actionId: 'switch_window_source',
						options: {
							window: 'Window1',
							input: 'Slot3.In1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['preset_execute'] = {
		type: 'button',
		category: 'Preset',
		name: 'Execute preset',
		style: {
			text: 'Preset1',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(31, 78, 121),
			show_topbar: true,
		},
		steps: [
			{
				down: [
					{
						actionId: 'preset_execute',
						options: {
							presetID: 1,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	self.setPresetDefinitions(presets)
}
