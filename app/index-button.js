import Vue from './vue';

let data = {
    buttonText: 'Select A option',
    showInputBar: false
};



Vue.component('index-button-group', {
    template: '\
    <div>\
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
            {{buttonText}} <span class="caret"></span>\
        </button>\
        <ul class="dropdown-menu">\
        <li><a v-on:click="change(\'Create a Room\')">create a Room</a></li>\
        <li><a v-on:click="change(\'Join a Room\')">Join a Room</a></li>\
        </ul>\
        <input v-if="buttonText ==  \'Join a Room\'" type="text" />\
        <button type="button" class="btn btn-default" v-if="buttonText ==  \'Join a Room\'">Go</button>\
    </div>',
    data: ()=> {
        return data;
    },
    methods: {
        change : (text)=> {
            console.log(data.buttonText, text);
            data.buttonText = text;
            if (data.buttonText == 'Create a Room') {
                window.location= '/room';
            }
        }
    }
});

// new Vue({
//     el: '#index-button-group'
// });
