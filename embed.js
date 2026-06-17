(() => {
  // <stdin>
  (function() {
    var STORAGE_KEY = "kn_doc_embed";
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
    function isEmbedFromUrl() {
      try {
        return truthyParam(new URLSearchParams(window.location.search).get("embed"));
      } catch (e) {
        return false;
      }
    }
    function isEmbedFromStorage() {
      try {
        return sessionStorage.getItem(STORAGE_KEY) === "1";
      } catch (e) {
        return false;
      }
    }
    function persistEmbedMode() {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (e) {
      }
    }
    function isEmbedMode() {
      if (isEmbedFromUrl() || isInIframe()) {
        persistEmbedMode();
        return true;
      }
      if (isEmbedFromStorage()) {
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
    function isTopbarHidden() {
      try {
        var topbar = new URLSearchParams(window.location.search).get("topbar");
        if (topbar === null) {
          return true;
        }
        return !truthyParam(topbar);
      } catch (e) {
        return true;
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
    function setNavVisible(visible) {
      var nextVisible = !!visible;
      document.documentElement.classList.toggle("doc-embed-nav-visible", nextVisible);
      notifyParentNavState(nextVisible);
    }
    function applyEmbedClasses() {
      var root = document.documentElement;
      root.classList.add("doc-embed");
      if (isTopbarHidden()) {
        root.classList.add("doc-embed-no-topbar");
      } else {
        root.classList.remove("doc-embed-no-topbar");
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
    function preserveEmbedOnLinks() {
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
          if (!truthyParam(url.searchParams.get("embed"))) {
            url.searchParams.set("embed", "1");
          }
          url.searchParams.delete("sidebar");
          if (document.documentElement.classList.contains("doc-embed-no-topbar")) {
            url.searchParams.set("topbar", "0");
          } else {
            url.searchParams.delete("topbar");
          }
          link.href = url.toString();
        } catch (e) {
        }
      }, true);
    }
    function bindNavAutoClose() {
      document.addEventListener("click", function(event) {
        var link = event.target.closest("#sidebar a[href]");
        if (!isNavigationLink(link)) {
          return;
        }
        setNavVisible(false);
      }, true);
    }
    function bindEmbedSidebarToggle() {
      if (typeof jQuery === "undefined") {
        return;
      }
      jQuery(function($) {
        $("[data-sidebar-toggle]").off("click.docEmbed").on("click.docEmbed", function(event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setNavVisible(!document.documentElement.classList.contains("doc-embed-nav-visible"));
          return false;
        });
        $("#overlay").off("click.docEmbed").on("click.docEmbed", function(event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setNavVisible(false);
          return false;
        });
      });
    }
    function bindPanelMessages() {
      window.addEventListener("message", function(event) {
        var data = event.data;
        if (!data || data.type !== PANEL_MESSAGE_TYPE) {
          return;
        }
        if (!document.documentElement.classList.contains("doc-embed")) {
          return;
        }
        setNavVisible(!!data.visible);
      });
    }
    if (!isEmbedMode()) {
      return;
    }
    applyEmbedClasses();
    preserveEmbedOnLinks();
    bindNavAutoClose();
    bindEmbedSidebarToggle();
    bindPanelMessages();
  })();
})();
