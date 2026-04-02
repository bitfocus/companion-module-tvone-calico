## tvONE CALICO Control

A companion module for controlling a tvONE CALICO device using the REST API.

### Module setup

- Select the protocol (HTTP ot HTTPS)
  - When using HTTPS, make sure the CALICO device is setup to use secure mode via the network settings menu
- Enter the IP address of the device
- Enter the username and password for the device

### Supported features

#### Actions

- **Canvas Audio Mute:** Mute or un-mute audio for specified canvas
- **Canvas Video Mute:** Mute or un-mute video for specified canvas (muted video black)
- **Execute preset (CALICO preset):** Execute a preset on the device by specifying the preset number
- **Switch Window Source:** Change the source of a window
- **Generic Property:** Set any property of any API resource. See [Using Generic Property and Command actions](#using-generic-property-and-command-actions)
- **Generic Command:** Run any API command resource. See [Using Generic Property and Command actions](#using-generic-property-and-command-actions)

#### Feedbacks

- **Canvas Audio Mute:** Indicates canvas audio mute state (true == Mute)
- **Canvas Video Mute:** Indicates canvas video mute state (true == Mute)

> Feedbacks are checked when an action is performed or when an event is received from the CALICO device

#### Variables

The following canvas variables are available. These are update when an action is perform, or an event is received from the CALICO device:

- `$(CALICO_Control:canvas1_mute_audio)`
- `$(CALICO_Control:canvas2_mute_audio)`
- `$(CALICO_Control:canvas3_mute_audio)`
- `$(CALICO_Control:canvas4_mute_audio)`
- `$(CALICO_Control:canvas1_mute_video)`
- `$(CALICO_Control:canvas2_mute_video)`
- `$(CALICO_Control:canvas3_mute_video)`
- `$(CALICO_Control:canvas4_mute_video)`

#### Presets

There are a number of presets included to help get you started. Each preset has a default style and an action set.

- **Basic button**
- **Mute Audio**
- **Mute Video**
- **Execute Preset (that is a CALICO preset)**
- **Switch Window Source**

### Using Generic Property and Command actions

Using the generic property and command actions it is possible to set any property on any resource supported by the CALICO REST API.

The specification for the REST API can be found here: [CALICO REST API](https://api.tvone.com/products/c7-series/c7-pro-2200/rest_api.html)

#### Generic Property

You can set any resource property using a REST PUT command by specifing the API path and the properties to send.

This action requires 2 parameters:

1. **API path**
   - Full path to the resource (as described in the REST API spec)
   - For example, to set Window properties the API path is `/routing/windows/window1`
2. **Properties**
   - Properties are formatted as JSON objects
   - All available properties for a resource are list in the REST API spec
   - For example, the available windows properties are listed [here](https://api.tvone.com/products/c7-series/c7-pro-2200/rest_api.html#/Windows/put_routing_windows__windowId_)
   - An example of setting the width and height of Window1 is a follows:
     - ```json
       { "Width": 3840, "Height": 2160 }
       ```

#### Generic Command

You can send any command (REST POST) by specifing the API path and, optionally, the command parameters.

This action requires 1 parameters and 1 optional parameter:

1. **API path**
   - Full path to the resource (as described in the REST API spec)
   - For example, to restart the device, the API path is `/system/restart`
2. **(Optional) Paramters**
   - If a command requires parameters, they a specified here as JSON array
   - Not commands do not require parameters and the ones that do a re described in the REST API spec
