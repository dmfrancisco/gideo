(function () {
  window.gideoRoot = window.gideoRoot || (
    document.location.protocol + "//dmfrancisco.github.io/gideo/"
  );

  videojs.options.flash.swf = window.gideoRoot + "video-js.swf";


  function supportsAutoplay() {
    return !navigator.userAgent.match(/(iPod|iPhone|iPad)/);
  }

  if (!window.GIDEO && supportsAutoplay()) {
    window.GIDEO = true;

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
      if (e.target.className === "gideo-mute") {
        var gideo = e.target.nextSibling.player;

        if (!gideo) {
          return;
        } else if (gideo.muted()) {
          try { gideo.currentTime(0); }
          catch (e) { /* Random error with the flash fallback */ }

          gideo.muted(false);
          e.target.style.background = "url('"+ window.gideoRoot +"on.png')";
        } else {
          gideo.muted(true);
          e.target.style.background = "url('"+ window.gideoRoot +"off.png')";
        }
      }
    });
  }

  // Force mute in browsers with flash fallback
  var embeds = document.querySelectorAll('.gideo'),
    mute = function () { this.muted(supportsAutoplay()); }

  for (var i = 0; i < embeds.length; i++) {
    if (!embeds[i].player) {
      videojs(embeds[i]).ready(mute);
    }
  }
})();
