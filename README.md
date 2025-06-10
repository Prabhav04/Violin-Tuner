# Violin Tuner Web Application

![Violin Tuner Screenshot](/image_assets/Screenshot.png) 

A web-based violin tuner with interactive audio playback and real-time pitch detection to help musicians tune their instruments accurately.

## Features

- **String Tuning**: Play reference tones for each violin string (G, D, A, E)
- **Metronome**: Adjustable tempo control with visual indicator
- **Pitch Detection**: Real-time microphone input analysis to detect played notes
- **Responsive Design**: Works on both desktop and mobile devices
- **Visual Feedback**: Clean interface with particle animation background

## Technologies Used

- HTML5 Audio API
- Web Audio API for pitch detection
- Canvas API for background animations
- CSS3 for responsive styling
- JavaScript for interactive functionality

## Installation

No installation required - simply open the `index.html` file in a modern web browser. For full functionality:

1. Ensure you have a microphone connected for pitch detection
2. Use Chrome, Firefox, or Edge for best compatibility
3. Grant microphone permissions when prompted

## Usage

1. **Reference Tones**:
   - Click the G, D, A, or E buttons to hear reference tones
   - Click again to stop playback

2. **Metronome**:
   - Set desired BPM (30-240)
   - Click Play to start metronome
   - The circle will pulse with the beat

3. **Tuning Mode**:
   - Click "Start Tuning" and allow microphone access
   - Play a note on your violin
   - The detected pitch will display in real-time
   - Compare to reference tones to adjust tuning
   - Click "Stop Recording" when finished

## File Structure
