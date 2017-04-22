'use strict';

const http = require('http');
const ffmpeg = require('fluent-ffmpeg');

let start;

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'video/mp4'});

  let proc = new ffmpeg('video.mp4')
                  .outputOptions(['-movflags isml+frag_keyframe'])
                  .toFormat('mp4')
                  .withAudioCodec('copy')
                  .on('error', function(err,stdout,stderr) {
                      console.log('an error happened: ' + err.message);
                      console.log('ffmpeg stdout: ' + stdout);
                      console.log('ffmpeg stderr: ' + stderr);
                  })
                  .on('end', function() {
                      console.log('Processing finished !');
                  });

  if (!start) {
    start = new Date().getTime();
  } else {
    proc.seekInput((new Date().getTime() - start) / 1000);
  }

  proc.pipe(res, { end: true });
}).listen(3456);