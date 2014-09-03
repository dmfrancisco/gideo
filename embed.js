(function () {
  if (!window.GIDEO) {
    window.GIDEO = true;

    window.gideoRoot = window.gideoRoot || (
      document.location.protocol + "//dmfrancisco.github.io/gideo/"
    );

    videojs.options.flash.swf = window.gideoRoot + "video-js.swf";

    function isMobile() {
      return navigator.userAgent.match(/(Android|iPod|iPhone|iPad)/);
    }

    function listen(eventName, elem, func) {
      if (elem.addEventListener) {
        elem.addEventListener(eventName, func, false);
      }
      else if (elem.attachEvent) {
        elem.attachEvent("on" + eventName, func);
      }
    }

    function isVisible(elem) {
      var rect = elem.getBoundingClientRect();

      return (
        rect.top > -elem.offsetHeight &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight)
      );
    }

    // Add new CSS rules (based on goo.gl/Ygvaqy)
    function injectStyles(rules) {
      var div = document.createElement('div');
      div.innerHTML = '&shy;<style>' + rules + '</style>';
      document.body.appendChild(div.childNodes[1]);
    }

    if (!isMobile()) {
      window.setInterval(function () {
        var embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          var gideo = embeds[i].player;

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
        var target = e.target ? e.target : e.srcElement;

        if (target.className === "gideo-mute") {
          var gideo = target.nextSibling.player;

          if (!gideo) {
            return;
          } else if (gideo.muted()) {
            try { gideo.currentTime(0); }
            catch (e) { /* Random error with the flash fallback */ }

            gideo.muted(false);
            target.style.background = "url('"+ window.gideoRoot +"on.png')";
          } else {
            gideo.muted(true);
            target.style.background = "url('"+ window.gideoRoot +"off.png')";
          }
        }
      });

      // Inject styles for the mute button
      injectStyles(""
        + " .gideo-mute {"
          + " position: absolute; z-index: 2;"
          + " top: 20px; left: 20px;"
          + " width: 44px; height: 36px;"
          + " background: url('"+ window.gideoRoot +"off.png');"
          + " cursor: pointer }");
    }

    var embeds = document.querySelectorAll('.gideo');

    // Force mute (this is not done using the `muted` attribute in
    // order to work in browsers that require the flash fallback)
    function mute() {
      this.muted(!isMobile());
    }

    // Initialize all videos
    for (var i = 0; i < embeds.length; i++) {
      if (!embeds[i].player) {
        videojs(embeds[i]).ready(mute);
      }
    }

    // Inject styles for the play button (for devices without autoplay)
    injectStyles(""
      + " .gideo .vjs-big-play-button {"
        + " position: absolute; z-index: 2;"
        + " width: 68px; height: 68px;"
        + " top: 50%; left: 50%; margin: -34px auto auto -34px;"
        + " background: url('"+ window.gideoRoot +"play.png') }"
      + " .gideo.vjs-has-started .vjs-big-play-button {"
        + " display: none }");
  }
})();
