/* =============================================================
   Umeed Pakistan Foundation — Frontend Interactions
   Vanilla JavaScript with multi-page navigation, dropdowns,
   filters, animated counters, progress bars, validation & toasts.
   ============================================================= */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function formatPKR(value) {
    return "Rs. " + Number(value).toLocaleString("en-PK");
  }

  /* ---------- Toast Notifications ---------- */
  function showToast(title, message, isError) {
    var wrap = $("#toastWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "toastWrap";
      wrap.className = "toast-wrap";
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    var toast = document.createElement("div");
    toast.className = "toast" + (isError ? " error" : "");
    toast.setAttribute("role", isError ? "alert" : "status");
    toast.innerHTML = "<strong></strong><span></span>";
    toast.querySelector("strong").textContent = title;
    toast.querySelector("span").textContent = message;
    wrap.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("hide");
      setTimeout(function () { toast.remove(); }, 320);
    }, 4500);
  }

  /* ---------- Navbar & Dropdowns ---------- */
  function initNavbar() {
    var header = $("#siteHeader");
    var nav = $("#siteNav");
    var toggle = $("#menuToggle");
    var dropdownItems = $$(".nav-item.has-dropdown");

    // Mobile hamburger toggle
    if (toggle && nav) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = nav.classList.toggle("open");
        toggle.classList.toggle("open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      });

      // Close menu if clicked outside
      document.addEventListener("click", function (e) {
        if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
          nav.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Dropdown toggles for mobile & keyboard
    dropdownItems.forEach(function (item) {
      var btn = $(".dropdown-toggle", item);
      var dropdown = $(".nav-dropdown, .nav-dropdown-mega", item);

      if (btn && dropdown) {
        btn.addEventListener("click", function (e) {
          // If on mobile/small screen (under 960px), toggle the dropdown accordion
          if (window.innerWidth <= 960) {
            e.preventDefault();
            e.stopPropagation();
            var isMobileOpen = dropdown.classList.toggle("mobile-open");
            item.classList.toggle("is-open", isMobileOpen);
            btn.setAttribute("aria-expanded", isMobileOpen ? "true" : "false");
          }
        });
      }
    });

    // Close mobile nav when clicking a dropdown link (unless it's an on-page filter toggle)
    $$(".dropdown-link, .nav-cta-mobile a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 960 && nav) {
          nav.classList.remove("open");
          if (toggle) {
            toggle.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
          }
        }
      });
    });

    // Mark current active nav item based on pathname
    var currentPath = window.location.pathname.split("/").pop() || "index.html";
    if (currentPath === "") currentPath = "index.html";

    $$(".nav-item", nav).forEach(function (item) {
      var directLink = item.querySelector(":scope > a.nav-link") || item.querySelector("a.nav-link");
      if (directLink) {
        var href = directLink.getAttribute("href");
        if (href === currentPath || (currentPath === "index.html" && href === "./")) {
          directLink.classList.add("active");
        }
      }
      // Check links inside dropdown
      var sublinks = $$(".dropdown-link", item);
      sublinks.forEach(function (sub) {
        var subHref = sub.getAttribute("href") || "";
        var pagePart = subHref.split("#")[0];
        if (pagePart === currentPath) {
          var parentBtn = item.querySelector(":scope > .nav-link") || item.querySelector(".dropdown-toggle") || item.querySelector(".nav-link");
          if (parentBtn) parentBtn.classList.add("active");
        }
      });
    });

    // Header scroll background effect
    function onScroll() {
      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 15);
      }
      var toTop = $("#toTop");
      if (toTop) {
        toTop.classList.toggle("show", window.scrollY > 400);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Animated Statistics Counters ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1600;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-PK");
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var grid = $("#statsGrid");
    if (!grid) return;
    var numbers = $$(".stat-num", grid);
    if (!("IntersectionObserver" in window)) {
      numbers.forEach(animateCounter);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          numbers.forEach(animateCounter);
          observer.disconnect();
        }
      });
    }, { threshold: 0.25 });
    observer.observe(grid);
  }

  /* ---------- Project Progress Bars ---------- */
  function initProgressBars() {
    var cards = $$(".project-card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      var raised = Number(card.getAttribute("data-raised")) || 0;
      var goal = Number(card.getAttribute("data-goal")) || 1;
      var percent = Math.min(Math.round((raised / goal) * 100), 100);

      var raisedEl = $(".raised", card);
      var goalEl = $(".goal", card);
      var percentEl = $(".percent", card);
      if (raisedEl) raisedEl.textContent = formatPKR(raised);
      if (goalEl) goalEl.textContent = formatPKR(goal);
      if (percentEl) percentEl.textContent = "(" + percent + "%)";

      var track = $(".progress", card);
      var bar = $(".progress-bar", card);
      if (track) track.setAttribute("aria-valuenow", String(percent));

      if (bar) {
        if ("IntersectionObserver" in window) {
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                bar.style.width = percent + "%";
                observer.disconnect();
              }
            });
          }, { threshold: 0.2 });
          observer.observe(track || card);
        } else {
          bar.style.width = percent + "%";
        }
      }
    });
  }

  /* ---------- Donation Amount Selection ---------- */
  function initDonationAmounts() {
    var grid = $("#amountGrid");
    var amountInput = $("#donationAmount");
    if (!grid || !amountInput) return;

    var buttons = $$(".amount-btn", grid);

    function selectAmount(value, triggerFocus) {
      buttons.forEach(function (b) { b.classList.remove("is-active"); });

      if (value === "custom" || value === "" || value === null) {
        var customBtn = grid.querySelector('[data-amount="custom"]');
        if (customBtn) customBtn.classList.add("is-active");
        if (triggerFocus) {
          amountInput.value = "";
          amountInput.focus();
        }
      } else {
        var numVal = String(value).replace(/[^0-9]/g, "");
        amountInput.value = numVal;
        var matched = false;
        buttons.forEach(function (b) {
          if (b.getAttribute("data-amount") === numVal) {
            b.classList.add("is-active");
            matched = true;
          }
        });
        if (!matched) {
          var customBtn = grid.querySelector('[data-amount="custom"]');
          if (customBtn) customBtn.classList.add("is-active");
        }
      }
      clearFieldError(amountInput);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var val = btn.getAttribute("data-amount");
        if (val === "custom") {
          selectAmount("custom", true);
        } else {
          selectAmount(val, false);
        }
      });
    });

    amountInput.addEventListener("input", function () {
      var currentVal = amountInput.value.trim();
      var matched = false;
      buttons.forEach(function (b) {
        var btnVal = b.getAttribute("data-amount");
        if (btnVal !== "custom" && btnVal === currentVal) {
          b.classList.add("is-active");
          matched = true;
        } else {
          b.classList.remove("is-active");
        }
      });
      if (!matched && currentVal !== "") {
        var customBtn = grid.querySelector('[data-amount="custom"]');
        if (customBtn) customBtn.classList.add("is-active");
      }
      clearFieldError(amountInput);
    });

    // Support URL param ?amount=...
    var urlParams = new URLSearchParams(window.location.search);
    var amountParam = urlParams.get("amount");
    if (amountParam) {
      selectAmount(amountParam, false);
    }

    // Support interactive click on impact packages
    $$(".impact-package-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var amt = card.getAttribute("data-amount");
        var cause = card.getAttribute("data-cause");
        if (amt) selectAmount(amt, false);
        if (cause) {
          var select = $("#donationCause");
          if (select) {
            Array.prototype.forEach.call(select.options, function (opt) {
              if (opt.value.toLowerCase().indexOf(cause.toLowerCase()) !== -1 || cause.toLowerCase().indexOf(opt.value.toLowerCase()) !== -1) {
                select.value = opt.value;
              }
            });
          }
        }
        var formCard = $("#donationForm");
        if (formCard) {
          formCard.scrollIntoView({ behavior: "smooth", block: "center" });
          formCard.style.outline = "3px solid var(--yellow-400)";
          formCard.style.outlineOffset = "4px";
          setTimeout(function () { formCard.style.outline = "none"; }, 2000);
        }
        showToast("Impact Tier Selected", "Amount set to " + formatPKR(amt) + " for " + (cause || "donation") + ".", false);
      });
    });

    // Copy to clipboard helper for bank details
    $$(".copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var textToCopy = btn.getAttribute("data-copy") || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(function () {
            showToast("Copied to Clipboard", textToCopy, false);
          });
        } else {
          var temp = document.createElement("input");
          temp.value = textToCopy;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          temp.remove();
          showToast("Copied to Clipboard", textToCopy, false);
        }
      });
    });
  }

  /* ---------- Pre-populate Cause Buttons ---------- */
  function initCauseButtons() {
    $$("[data-cause]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cause = btn.getAttribute("data-cause");
        var select = $("#donationCause");
        if (select) {
          Array.prototype.forEach.call(select.options, function (option) {
            if (option.value === cause || option.text === cause) {
              select.value = option.value;
            }
          });
          var donateSection = $("#donate") || $("#donationForm");
          if (donateSection) {
            donateSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          showToast("Cause Selected", cause + " is selected for your donation.", false);
        } else {
          // If on another page, redirect to donate.html?cause=...
          window.location.href = "donate.html?cause=" + encodeURIComponent(cause);
        }
      });
    });

    // Check URL search params for pre-selected cause on donate page
    var urlParams = new URLSearchParams(window.location.search);
    var causeParam = urlParams.get("cause");
    if (causeParam) {
      var select = $("#donationCause");
      if (select) {
        Array.prototype.forEach.call(select.options, function (option) {
          if (option.value.toLowerCase() === causeParam.toLowerCase() || option.text.toLowerCase() === causeParam.toLowerCase()) {
            select.value = option.value;
          }
        });
      }
    }
  }

  /* ---------- Networks Filtering & Anchor Highlighting ---------- */
  function initNetworksFilter() {
    var filterBar = $("#networksFilter");
    var cards = $$(".network-card");
    if (!filterBar || !cards.length) return;

    var filterBtns = $$(".filter-btn", filterBar);
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        var filter = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          var province = card.getAttribute("data-province");
          if (filter === "all" || province === filter) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });

    // Handle hash scrolling to a city card e.g. #lahore
    function handleHash() {
      if (window.location.hash) {
        var targetId = window.location.hash.substring(1).toLowerCase();
        var targetCard = document.getElementById(targetId);
        if (targetCard) {
          // Reset filters so card is visible
          filterBtns.forEach(function (b) { b.classList.remove("active"); });
          var allBtn = $('[data-filter="all"]', filterBar);
          if (allBtn) allBtn.classList.add("active");
          cards.forEach(function (c) { c.style.display = ""; });

          setTimeout(function () {
            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
            targetCard.style.outline = "3px solid var(--yellow-400)";
            targetCard.style.outlineOffset = "4px";
            setTimeout(function () { targetCard.style.outline = "none"; }, 3000);
          }, 200);
        }
      }
    }

    window.addEventListener("hashchange", handleHash);
    handleHash();
  }

  /* ---------- Projects Category Filter ---------- */
  function initProjectsFilter() {
    var filterBar = $("#projectsFilter");
    var cards = $$(".project-item-card");
    if (!filterBar || !cards.length) return;

    var filterBtns = $$(".filter-btn", filterBar);
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        var filter = btn.getAttribute("data-category");
        cards.forEach(function (card) {
          var category = card.getAttribute("data-category");
          if (filter === "all" || category === filter) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });

    // Check URL hash e.g. #education
    if (window.location.hash) {
      var hashCat = window.location.hash.substring(1).toLowerCase();
      var matchingBtn = $('[data-category="' + hashCat + '"]', filterBar);
      if (matchingBtn) {
        matchingBtn.click();
      }
    }
  }

  /* ---------- Form Validation & Handling ---------- */
  function setFieldError(input, message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    var holder = document.querySelector('[data-error-for="' + input.id + '"]');
    if (holder) holder.textContent = message;
  }

  function clearFieldError(input) {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    var holder = document.querySelector('[data-error-for="' + input.id + '"]');
    if (holder) holder.textContent = "";
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var PHONE_RE = /^(\+92|0)?[\s-]?3\d{2}[\s-]?\d{7}$/;

  function validateField(input) {
    var value = (input.value || "").trim();

    if (input.hasAttribute("required") && !value) {
      setFieldError(input, "This field is required.");
      return false;
    }
    if (input.type === "email" && value && !EMAIL_RE.test(value)) {
      setFieldError(input, "Please enter a valid email address.");
      return false;
    }
    if (input.type === "tel" && value && !PHONE_RE.test(value)) {
      setFieldError(input, "Enter a valid Pakistani mobile number (e.g. 0300 1234567).");
      return false;
    }
    if (input.type === "number" && value) {
      var min = Number(input.getAttribute("min") || 0);
      if (Number(value) < min) {
        setFieldError(input, "Minimum amount is " + formatPKR(min) + ".");
        return false;
      }
    }
    if (input.tagName === "TEXTAREA" && input.hasAttribute("required") && value.length < 10) {
      setFieldError(input, "Please write at least 10 characters.");
      return false;
    }
    clearFieldError(input);
    return true;
  }

  function validateForm(form) {
    var fields = $$("input, select, textarea", form).filter(function (el) {
      return el.type !== "checkbox" && el.type !== "submit";
    });
    var firstInvalid = null;
    var valid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  function attachLiveValidation(form) {
    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("blur", function () {
        if ((field.value || "").trim() || field.hasAttribute("required")) validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.classList.contains("invalid")) validateField(field);
      });
    });
  }

  function initForms() {
    var donationForm = $("#donationForm");
    var volunteerForm = $("#volunteerForm");
    var contactForm = $("#contactForm");

    [donationForm, volunteerForm, contactForm].forEach(function (form) {
      if (form) attachLiveValidation(form);
    });

    if (donationForm) {
      donationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateForm(donationForm)) {
          showToast("Form Incomplete", "Please complete all required fields correctly.", true);
          return;
        }
        var amount = formatPKR($("#donationAmount").value);
        var cause = $("#donationCause").value;
        var donor = $("#anonymous") && $("#anonymous").checked ? "Kind Donor" : ($("#donorName").value.trim() || "Kind Donor");
        showToast(
          "Thank you, " + donor + "!",
          "Your generous donation of " + amount + " for " + cause + " has been recorded in this demo.",
          false
        );
        donationForm.reset();
        var amtField = $("#donationAmount");
        if (amtField) amtField.value = "2500";
        $$(".amount-btn").forEach(function (b) {
          b.classList.toggle("is-active", b.getAttribute("data-amount") === "2500");
        });
      });
    }

    if (volunteerForm) {
      volunteerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateForm(volunteerForm)) {
          showToast("Form Incomplete", "Please fill in all required volunteer details.", true);
          return;
        }
        var name = $("#volName").value.trim();
        showToast(
          "Welcome to Umeed, " + name + "!",
          "Thank you for volunteering. Our regional coordinator will reach out to you shortly.",
          false
        );
        volunteerForm.reset();
      });
    }

    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateForm(contactForm)) {
          showToast("Form Incomplete", "Please provide all required message details.", true);
          return;
        }
        showToast(
          "Message Received",
          "Shukriya! Your message has been sent to our community response team.",
          false
        );
        contactForm.reset();
      });
    }
  }

  /* ---------- FAQ Accordion ---------- */
  function initFaq() {
    var list = $("#faqList");
    if (!list) return;

    $$(".faq-q", list).forEach(function (button) {
      var item = button.parentElement;
      var panel = $(".faq-a", item);

      button.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");

        // Close all others
        $$(".faq-item", list).forEach(function (other) {
          other.classList.remove("open");
          $(".faq-q", other).setAttribute("aria-expanded", "false");
          $(".faq-a", other).style.maxHeight = "0px";
        });

        if (!isOpen) {
          item.classList.add("open");
          button.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = (panel.scrollHeight + 40) + "px";
        }
      });
    });
  }

  /* ---------- Scroll Reveal Animations ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Back to Top Button ---------- */
  function initBackToTop() {
    var btn = $("#toTop");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Boot on DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    [
      initNavbar,
      initReveal,
      initCounters,
      initProgressBars,
      initDonationAmounts,
      initCauseButtons,
      initNetworksFilter,
      initProjectsFilter,
      initForms,
      initFaq,
      initBackToTop
    ].forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        console.warn("Init notice for " + fn.name + ":", err);
      }
    });
  });
})();
