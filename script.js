console.log("JavaScript running...");
let currentSong = new Audio;
let songs;  // making songs global variable
let currFolder;

function formatSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    // Pad with leading zeros if needed
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let data = await fetch(`http://127.0.0.1:3000/${folder}`);
    let response = await data.text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    console.log(as);

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1].replaceAll("%20", " "));
            // split("/songs/")[1] karne se 2 mai split ho gaya, aik /songs/ se pehle aik baad wala, hum ne baad wala le lia. jo ke [1] hay.
        }
    }

    // show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="images/music.svg" alt="" height="18">
                            <div class="info">
                                <div>${song}</div>
                                <div class="div">Furqan</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener(("click"), (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

            // Closing of Left Div after clicking (playing) any Song
            document.querySelector(".left").style.left = "-120%";

        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    let play = document.querySelector("#play");
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg"
    }
    // currentSong.play();
    // play.src = "images/pause.svg"
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let data = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await data.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-Container");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.endsWith(".mp3")) {
            let folder = e.href.split("/").slice(-2, -1)[0];
            try {
                let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let response = await a.json();
                console.log(response);
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="images/playlogo.svg" height="65" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" height="140" alt="">
                        <h4>${response.title}</h4>
                        <p><h5>${response.description}</h5></p>
                    </div>`;
            } catch (err) {
                console.error(`info.json not found for folder: ${folder}`, err);
            }
        }
    }
    // Load the Playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);    // Play first song of album, when  Clicked
        })
    })
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/${folder}");
    console.log(songs);
    // playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();


    // Attach an event listener to play, next and previous
    let play = document.querySelector("#play");
    play.addEventListener(("click"), () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "images/play.svg"
        }
    })

    // Listen for timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatSecondsToMinutes(currentSong.currentTime)} / ${formatSecondsToMinutes(currentSong.duration)}`;

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event Listner to Seek Bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.offsetX, e.offsetY);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listner for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
    })

    // Add an event listner for closing of Hamburger
    document.querySelector(".close").addEventListener("click", () => {
        // document.querySelector(".left").style.display = "none";
        document.querySelector(".left").style.left = "-120%";
    });

    // Add an event listener for next song
    let next = document.querySelector("#next");
    next.addEventListener("click", () => {
        // currentSong.pause();
        console.log("next clicked");
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
        console.log(songs, index);

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event listener for previous song
    let previous = document.querySelector("#previous");
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));

        if (songs.length > 0 && index > 0) { // Check if not the first song
            playMusic(songs[index - 1]);
        } else if (songs.length > 0 && index === 0) {
            // If at the beginning, loop to the end (optional behavior)
            playMusic(songs[songs.length - 1]);
            // Or, if you don't want looping:
            // console.log("At the beginning of the playlist");
        }
    });

    // Add an event to Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, "Setting Volume to:", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // Add an event for mute
    document.querySelector(".volume img").addEventListener("click", (e) => {
        const img = document.querySelector(".volume img");  // always select the image explicitly
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;

        }
    })

    // let audio = new Audio(songs[0]);
    // // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime);
    // });
}

main();