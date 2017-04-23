(function(window){
    var audio = new Audio();
    var songs = '';
    var songList = [];
    var thisSong = -1;
    var format = '';
    var nextSong = '';
    var previousSong = '';    
    var errorStop = null;
    var playerControls = document.getElementById('player-controls');    
    var saveStorage = null;

    (function(){
        _initStorage();
    })
    
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
                    _init();
                } else {
                    alert('There was a problem with the request.');
                }
            }
        }       
    }());

    // Initialize the audio player
    function _init() {
        _saveInStorage();
        _initStorage();
        _composeSongList();        
        _renderList();
        _checkPlayType();
        playerControls.appendChild(_play());    
        playerControls.appendChild(_timeline());  
        playerControls.appendChild(_volume()); 
        playerControls.appendChild(_songCurrentTime()[0]);           
        playerControls.appendChild(_songCurrentTime()[1]);
        document.getElementById('initialTime').innerHTML = '0:00';
        document.getElementById('totalTime').innerHTML = '0:00';  
        playerControls.appendChild(_back()); 
        playerControls.appendChild(_next());  
        _updateRange();    
        songEnded();                 
    }

    /* Compose songList object
    This the object for the display of the list */
    function _composeSongList() {
        for(var i = 0; i < 2; i++) {
            songList.push([songs[i].name,songs[i].artist]);
        }
    }

    // Creates the list based in the json.
    function _renderList() {
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

    // Load the song and starts the functionality
    function initSong(thisSong) {
        _playSong();
        _highlightSong(thisSong, true);         
    }
    
    // Plays the song
    function _playSong() {
        _reset();
        var clickedSong = songs[thisSong.id]
        audio.src = clickedSong.src + format;
        playBtn.className = '';
        playBtn.classList.add('fa', 'fa-pause');   
        playBtn.id = 'pauseBtn';
        audio.play();
    }

    // Initialize the play and the pause button and his function
    function _play() {
        var i = document.createElement('i');
        i.classList.add('fa', 'fa-play');
        i.setAttribute('aria-hidden', 'true');
        i.style.fontSize ='44px';
        i.id = 'playBtn';
        i.addEventListener('click', function(event) {
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
        if(document.getElementById('pauseBtn')) pauseBtn.id = 'playBtn';
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

    // Highlight the actual song
    function _highlightSong(thisSong, clicked) {
        parentRow = thisSong.className;
        var container = document.getElementById('listSongs');
        var tr = container.getElementsByTagName('tr');
        if(thisSong.parentNode.parentNode.id == 'tHeader') {
            return false;
        }
        for(var i = 0; i < tr.length; i++) {
            if(tr[i].classList == 'selected') {
                console.log(tr[i])
                tr[i].classList.remove("selected");
                parentRow = thisSong.className;
            }
        }

        if(parentRow != 'selected' && clicked == true) {
            thisSong.parentNode.className = 'selected';                  
        }
        if(parentRow != 'selected' && clicked == false) {
            thisSong.className = 'selected';                  
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
            _elementCount('next');                                               
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
            _elementCount('previous');            
        })
        return i;
    }

    // Takes the next or the last element
    function _elementCount(current) {
        if(current == 'next') {
            nextSong++;
            _validSong();
            if(errorStop) {
                nextSong-- 
                return
            }           
            audio.src = songs[nextSong].src + format;
            audio.play();
            thisSong = document.getElementById(nextSong);
            _highlightSong(thisSong, false);         
        }
        if(current == 'previous') {
            nextSong--;
            _validSong();
            if(errorStop) {
                nextSong++ 
                return
            }            
            audio.src = songs[nextSong].src + format;
            audio.play();
            thisSong = document.getElementById(nextSong);            
            _highlightSong(thisSong, false);         
        }
    }

    // Validates the current song
    function _validSong() {
        errorStop = false;
        if(nextSong === -1 || nextSong > songs.length-1) {
            document.body.classList.add('song-error');
            setTimeout(function() {
                document.body.classList.remove('song-error');    
            }, 1000)
            errorStop = true;            
        }
    }

    // Goes to the next song if exist wheh the song ends
    function songEnded() {
        audio.addEventListener('ended', function(){
            _elementCount('next');
        })
    };

    // Local Storage
    function _localStorage() {
        if (typeof(Storage) !== "undefined") {
            // Store
            localStorage.setItem("saveStorage", saveStorage);
            var anotherTest = localStorage.getItem("saveStorage", saveStorage);
            console.log(anotherTest);
            localStorage.setItem("thisSong", thisSong);
            localStorage.setItem("audio", audio);
            localStorage.setItem("songs", songs);
            localStorage.setItem("songList", songList);
            localStorage.setItem("format", format);
            localStorage.setItem("nextSong", nextSong);
            localStorage.setItem("previousSong", previousSong);
        } else {
            alert('Im sorry, your browser doesnt support local storage')
        }
    }

    // Saves in the local storage every second
    function _saveInStorage() {
        setInterval(function(){
            _localStorage()
        }, 1000)
    }

    // Inits the local storage
    function _initStorage() {
        if(saveStorage) {
            console.log('hello')    
            document.getElementById('listSongs').innerHTML = localStorage.getItem("songs");                            
            saveStorage = localStorage.getItem("saveStorage");
            thisSong = localStorage.getItem("thisSong");
            audio = localStorage.getItem("audio");
            songs = localStorage.getItem("songs");
            songList = localStorage.getItem("songList");
            format = localStorage.getItem("format");
            nextSong = localStorage.getItem("nextSong");
            previousSong = localStorage.getItem("previousSong");
            initSong(thisSong);
        }
    }

    // Saves the local storage
    window.Player = {
        initPlayer: function(event){
            saveStorage = true;
            thisSong = event.target.parentNode;
            nextSong = parseInt(thisSong.id);
            previousSong = parseInt(thisSong.id);
            initSong(event.target);
        }
    }
    
}(window));

document.getElementById('listSongs').addEventListener('click', function(event) {
    Player.initPlayer(event)
});