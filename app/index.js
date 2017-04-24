require('./../style/scss/style.scss');
import Vue from './vue';
import Router from './vue-router';
import indexButton from './index-button';

let videoEle         = document.getElementsByTagName('video')[0];
let inputRangeVolume = document.getElementById('volume-control');
inputRangeVolume.value = "100";

inputRangeVolume.addEventListener('change', ()=>{
    videoEle.volume = parseInt(inputRangeVolume.value) / 100;
});