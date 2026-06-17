(() => {
  // <stdin>
  (function() {
    var STORAGE_KEY = "kn_doc_embed";
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
    function applyEmbedClasses() {
      var root = document.documentElement;
      root.classList.add("doc-embed");
      if (isSidebarVisible()) {
        root.classList.add("doc-embed-nav-visible");
      } else {
        root.classList.remove("doc-embed-nav-visible");
      }
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
          if (document.documentElement.classList.contains("doc-embed-nav-visible")) {
            url.searchParams.set("sidebar", "1");
          } else {
            url.searchParams.delete("sidebar");
          }
          link.href = url.toString();
        } catch (e) {
        }
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
          document.documentElement.classList.toggle("doc-embed-nav-visible");
          return false;
        });
        $("#overlay").off("click.docEmbed").on("click.docEmbed", function(event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          document.documentElement.classList.remove("doc-embed-nav-visible");
          return false;
        });
      });
    }
    if (!isEmbedMode()) {
      return;
    }
    applyEmbedClasses();
    preserveEmbedOnLinks();
    bindEmbedSidebarToggle();
  })();
})();
