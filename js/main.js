(function(window){
    var audio = new Audio();
    var songs = '';
    var songList = [];
    var thisSong = -1;
    var playerControls = document.getElementById('player-controls');
    var format = '';
    var previous = '';
    var next = '';

    // IIFE that calls the jason
    (function _requestSongs() {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'js/songs.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function (){    
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    var response = JSON.parse(httpRequest.responseText);
                    songs = response.songs;
                    _composeSongList();
                    _init();
                } else {
                    alert('There was a problem with the request.');
                }
            }
        }       
    }());

    // Compose songList object
    function _composeSongList() {
        console.log(songs);
        console.log(songs.length);
        for(var i = 0; i < 2; i++) {
            songList.push(songs[i]);
            console.log(songList)
        }
    }

    // Initialize the audio player
    function _init() {
        _createList();
        playerControls.appendChild(_play());    
        playerControls.appendChild(_timeline());  
        playerControls.appendChild(_volume()); 
        playerControls.appendChild(_songCurrentTime()[0]);           
        playerControls.appendChild(_songCurrentTime()[1]); 
        playerControls.appendChild(_back()); 
        playerControls.appendChild(_next());         
        document.getElementById('initialTime').innerHTML = '0:00';
        document.getElementById('totalTime').innerHTML = '0:00';          
                  
    }

    // Creates the list based in the json.
    function _createList() {
        var id = 0;        
        songList.forEach(function(song) {
            var tr = document.createElement('tr');
            tr.id = id++;
            for(var info in song) {
                var td = document.createElement('td');
                td.textContent = song[info]
                tr.appendChild(td);             
            }
            document.getElementById('listSongs').appendChild(tr);
        });
    }

    // Initialize the play and the pause button and his function
    function _play() {
        var i = document.createElement('i');
        i.classList.add('fa', 'fa-play');
        i.setAttribute('aria-hidden', 'true');
        i.style.fontSize ='44px';
        i.id = 'playBtn';
        i.addEventListener('click', function(event) {
            console.log(thisSong)
            if(thisSong !== -1 && event.target.id === 'playBtn') {
                audio.play();
                playBtn.className = '';
                playBtn.classList.add('fa', 'fa-pause');   
                playBtn.id = 'pauseBtn';               
            }
            else if(thisSong !== -1 && event.target.id === 'pauseBtn') {
                audio.pause();
                pauseBtn.id = 'playBtn'; 
                playBtn.className = '';
                playBtn.classList.add('fa', 'fa-play');
            }
            else {
                alert('Choose any song to play')
            }
        })
        return i;        
    }

    // Resets the lists
    function _reset() {
        audio.pause();
        audio.currentTime = 0;
        if(document.getElementById('pauseBtn')) pauseBtn.id = 'playBtn';
    }

    // Plays the song
    function _loadsong() {
        _reset();
        _checkPlayType()
        var clickedSong = songs[thisSong.id]
        audio.src = clickedSong.name + format;
        playBtn.className = '';
        playBtn.classList.add('fa', 'fa-pause');   
        playBtn.id = 'pauseBtn';
        audio.play();
    }

    // Adds a range that controls the position in the current time of the song
    function _timeline() {
        var range = document.createElement('input');
        range.setAttribute('type', 'range');
		range.setAttribute('min', 0);
		range.setAttribute('style', 'width: 70%;');
        range.value = 0;
        range.id = 'timeRange';
        range.addEventListener('mousedown', function(){
			audio.pause();
		});   
        range.addEventListener('mouseup', function(){
			audio.play();
		}); 
		range.addEventListener('change', function(){
			audio.currentTime = range.value;
		});  
           
        return range
    }

    // Updates the range to the current time
    function _updateRange() {
        audio.addEventListener('timeupdate', function(){
            document.getElementById('timeRange').value = audio.currentTime;
            document.getElementById('initialTime').innerHTML = 'Time ' + _toMinutes(audio.currentTime);  
            document.getElementById('totalTime').innerHTML = 'Duration ' +  _toMinutes(audio.duration);          
        })
    }

    // Controls the volume of the song
    function _volume() {
        var range = document.createElement('input');
        range.setAttribute('type', 'range');
		range.setAttribute('min', 0);
		range.setAttribute('max', 100);        
        range.setAttribute('value', audio.volume * 100);
		range.setAttribute('style', 'width: 5%;');
        range.classList.add('volume-range');
		range.addEventListener('change', function(){
            if(range.value > 0) audio.volume = range.value/100
            else audio.volume = 0;
		}); 
        return range        
    }

    // Highlight Song
    function loadSong(thisSong) {
        _loadsong();
        _songCurrentTime();
        _updateRange();
        parentRow = thisSong.parentNode.className;
        var tr = document.getElementsByTagName('tr');
        if(thisSong.parentNode.parentNode.id == 'tHeader') {
            return false;
        }
        for(var i = 0; i < tr.length; i++) {
            if(tr[i].classList == 'selected') {
                _reset();
                tr[i].classList.remove("selected");
            }
        }

        if(parentRow != 'selected') {
            thisSong.parentNode.className = 'selected';                  
        }        
    }

    // Shows the duration and the current time of the song
    function _songCurrentTime() {
        var initialTime = document.createElement('span');
        var totalTime = document.createElement('span');

        initialTime.id = 'initialTime';
        totalTime.id = 'totalTime';

        return [initialTime, totalTime];
    }

    // Switch format to minutes
    function _toMinutes(time) {		
		time /= 60;
		time = time.toFixed(2);
		time += '';
		return time.replace('.', ':')
	}

    // Check type
    function _checkPlayType() {
		var canPlay = {
			mp3: audio.canPlayType('audio/mp3'),
			ogg: audio.canPlayType('audio/ogg'),
			wav: audio.canPlayType('audio/wav')
		};
		
		if(canPlay.mp3 !== '') return format = '.mp3';
		if(canPlay.ogg !== '') return format = '.ogg';
		if(canPlay.wav !== '') return format = '.wav';
	}

    // Goes to the next song
    function _next() {    
        var i = document.createElement('i');
        i.classList.add('fa', 'fa-forward');
        i.setAttribute('aria-hidden', 'true');
        i.style.fontSize ='44px';
        i.addEventListener('click', function() {  
            var nextSong = parseInt(thisSong.id)+1;
            console.log(thisSong);
            audio.src = songs[thisSong.id].name + format;
            audio.play();
            _elementCount('next'); 
            console.log(thisSong);
                                                       
        })
        return i;
    }

    // Goes to the last song
    function _back() {     
        var i = document.createElement('i');
        i.classList.add('fa', 'fa-backward');
        i.setAttribute('aria-hidden', 'true');
        i.style.fontSize ='44px';
        i.addEventListener('click', function(){
            var nextSong = parseInt(thisSong.id)-1; 
            console.log(previous);
            audio.src = songs[thisSong.id].name + format;
            audio.play();
            _elementCount('previous');            
        })
        return i;
    }

    // Takes the next or the last element
    function _elementCount(current) {
        var songCount = document.getElementById('listSongs').getElementsByTagName('tr');
        if(current == 'next') {
            for(var i = 0; i < songCount.length; i++) {
                if(songCount[i] == thisSong) {
                    thisSong = songCount[i + 1];
                    console.log(thisSong)
                }
            }
        }
        if(current == 'previous') {
            for(var i = 0; i < songCount.length; i++) {
                if(songCount[i] == thisSong) {
                    thisSong = songCount[i - 1];
                }
            }
        }
    }
    window.Player = {
        currentSong: function(event){
            thisSong = event.target.parentNode;
        },
        loadSong: function(thisSong){
            loadSong(thisSong);
        },
    }
}(window));

document.getElementById('listSongs').addEventListener('click', function(event) {
    Player.currentSong(event);
    Player.loadSong(event.target)
});