import ffmpeg from 'fluent-ffmpeg';

function toRawWavFormat() {
  return ffmpeg('pipe:0') // pipe:0 = stdin | the inputed data (1=out,2=error)
    // .inputFormat('rtp')
    .outputOptions(['-acodec pcm_s16le', '-ar 16000', '-ac 1', '-f wav']) // define an encoding tha is compatible with Whisper Ai
    .pipe(); // Stream
};

export {toRawWavFormat};
