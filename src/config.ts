import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	httpMode: string
	host: string
	username: string
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'httpMode',
			label: 'Select protocol',
			choices: [
				{ id: 'http', label: 'HTTP' },
				{ id: 'https', label: 'HTTPS' },
			],
			default: 'http',
			width: 21,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'CALICO Device IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'username',
			label: 'Username',
			width: 21,
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 21,
		},
	]
}
