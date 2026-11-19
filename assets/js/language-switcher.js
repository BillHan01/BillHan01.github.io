(function () {
  "use strict";

  var supported = ["zh-CN", "zh-TW", "en", "de"];
  var fallback = "en";

  function normalizeLanguage(language) {
    if (!language) return null;
    var normalized = language.replace("_", "-").toLowerCase();
    if (normalized === "zh-tw" || normalized === "zh-hk" || normalized === "zh-hant") return "zh-TW";
    if (normalized.indexOf("zh") === 0) return "zh-CN";
    if (normalized.indexOf("de") === 0) return "de";
    if (normalized.indexOf("en") === 0) return "en";
    return null;
  }

  function initialLanguage() {
    var query = new URLSearchParams(window.location.search).get("lang");
    var stored;
    try { stored = window.localStorage.getItem("site-language"); } catch (error) { stored = null; }
    return normalizeLanguage(query) || normalizeLanguage(stored) || normalizeLanguage(navigator.language) || fallback;
  }

  function setLanguage(language, updateUrl) {
    if (supported.indexOf(language) === -1) language = fallback;

    document.documentElement.lang = language;
    document.documentElement.setAttribute("data-language", language);

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var translated = element.querySelector('[data-lang="' + language + '"]');
      if (!translated) return;
      element.querySelectorAll("[data-lang]").forEach(function (version) {
        version.hidden = version !== translated;
      });
    });

    document.querySelectorAll("[data-language-option]").forEach(function (option) {
      var active = option.getAttribute("data-language-option") === language;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var select = document.getElementById("language-select");
    if (select) select.value = language;

    // The CV has Chinese and English versions. Keep it in step with the
    // site-wide language picker: both Chinese locales use the Chinese CV,
    // while English and German use the English CV.
    if (document.querySelector("[data-cv-version]")) {
      setCvLanguage(language.indexOf("zh") === 0 ? "zh" : "en");
    }

    try { window.localStorage.setItem("site-language", language); } catch (error) {}

    if (updateUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", language);
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }

  function setCvLanguage(language) {
    if (language !== "zh" && language !== "en") language = "en";
    document.querySelectorAll("[data-cv-version]").forEach(function (version) {
      version.hidden = version.getAttribute("data-cv-version") !== language;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var select = document.getElementById("language-select");
    if (select) {
      select.addEventListener("change", function () { setLanguage(this.value, true); });
    }
    document.querySelectorAll("[data-language-option]").forEach(function (option) {
      option.addEventListener("click", function () {
        setLanguage(this.getAttribute("data-language-option"), true);
      });
    });
    var language = initialLanguage();
    setLanguage(language, false);

  });
})();
