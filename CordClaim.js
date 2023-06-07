// ==UserScript==
// @name         cord claim on discord
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  cord claim on discord
// @author       Dhruv
// @match        https://*.crownofthegods.com
// @include      https://*.crownofthegods.com/?s=*
// @grant        none
// @updateURL https://raw.githubusercontent.com/DKhub85/cotg-cordclaim/main/cotgcc.user.js
// @downloadURL https://raw.githubusercontent.com/DKhub85/cotg-cordclaim/main/cotgcc.user.js
// ==/UserScript==

(function() {
    var message;
    var name;
    var gname;
    cotgsubscribe.subscribe( "chat", function( data ) {
        if(data.type=='alliance') {
            processalliance(data);
        }
 //       return data;
    },1);
    //pause to make sure chat is connected then register chatbot
    setTimeout(function() {
        cotg.chat.connect();
    }, 10000);


    function processalliance(data) {
        gname=$('#playerName').text();
        name=data.player;
        var messagex=[];
        messagex = data.message.match(/\d+/g);
        message = (messagex[0]+":"+messagex[1]).toString();
        if(data.message.substring(0, 6)=="iclaim" && gname==name){
            sendMessage();
             //012345 &lt;coords&gt;349:252&lt;/coords&gt;!regex /\d+/g
        }

    }
    function sendMessage() {
        var request = new XMLHttpRequest();
        request.open("POST", "https://discord.com/api/webhooks/766166495411437578/xwt4o5KsEjh7MVe3xLluez9Q6keeCjdYOpfBsgBXJriK8WtNUnYvNtKI9IUIqt0hbJbM");

        request.setRequestHeader('Content-type', 'application/json');

        var params = {
            username: "Cord Claim",
            avatar_url: "",
            content: message +" claimed by "+ name
        }

        request.send(JSON.stringify(params));
    }
})();