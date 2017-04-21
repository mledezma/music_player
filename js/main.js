(function(){
    var audio = new Audio();

    function init() {

    }

    function play() {
        audio.src = "audio.mp3"
        audio.play()
    }

    function _requestSongs(){
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'js/song.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function (){    
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    var response = JSON.parse(httpRequest.responseText);
                    console.log(response);
                } else {
                    alert('There was a problem with the request.');
                }
            }
        };        
    }

    window.Player = {
        'play': play,
    }
}());

document.getElementById('play').addEventListener('click',function(){
    Player.play();
})

