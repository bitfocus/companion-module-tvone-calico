import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'canvas1_mute_audio', name: 'Audio mute status for Canvas1' },
		{ variableId: 'canvas2_mute_audio', name: 'Audio mute status for Canvas2' },
		{ variableId: 'canvas3_mute_audio', name: 'Audio mute status for Canvas3' },
		{ variableId: 'canvas4_mute_audio', name: 'Audio mute status for Canvas4' },
		{ variableId: 'canvas1_mute_video', name: 'Video mute status for Canvas1' },
		{ variableId: 'canvas2_mute_video', name: 'Video mute status for Canvas2' },
		{ variableId: 'canvas3_mute_video', name: 'Video mute status for Canvas3' },
		{ variableId: 'canvas4_mute_video', name: 'Video mute status for Canvas4' },
	])
}
