(function () {
  if (!window.GIDEO) {
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
    }, 100);

    listen("click", document.querySelector('body'), function (e) {
      if (e.target.className === "gideo-mute") {
        var gideo = e.target.nextSibling.player;

        if (!gideo) {
          return;
        } else if (gideo.muted()) {
          try { gideo.currentTime(0); }
          catch (e) { /* Random error with the flash fallback */ }

          gideo.muted(false);
          e.target.style.background = "url('/on.png')";
        } else {
          gideo.muted(true);
          e.target.style.background = "url('/off.png')";
        }
      }
    });
  }

  // Force mute in browsers with flash fallback
  var embeds = document.querySelectorAll('.gideo'),
    mute = function () { this.muted(true); }

  for (var i = 0; i < embeds.length; i++) {
    if (!embeds[i].player) {
      videojs(embeds[i]).ready(mute);
    }
  }
})();
