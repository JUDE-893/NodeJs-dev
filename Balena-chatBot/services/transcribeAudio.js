import { spawn } from 'child_process';

export default function transcribeAudio() {

  return spawn('python3', ['whisper_transcribe.py']);
}
