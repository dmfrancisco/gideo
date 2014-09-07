/*global videojs */

(function () {
  window._gideo = window._gideo || {};

  if (!window._gideo.included) {
    window._gideo.included = true;

    var Helper = (function () {
      var self = {};

      self.listen = function (eventName, elem, func) {
        if (elem.addEventListener) {
          elem.addEventListener(eventName, func, false);
        } else if (elem.attachEvent) {
          elem.attachEvent("on" + eventName, func);
        }
      };

      self.isVisible = function (elem) {
        var rect = elem.getBoundingClientRect();

        return (
          rect.top > -elem.offsetHeight &&
          rect.top < (window.innerHeight || document.documentElement.clientHeight)
        );
      };

      // Add new CSS rules (based on goo.gl/Ygvaqy)
      self.injectStyles = function (rules) {
        var div = document.createElement('div');
        div.innerHTML = '&shy;<style>' + rules + '</style>';
        document.body.appendChild(div.childNodes[1]);
      };

      // Class manipulation (from: openjs.com/scripts/dom/class_manipulation.php)
      self.hasClass = function (elem, className) {
        return elem.className.match(new RegExp('(\\s|^)'+ className +'(\\s|$)'));
      };

      self.addClass = function (elem, className) {
        if (!self.hasClass(elem, className)) {
          elem.className += " " + className;
        }
      };

      self.removeClass = function (elem, className) {
        if (self.hasClass(elem, className)) {
          var regex = new RegExp('(\\s|^)'+ className +'(\\s|$)');
          elem.className = elem.className.replace(regex, ' ');
        }
      };

      self.loadScript = function (url, callback) {
        var script = document.createElement('script');

        if (script.readyState) { // IE
          script.onreadystatechange = function () {
            if (script.readyState == 'loaded' || script.readyState == 'complete') {
              script.onreadystatechange = null;
              callback();
            }
          };
        } else { // Others
          script.onload = function () {
            callback();
          };
        }

        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
      };

      self.isMobile = function () {
        return navigator.userAgent.match(/(Android|iPod|iPhone|iPad)/);
      };

      return self;
    }());

    // Configurations
    window.gideoRoot = window.gideoRoot || "//dmfrancisco.github.io/gideo/";
    window.gideoPolyfill = window.gideoPolyfill || (window.gideoRoot + "mediaelement.min.js");
    window.gideoMode = window.gideoMode || (Helper.isMobile() ? "manual" : "autoplayer");
    window._gideo.helpers = Helper;

    var runAutoplayerMode = function () {
      window.setInterval(function () {
        var gideo, embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          gideo = embeds[i].player;

          if (!gideo) {
            continue;
          } else if (Helper.isVisible(embeds[i].parentNode)) {
            if (gideo.isPaused()) {
              try { gideo.setCurrentTime(0); }
              catch (e) { /* Random error with the flash fallback */ }
              gideo.play();
            }
          } else if (!gideo.isPaused()) {
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
          } else if (gideo.isMuted()) {
            gideo.setCurrentTime(0);
            gideo.setMuted(false);
            target.style.backgroundPosition = "0 -36px";
          } else {
            gideo.setMuted(true);
            target.style.backgroundPosition = "0 0";
          }
        } else if (target.className === "gideo-replay") {
          gideo = target.parentNode.querySelector('.gideo').player;
          if (gideo) { gideo.setCurrentTime(0); }
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
    };

    var runManualMode = function () {
      // This mode doesn't autoplay but still needs to pause.
      // This is not necessary for iOS since videos open in a new window.
      window.setInterval(function () {
        var gideo, embeds = document.querySelectorAll('.gideo');

        for (var i = 0; i < embeds.length; i++) {
          gideo = embeds[i].player;
          if (gideo && !Helper.isVisible(embeds[i].parentNode)) {
            gideo.pause();
            Helper.removeClass(embeds[i], "gideo--playing");
          }
        }
      }, 1000);

      Helper.listen("click", document.querySelector('body'), function (e) {
        var gideo, embed, target = e.target || e.srcElement;

        if (target.className === "gideo-play") {
          embed = target.parentNode.querySelector('.gideo');
          gideo = embed.player;

          if (gideo) {
            gideo.play();
            Helper.addClass(embed, "gideo--playing");
          }
        }
      });

      // Inject styles for the play button (for devices without autoplay)
      Helper.injectStyles(""
        + " .gideo-play {"
          + " position: absolute; z-index: 2;"
          + " width: 68px; height: 68px;"
          + " top: 50%; left: 50%; margin: -34px auto auto -34px;"
          + " background: url("+ window.gideoRoot +"sprites.png) -44px 0 }"
        + " .gideo--playing ~ .gideo-play {"
          + " display: none }");
    };

    switch (window.gideoMode) {
      case "autoplayer":
        runAutoplayerMode();
        break;

      case "manual":
        runManualMode();
    }
  }

  var beforeInit = function (domObject) {
    switch (window.gideoMode) {
      case "manual":
        // Create a play button
        var playButton = document.createElement("div");
        playButton.className = "gideo-play";
        domObject.parentNode.appendChild(playButton);
    }
  };

  var afterInit = function (media, domObject) {
    if (domObject) { domObject.player = media; }

    media.isMuted  = media.isMuted  || function() { return this.muted;  };
    media.isPaused = media.isPaused || function() { return this.paused; };

    // Loop (could be done using `loop` attr for HTML5 but not for flash)
    if (typeof MediaElement !== 'undefined') {
      media.addEventListener('ended', function (e) {
        media.setCurrentTime(0);
        media.play();
      }, false);
    }

    switch (window.gideoMode) {
      case "autoplayer":
        // Force mute (this is not done using the `muted` attribute in
        // order to work in browsers that require the flash fallback)
        media.setMuted(true);
    }
  };

  window.gideoInit = window.gideoInit || function (video, success) {
    new MediaElement(video, {
      success: success,
      pluginPath: window.gideoRoot,
      plugins: ['flash', 'vimeo']
    });
  };

  // Initialize all videos
  var initAll = function () {
    var embeds = document.querySelectorAll('.gideo');

    for (var i = 0; i < embeds.length; i++) {
      if (!embeds[i].loading) {
        embeds[i].loading = true;
        beforeInit(embeds[i]);
        window.gideoInit(embeds[i], afterInit);
      }
    }
  }

  if (typeof MediaElement === 'undefined') {
    window._gideo.helpers.loadScript(window.gideoPolyfill, initAll);
  } else {
    initAll();
  }
})();
