require('./../style/scss/style.scss');
import Vue from './vue';

let videoEle = document.getElementsByTagName('video')[0];
videoEle.addEventListener('canplay', ()=>{
    console.log('I can Play');
    videoEle.play();
});

let playButton = document.getElementById('play');

playButton.addEventListener('click', ()=>{
    videoEle.currentTime = 10;
});

let pauseButton = document.getElementById('pause');

pauseButton.addEventListener('click', ()=>{
    videoEle.pause();
})