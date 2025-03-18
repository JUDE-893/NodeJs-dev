import whisper
import sys
# import numpy as np
import soundfile as sf

# Load the Whisper model
model = whisper.load_model("base")

# Read audio from stdin (FFmpeg pipe)
audio_data, samplerate = sf.read(sys.stdin.buffer, dtype="int16")

# Process the audio
audio = whisper.pad_or_trim(whisper.load_audio(audio_data, sr=16000))

# Transcribe the audio
result = model.transcribe(audio)

# Output the transcribed text
print(result["text"])
