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
