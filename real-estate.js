'use strict';

// HERO VIDEO
const video = document.getElementById('heroVideo');
const toggle = document.getElementById('playToggle');
const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

function syncPlayback() {
  toggle.textContent = video.paused ? 'Play ↗' : 'Pause Ⅱ';
  toggle.setAttribute(
    'aria-label',
    video.paused ? 'Play property film' : 'Pause property film'
  );
}

video.addEventListener('play', syncPlayback);
video.addEventListener('pause', syncPlayback);

toggle.addEventListener('click', () => {
  if (video.paused) {
    video.play().catch(syncPlayback);
  } else {
    video.pause();
  }
});

if (!reducedMotion.matches) {
  video.play().catch(syncPlayback);
}

reducedMotion.addEventListener('change', event => {
  if (event.matches) video.pause();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
});

// MOBILE NAVIGATION
const menuButton = document.getElementById('menuButton');
const navigation = document.getElementById('navigation');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

navigation.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

// INTERACTIVE WORKFLOW DEMO
const scenes = [
  [
    'A property catches their eye.',
    '“I’m interested in the contemporary residence. Could I arrange a viewing next week?”',
    'SOURCE',
    'Property inquiry · Website'
  ],
  [
    'A clearer picture of the inquiry.',
    'The assistant asks about the property, budget and timing, then collects the contact details needed for the next step.',
    'EXAMPLE SUMMARY',
    'Buyer inquiry · Viewing requested · Next week'
  ],
  [
    'An agreed next step.',
    'The workflow checks the connected calendar. Depending on your rules, it offers available times or requests an agent callback.',
    'BOOKING RULE',
    'Confirm availability before arranging a viewing'
  ],
  [
    'The context reaches your team.',
    'The inquiry summary and agreed next step are sent to the connected CRM, with a notification for the assigned agent.',
    'HANDOVER',
    'Contact details + property interest + next action'
  ]
];

const tabs = [...document.querySelectorAll('[data-step]')];

function selectStep(index, focus = false) {
  tabs.forEach((tab, position) => {
    tab.setAttribute(
      'aria-selected',
      String(position === index)
    );
    tab.tabIndex = position === index ? 0 : -1;
  });

  document.getElementById('workflowPanel').setAttribute(
    'aria-labelledby',
    'step' + index
  );

  ['demoTitle', 'demoBody', 'demoKey', 'demoValue'].forEach(
    (id, position) => {
      document.getElementById(id).textContent =
        scenes[index][position];
    }
  );

  if (focus) tabs[index].focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectStep(index));

  tab.addEventListener('keydown', event => {
    let next = index;

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowRight'
    ) {
      next = (index + 1) % 4;
    } else if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowLeft'
    ) {
      next = (index + 3) % 4;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = 3;
    } else {
      return;
    }

    event.preventDefault();
    selectStep(next, true);
  });
});

// SERVICE SELECTION AND CONTACT LINKS
const interest = document.getElementById('interest');

function updateContact() {
  const booking = new URL(
    'https://calendly.com/letionketienya/project-insight'
  );

  booking.searchParams.set('utm_source', 'intrigue_website');
  booking.searchParams.set('utm_medium', 'real_estate');
  booking.searchParams.set(
    'utm_campaign',
    interest.value.toLowerCase().replaceAll(' ', '_')
  );

  document.getElementById('bookingLink').href =
    booking.toString();

  document.getElementById('emailLink').href =
    'mailto:team@intriguestudios.de?subject=' +
    encodeURIComponent('Real estate inquiry — ' + interest.value);
}

interest.addEventListener('change', updateContact);

document.querySelectorAll('[data-interest]').forEach(link => {
  link.addEventListener('click', () => {
    interest.value = link.dataset.interest;
    updateContact();
  });
});

// DARK MODE
// Uses the same saved preference as your original homepage.
// Initial theme is applied by the script in the HTML <head>.
const themeButton = document.getElementById('themeToggle');

function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';

  themeButton.textContent = dark ? '☀' : '☾';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute(
    'aria-label',
    dark ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

syncThemeButton();

themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark';

  if (dark) {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = 'dark';
  }

  try {
    localStorage.setItem('theme', dark ? 'light' : 'dark');
  } catch (error) {
    // Theme switching still works if storage is unavailable.
  }

  syncThemeButton();
});

// CALENDLY POPUP
// Loads Calendly inside the page instead of opening another tab.
const bookingModal = document.getElementById('calModal');
const bookingFrame = document.getElementById('calFrame');

let bookingTrigger = null;
let priorOverflow = '';

function openBooking(event) {
  event.preventDefault();
  bookingTrigger = event.currentTarget;

  const url = new URL(
    document.getElementById('bookingLink').href
  );

  url.searchParams.set(
    'embed_domain',
    location.hostname || 'intriguestudios.de'
  );
  url.searchParams.set('embed_type', 'Inline');

  if (bookingFrame.src !== url.toString()) {
    bookingFrame.src = url.toString();
  }

  priorOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  bookingModal.showModal();
  document.getElementById('calClose').focus();
}

document.querySelectorAll('[data-booking]').forEach(button => {
  button.addEventListener('click', openBooking);
});

document.getElementById('calClose').addEventListener('click', () => {
  bookingModal.close();
});

// Close when clicking the backdrop outside the dialog.
bookingModal.addEventListener('click', event => {
  if (event.target !== bookingModal) return;

  const bounds = bookingModal.getBoundingClientRect();

  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    bookingModal.close();
  }
});

// Native <dialog> also supports closing with Escape.
bookingModal.addEventListener('close', () => {
  document.body.style.overflow = priorOverflow;

  if (bookingTrigger) {
    bookingTrigger.focus();
  }
});
