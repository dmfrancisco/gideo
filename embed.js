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
      var gideo = embeds[i];

      if (isVisible(gideo)) {
        if (gideo.paused === true) {
          try { gideo.currentTime = 0 }
          catch (e) { /* Not loaded yet */ }
          gideo.play();
        }
      } else if (!embeds[i].paused) {
        gideo.pause();
      }
    }
  }, 100);

  listen("click", document.querySelector('body'), function (e) {
    if (e.target.className === "gideo-mute") {
      var gideo = e.target.nextSibling;

      if (gideo.muted === true) {
        gideo.muted = false;
        try { gideo.currentTime = 0 }
        catch (e) { /* Not loaded yet */ }
        e.target.style.background = "url('/on.png')";
      } else {
        gideo.muted = true;
        e.target.style.background = "url('/off.png')";
      }
    }
  });
}
