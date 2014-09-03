/*global videojs */
(function () {
  var isMobile = function () {
    return navigator.userAgent.match(/(Android|iPod|iPhone|iPad)/);
  };

  if (!window.GIDEO) {
    window.GIDEO = true;

    window.gideoRoot = window.gideoRoot || (
      document.location.protocol + "//dmfrancisco.github.io/gideo/"
    );

    videojs.options.flash.swf = window.gideoRoot + "video-js.swf";

    var listen = function (eventName, elem, func) {
      if (elem.addEventListener) {
        elem.addEventListener(eventName, func, false);
      } else if (elem.attachEvent) {
        elem.attachEvent("on" + eventName, func);
      }
    };

    var isVisible = function (elem) {
      var rect = elem.getBoundingClientRect();

      return (
        rect.top > -elem.offsetHeight &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight)
      );
    };

    // Add new CSS rules (based on goo.gl/Ygvaqy)
    var injectStyles = function (rules) {
      var div = document.createElement('div');
      div.innerHTML = '&shy;<style>' + rules + '</style>';
      document.body.appendChild(div.childNodes[1]);
    };

    if (!isMobile()) {
      window.setInterval(function () {
        var gideo, embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          gideo = embeds[i].player;

          if (!gideo) {
            continue;
          } else if (isVisible(embeds[i])) {
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

      listen("click", document.querySelector('body'), function (e) {
        var gideo, target = e.target || e.srcElement;

        if (target.className === "gideo-mute") {
          gideo = target.nextSibling.player;

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
          gideo = target.previousSibling.player;
          if (gideo) { gideo.currentTime(0); }
        }
      });

      // Inject styles for controls
      injectStyles(""
        + " .gideo-mute, .gideo-replay {"
          + " position: absolute; z-index: 2;"
          + " width: 44px; height: 36px; left: 20px;"
          + " background: url("+ window.gideoRoot +"sprites.png);"
          + " cursor: pointer }"
        + " .gideo-mute { top: 20px }"
        + " .gideo-replay { bottom: 20px; background-position: 0 -72px }");

    } else {
      // We don't autoplay (in mobile devices) but we still need to pause.
      // This is not necessary for iOS since videos open in a new window.
      window.setInterval(function () {
        var gideo, embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          gideo = embeds[i].player;
          if (gideo && !isVisible(embeds[i])) { gideo.pause(); }
        }
      }, 1000);
    }

    // Inject styles for the play button (for devices without autoplay)
    injectStyles(""
      + " .gideo .vjs-big-play-button {"
        + " position: absolute; z-index: 2;"
        + " width: 68px; height: 68px;"
        + " top: 50%; left: 50%; margin: -34px auto auto -34px;"
        + " background: url("+ window.gideoRoot +"sprites.png) -44px 0 }"
      + " .gideo.vjs-playing .vjs-big-play-button {"
        + " display: none }");
  }

  var embeds = document.querySelectorAll('.gideo');

  // Force mute (this is not done using the `muted` attribute in
  // order to work in browsers that require the flash fallback)
  var mute = function () {
    this.muted(!isMobile());
  };

  // Initialize all videos
  for (var i = 0; i < embeds.length; i++) {
    if (!embeds[i].player) {
      videojs(embeds[i]).ready(mute);
    }
  }
})();
