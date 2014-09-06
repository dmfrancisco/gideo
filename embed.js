/*global videojs */

(function () {
  if (!window.gideoIncluded) {
    window.gideoIncluded = true;

    var Helper = {
      listen: function (eventName, elem, func) {
        if (elem.addEventListener) {
          elem.addEventListener(eventName, func, false);
        } else if (elem.attachEvent) {
          elem.attachEvent("on" + eventName, func);
        }
      },

      isVisible: function (elem) {
        var rect = elem.getBoundingClientRect();

        return (
          rect.top > -elem.offsetHeight &&
          rect.top < (window.innerHeight || document.documentElement.clientHeight)
        );
      },

      // Add new CSS rules (based on goo.gl/Ygvaqy)
      injectStyles: function (rules) {
        var div = document.createElement('div');
        div.innerHTML = '&shy;<style>' + rules + '</style>';
        document.body.appendChild(div.childNodes[1]);
      },

      isMobile: function () {
        return navigator.userAgent.match(/(Android|iPod|iPhone|iPad)/);
      }
    }

    // Configurations
    window.gideoRoot = window.gideoRoot || "//dmfrancisco.github.io/gideo/";
    window.gideoMode = window.gideoMode || (Helper.isMobile() ? "manual" : "autoplayer");

    var runAutoplayerMode = function () {
      window.setInterval(function () {
        var gideo, embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          gideo = embeds[i].player;

          if (!gideo) {
            continue;
          } else if (Helper.isVisible(embeds[i].parentNode)) {
            if (gideo.paused()) {
              try { gideo.currentTime(0); }
              catch (e) { /* Random error with the flash fallback */ }
              gideo.play();
            }
          } else if (!gideo.paused()) {
            gideo.pause();
          }
        }
      }, 1000);

      Helper.listen("click", document.querySelector('body'), function (e) {
        var gideo, target = e.target || e.srcElement;

        if (target.className === "gideo-mute") {
          gideo = target.parentNode.querySelector('.gideo').player;

          if (!gideo) {
            return;
          } else if (gideo.muted()) {
            gideo.currentTime(0);
            gideo.muted(false);
            target.style.backgroundPosition = "0 -36px";
          } else {
            gideo.muted(true);
            target.style.backgroundPosition = "0 0";
          }
        } else if (target.className === "gideo-replay") {
          gideo = target.parentNode.querySelector('.gideo').player;
          if (gideo) { gideo.currentTime(0); }
        }
      });

      // Inject styles for controls
      Helper.injectStyles(""
        + " .gideo-mute, .gideo-replay {"
          + " position: absolute; z-index: 2;"
          + " width: 44px; height: 36px; left: 20px;"
          + " background: url("+ window.gideoRoot +"sprites.png);"
          + " cursor: pointer }"
        + " .gideo-mute { top: 20px }"
        + " .gideo-replay { bottom: 20px; background-position: 0 -72px }");
    }

    var runManualMode = function () {
      // This mode doesn't autoplay but still needs to pause.
      // This is not necessary for iOS since videos open in a new window.
      window.setInterval(function () {
        var gideo, embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          gideo = embeds[i].player;
          if (gideo && !Helper.isVisible(embeds[i].parentNode)) {
            gideo.pause();
          }
        }
      }, 1000);
    }

    switch(gideoMode) {
      case "autoplayer":
        runAutoplayerMode();
        break;
      case "manual":
        runManualMode();
    }

    // Setup path to flash fallback from Video.js
    videojs.options.flash.swf = window.gideoRoot + "video-js.swf";

    // Inject styles for the play button (for devices without autoplay)
    Helper.injectStyles(""
      + " .gideo .vjs-big-play-button {"
        + " position: absolute; z-index: 2;"
        + " width: 68px; height: 68px;"
        + " top: 50%; left: 50%; margin: -34px auto auto -34px;"
        + " background: url("+ window.gideoRoot +"sprites.png) -44px 0 }"
      + " .gideo.vjs-playing .vjs-big-play-button {"
        + " display: none }");
  }

  var onready = function () {
    // Force mute (this is not done using the `muted` attribute in
    // order to work in browsers that require the flash fallback)
    if (window.gideoMode === "autoplayer") {
      this.muted(true);
    }
  };

  window.gideoInit = window.gideoInit || function (video, success) {
    videojs(video).ready(success);
  };

  var embeds = document.querySelectorAll('.gideo');

  // Initialize all videos
  for (var i = 0; i < embeds.length; i++) {
    if (!embeds[i].player) {
      window.gideoInit(embeds[i], onready);
    }
  }
})();
