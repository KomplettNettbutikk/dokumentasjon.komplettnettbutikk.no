(() => {
  // <stdin>
  (function() {
    var STORAGE_KEY = "kn_doc_panel";
    var LAYOUT_VALUE = "panel";
    var PANEL_MESSAGE_TYPE = "kn-doc-embed-nav";
    var PANEL_STATE_MESSAGE_TYPE = "kn-doc-embed-nav-state";
    function truthyParam(value) {
      if (value === null) {
        return false;
      }
      var normalized = String(value).toLowerCase();
      if (normalized === "0" || normalized === "false" || normalized === "no") {
        return false;
      }
      return true;
    }
    function isInIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    }
    function isPanelFromUrl() {
      try {
        return new URLSearchParams(window.location.search).get("layout") === LAYOUT_VALUE;
      } catch (e) {
        return false;
      }
    }
    function isPanelFromStorage() {
      try {
        return sessionStorage.getItem(STORAGE_KEY) === "1";
      } catch (e) {
        return false;
      }
    }
    function persistPanelMode() {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (e) {
      }
    }
    function isPanelMode() {
      if (isPanelFromUrl()) {
        persistPanelMode();
        return true;
      }
      if (isPanelFromStorage()) {
        try {
          var params = new URLSearchParams(window.location.search);
          if (truthyParam(params.get("embed"))) {
            return false;
          }
        } catch (e) {
        }
        return true;
      }
      return false;
    }
    function isSidebarVisible() {
      try {
        return new URLSearchParams(window.location.search).get("sidebar") === "1";
      } catch (e) {
        return false;
      }
    }
    function notifyParentNavState(visible) {
      if (!isInIframe()) {
        return;
      }
      try {
        window.parent.postMessage({
          type: PANEL_STATE_MESSAGE_TYPE,
          visible: !!visible
        }, "*");
      } catch (e) {
      }
    }
    function getPanelNav() {
      return document.getElementById("doc-panel-nav");
    }
    function setNavVisible(visible) {
      var nextVisible = !!visible;
      document.documentElement.classList.toggle("doc-panel-nav-visible", nextVisible);
      var nav = getPanelNav();
      if (nav) {
        nav.setAttribute("aria-hidden", nextVisible ? "false" : "true");
      }
      notifyParentNavState(nextVisible);
    }
    function isHomePage() {
      try {
        var path = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
        return path === "";
      } catch (e) {
        return false;
      }
    }
    function applyPanelClasses() {
      document.documentElement.classList.add("doc-panel");
      if (isHomePage()) {
        document.documentElement.classList.add("doc-panel-home");
        var nav = getPanelNav();
        if (nav) {
          nav.setAttribute("aria-hidden", "false");
        }
        return;
      }
      setNavVisible(isSidebarVisible());
    }
    function isNavigationLink(link) {
      if (!link) {
        return false;
      }
      var href = link.getAttribute("href");
      if (!href || href === "#" || href.charAt(0) === "#") {
        return false;
      }
      return true;
    }
    function preservePanelOnLinks() {
      document.addEventListener("click", function(event) {
        var link = event.target.closest("a[href]");
        if (!link || link.target === "_blank" || link.hasAttribute("download")) {
          return;
        }
        try {
          var url = new URL(link.href, window.location.origin);
          if (url.origin !== window.location.origin) {
            return;
          }
          url.searchParams.set("layout", LAYOUT_VALUE);
          url.searchParams.delete("embed");
          url.searchParams.delete("topbar");
          url.searchParams.delete("sidebar");
          link.href = url.toString();
        } catch (e) {
        }
      }, true);
    }
    function bindNavAutoClose() {
      document.addEventListener("click", function(event) {
        var link = event.target.closest("#doc-panel-nav a[href]");
        if (!isNavigationLink(link)) {
          return;
        }
        if (document.documentElement.classList.contains("doc-panel-home")) {
          return;
        }
        if (link.closest(".doc-panel-category__link")) {
          return;
        }
        setNavVisible(false);
      }, true);
    }
    function bindOverlayClose() {
      var overlay = document.getElementById("doc-panel-overlay");
      if (!overlay) {
        return;
      }
      overlay.addEventListener("click", function(event) {
        event.preventDefault();
        setNavVisible(false);
      });
    }
    function bindPanelMessages() {
      window.addEventListener("message", function(event) {
        var data = event.data;
        if (!data || data.type !== PANEL_MESSAGE_TYPE) {
          return;
        }
        if (!document.documentElement.classList.contains("doc-panel")) {
          return;
        }
        setNavVisible(!!data.visible);
      });
    }
    function bindPanelSearch() {
      if (typeof autoComplete === "undefined" || typeof search !== "function") {
        return;
      }
      var input = document.getElementById("search-by-panel");
      if (!input) {
        return;
      }
      new autoComplete({
        selector: input,
        minChars: 2,
        delay: 100,
        source: function(term, response) {
          response(search(term));
        },
        renderItem: function(item, term) {
          var numContextWords = 2;
          var text = item.content.match(
            "(?:\\s?(?:[\\w]+)\\s?){0," + numContextWords + "}" + term + "(?:\\s?(?:[\\w]+)\\s?){0," + numContextWords + "}"
          );
          item.context = text;
          return '<div class="autocomplete-suggestion" data-term="' + term + '" data-title="' + item.title + '" data-uri="' + item.uri + '" data-context="' + (item.context || "") + '">\xBB ' + item.title + '<div class="context">' + (item.context || "") + "</div></div>";
        },
        onSelect: function(e, term, item) {
          location.href = item.getAttribute("data-uri");
        },
        menuClass: "doc-panel-suggestions"
      });
    }
    function bindSectionTreeToggle() {
      if (typeof jQuery === "undefined") {
        return;
      }
      jQuery(function($) {
        $("#doc-panel-nav").on("click", ".dd-item.isParent > a", function(event) {
          var $item = $(this).parent();
          if ($item.hasClass("parent")) {
            event.preventDefault();
            $item.toggleClass("parent");
            return false;
          }
        });
      });
    }
    if (!isPanelMode()) {
      return;
    }
    applyPanelClasses();
    preservePanelOnLinks();
    bindNavAutoClose();
    bindOverlayClose();
    bindPanelMessages();
    bindSectionTreeToggle();
    if (typeof jQuery !== "undefined") {
      jQuery(bindPanelSearch);
    } else {
      document.addEventListener("DOMContentLoaded", bindPanelSearch);
    }
  })();
})();
