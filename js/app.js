/**
 * Masjid AL-FITR Digital Signage
 * Bandaneira - Modern Minimalist Display
 * Pure HTML/CSS/JS + JSON config
 * Colors: Ivory, Cream, Navy
 */

(function () {
  'use strict';

  // ===== Default Coordinates (Bandaneira) =====
  const DEFAULT_COORDS = {
    latitude: -4.5213,
    longitude: 129.9050,
    name: 'Bandaneira, Maluku'
  };

  // ===== Prayer Names (Indonesian) =====
  const PRAYER_NAMES = {
    fajr: 'Subuh',
    sunrise: 'Syuruq',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya'
  };

  const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  // ===== Quotes / Hadits =====
  const QUOTES = [
    {
      text: 'Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.',
      source: 'QS. Al-Ankabut: 45'
    },
    {
      text: 'Shalatlah kamu sebagaimana kamu melihat aku shalat.',
      source: 'HR. Bukhari'
    },
    {
      text: 'Barangsiapa yang membangun masjid karena Allah, maka Allah akan bangunkan baginya rumah di surga.',
      source: 'HR. Bukhari & Muslim'
    },
    {
      text: 'Yang paling dicintai Allah adalah shalat pada waktunya.',
      source: 'HR. Bukhari'
    },
    {
      text: 'Jagalah shalatmu, karena ia adalah tiang agamamu.',
      source: 'Pesan Ulama'
    },
    {
      text: 'Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu.',
      source: 'QS. Al-Baqarah: 153'
    },
    {
      text: 'Sebaik-baik amal adalah shalat pada waktunya.',
      source: 'HR. Ahmad'
    },
    {
      text: 'Masjid adalah rumah setiap mukmin.',
      source: 'HR. Abu Nu\'aim'
    }
  ];

  // ===== State =====
  let coords = { ...DEFAULT_COORDS };
  let prayerTimes = null;
  let nextPrayer = null;
  let quoteIndex = 0;
  let config = {
    runningText: 'Selamat datang di Masjid AL-FITR Bandaneira • Mari jaga kebersihan masjid • Shalat berjamaah lebih utama 27 derajat • Jangan lupa matikan HP saat shalat • '
  };

  // ===== DOM Elements =====
  const el = {
    currentTime: document.getElementById('currentTime'),
    gregorianDate: document.getElementById('gregorianDate'),
    hijriDate: document.getElementById('hijriDate'),
    locationLabel: document.getElementById('locationLabel'),
    nextPrayerName: document.getElementById('nextPrayerName'),
    countdown: document.getElementById('countdown'),
    nextPrayerTime: document.getElementById('nextPrayerTime'),
    prayerGrid: document.getElementById('prayerGrid'),
    quoteText: document.getElementById('quoteText'),
    quoteSource: document.getElementById('quoteSource'),
    runningText: document.getElementById('runningText'),
    methodLabel: document.getElementById('methodLabel')
  };

  // ===== Utility =====
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(date) {
    if (!date) return '--:--';
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatCountdown(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }

  function getHijriDate(date) {
    try {
      const formatter = new Intl.DateTimeFormat('id-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(date);
    } catch (e) {
      return '—';
    }
  }

  function getGregorianDate(date) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }

  // ===== Prayer Calculation =====
  function calculatePrayerTimes(lat, lng, date) {
    if (typeof adhan === 'undefined') {
      console.error('Adhan library not loaded');
      return null;
    }

    const coordinates = new adhan.Coordinates(lat, lng);
    const params = adhan.CalculationMethod.MuslimWorldLeague();
    params.madhab = adhan.Madhab.Shafi;
    // Approach closer to Indonesian (Kemenag) practice
    params.fajrAngle = 20;
    params.ishaAngle = 18;

    const times = new adhan.PrayerTimes(coordinates, date, params);

    return {
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha
    };
  }

  function findNextPrayer(times, now) {
    for (const key of PRAYER_ORDER) {
      if (key === 'sunrise') continue;
      if (times[key] > now) {
        return { name: key, time: times[key] };
      }
    }
    // After Isha → Fajr tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = calculatePrayerTimes(coords.latitude, coords.longitude, tomorrow);
    return { name: 'fajr', time: tomorrowTimes.fajr, isTomorrow: true };
  }

  // ===== Render =====
  function renderClock() {
    const now = new Date();
    el.currentTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    el.gregorianDate.textContent = getGregorianDate(now);
    el.hijriDate.textContent = getHijriDate(now);
  }

  function renderPrayerGrid(times, now, next) {
    el.prayerGrid.innerHTML = '';
    PRAYER_ORDER.forEach(key => {
      const item = document.createElement('div');
      item.className = 'prayer-item';
      if (next && next.name === key) item.classList.add('active');
      if (times[key] < now && key !== 'sunrise') item.classList.add('passed');

      item.innerHTML = `
        <div class="prayer-name">${PRAYER_NAMES[key]}</div>
        <div class="prayer-time">${formatTime(times[key])}</div>
      `;
      el.prayerGrid.appendChild(item);
    });
  }

  function renderNextPrayer(next, now) {
    if (!next) return;
    el.nextPrayerName.textContent = PRAYER_NAMES[next.name];
    el.nextPrayerTime.textContent = `pukul ${formatTime(next.time)}${next.isTomorrow ? ' (besok)' : ''}`;
    const diff = next.time - now;
    el.countdown.textContent = formatCountdown(diff);
  }

  function renderQuote() {
    const q = QUOTES[quoteIndex % QUOTES.length];
    el.quoteText.textContent = `"${q.text}"`;
    el.quoteSource.textContent = `— ${q.source}`;
  }

  function updateAll() {
    const now = new Date();
    renderClock();

    if (!prayerTimes) {
      prayerTimes = calculatePrayerTimes(coords.latitude, coords.longitude, now);
    }

    // Recalculate near midnight
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    if (now - midnight < 2000) {
      prayerTimes = calculatePrayerTimes(coords.latitude, coords.longitude, now);
    }

    nextPrayer = findNextPrayer(prayerTimes, now);
    renderPrayerGrid(prayerTimes, now, nextPrayer);
    renderNextPrayer(nextPrayer, now);
  }

  // ===== Geolocation =====
  function initLocation() {
    el.locationLabel.textContent = DEFAULT_COORDS.name;

    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using Bandaneira');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coords.latitude = pos.coords.latitude;
        coords.longitude = pos.coords.longitude;
        coords.name = 'Lokasi Anda';
        el.locationLabel.textContent = `Lokasi Anda (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
        prayerTimes = calculatePrayerTimes(coords.latitude, coords.longitude, new Date());
        updateAll();
      },
      (err) => {
        console.log('Geolocation failed, using Bandaneira default:', err.message);
        el.locationLabel.textContent = DEFAULT_COORDS.name;
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }

  // ===== Load Config (JSON) =====
  async function loadConfig() {
    try {
      const res = await fetch('data/config.json');
      if (res.ok) {
        const data = await res.json();
        if (data.runningText) {
          config.runningText = data.runningText;
          el.runningText.textContent = data.runningText;
        }
        if (data.quotes && Array.isArray(data.quotes) && data.quotes.length) {
          QUOTES.length = 0;
          data.quotes.forEach(q => QUOTES.push(q));
        }
      }
    } catch (e) {
      console.log('Using default config');
    }
  }

  // ===== Init =====
  function init() {
    loadConfig();
    initLocation();

    prayerTimes = calculatePrayerTimes(coords.latitude, coords.longitude, new Date());
    updateAll();
    renderQuote();

    setInterval(updateAll, 1000);

    setInterval(() => {
      quoteIndex++;
      renderQuote();
    }, 30000);

    setInterval(() => {
      prayerTimes = calculatePrayerTimes(coords.latitude, coords.longitude, new Date());
    }, 3600000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
