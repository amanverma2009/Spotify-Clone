let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document.querySelector("#songslist ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img
          src="Assets/musical-sixteenth-note-svgrepo-com.svg"
          alt="Music Note"
          width="24"
          height="24"
        />
        <div class="songinfo">
          <div>${song.replaceAll("%20", " ")}</div>
        </div>
      </li>`;
  }
  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(
        e.querySelector(".songinfo").firstElementChild.innerHTML.trim()
      );
      play.src = "Assets/pause-svgrepo-com.svg";
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  currentSong.play();
  document.querySelector("#bottom .songinfo").innerHTML = track
    .replaceAll("%20", " ")
    .replaceAll(".mp3", "");
  document.querySelector("#songduration-start").innerHTML = "00:00";
  document.querySelector("#songduration-end").innerHTML = "00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cards");

  // Clear the card container before appending new cards
  cardContainer.innerHTML = "";

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      let card = document.createElement("div");
      card.classList.add("card-box");
      card.setAttribute("data-folder", folder);
      card.innerHTML = `
        <img
          src="/songs/${folder}/cover.jpg"
          alt="Playlist Folder Image"
          class="card-img"
        />
        <h3>${response.title}</h3>
        <p>${response.description}</p>
      `;

      card.addEventListener("click", async () => {
        await getSongs(`songs/${folder}`);
        playMusic(songs[0]);
        play.src = "Assets/pause-svgrepo-com.svg";
      });

      cardContainer.appendChild(card);
    }
  }
}

async function main() {
  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Assets/pause-svgrepo-com.svg";
    } else {
      currentSong.pause();
      play.src = "Assets/play-1001-svgrepo-com.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    if (!isNaN(currentSong.duration)) {
      const currentTimeMinutes = Math.floor(currentSong.currentTime / 60)
        .toString()
        .padStart(2, "0");
      const currentTimeSeconds = Math.floor(currentSong.currentTime % 60)
        .toString()
        .padStart(2, "0");
      const durationMinutes = Math.floor(currentSong.duration / 60)
        .toString()
        .padStart(2, "0");
      const durationSeconds = Math.floor(currentSong.duration % 60)
        .toString()
        .padStart(2, "0");

      document.querySelector(
        "#songduration-start"
      ).innerHTML = `${currentTimeMinutes}:${currentTimeSeconds}`;
      document.querySelector(
        "#songduration-end"
      ).innerHTML = `${durationMinutes}:${durationSeconds}`;
      document.querySelector("#circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    } else {
      document.querySelector("#songduration-start").innerHTML = "00:00";
      document.querySelector("#songduration-end").innerHTML = "00:00";
    }
  });

  currentSong.addEventListener("loadedmetadata", () => {
    if (!isNaN(currentSong.duration)) {
      const durationMinutes = Math.floor(currentSong.duration / 60)
        .toString()
        .padStart(2, "0");
      const durationSeconds = Math.floor(currentSong.duration % 60)
        .toString()
        .padStart(2, "0");
      document.querySelector("#songduration-start").innerHTML = `00:00`;
      document.querySelector(
        "#songduration-end"
      ).innerHTML = `${durationMinutes}:${durationSeconds}`;
    }
  });

  document.querySelector("#seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector("#circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector("#hamburger").addEventListener("click", () => {
    document.querySelector("#left").style.left = "0";
    document.querySelector("#right").style.display = "none";
  });

  document.querySelector("#close-icon").addEventListener("click", () => {
    document.querySelector("#left").style.left = "-100%";
    document.querySelector("#right").style.display = "block";
  });

  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector("#range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume-bar>img").src = document
          .querySelector(".volume-bar>img")
          .src.replace(
            "mute-volume-svgrepo-com.svg",
            "volume-max-svgrepo-com.svg"
          );
      } else {
        document.querySelector(".volume-bar>img").src = document
          .querySelector(".volume-bar>img")
          .src.replace(
            "volume-max-svgrepo-com.svg",
            "mute-volume-svgrepo-com.svg"
          );
      }
    });

  document.querySelector(".volume-bar>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume-max-svgrepo-com.svg")) {
      e.target.src = e.target.src.replace(
        "volume-max-svgrepo-com.svg",
        "mute-volume-svgrepo-com.svg"
      );
      currentSong.volume = 0;
      document
        .querySelector("#range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace(
        "mute-volume-svgrepo-com.svg",
        "volume-max-svgrepo-com.svg"
      );
      currentSong.volume = 0.5;
      document
        .querySelector("#range")
        .getElementsByTagName("input")[0].value = 50;
    }
  });
}
main();
