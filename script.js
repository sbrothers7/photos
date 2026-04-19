const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox_img');
const lightboxCaption = document.querySelector('.lightbox_caption');
const lightboxMeta = document.querySelector('.lightbox_meta');

function setupHandlers() {
    document.querySelectorAll('.photo-card').forEach(card => {
        card.addEventListener('click', async () => {
            const img = card.querySelector('img');

            // Set image
            lightboxImg.src = img.dataset.full || img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Manual attributes
            const title = card.dataset.title || img.alt || '';
            const location = card.dataset.location || '';
            const date = card.dataset.date || '';
            const note = card.dataset.note || '';

            // Show manual data immediately while EXIF loads
            renderMeta({ title, location, date, note });

            // EXIF data (async)
            try {
                const exif = await exifr.parse(img.src, [
                    'Make', 'Model',
                    'FocalLength', 'FNumber', 'ApertureValue', 'ExposureTime', 'ISOSpeedRatings',
                    'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef'
                ]);
                console.log('EXIF result:', exif); // check
                renderMeta({ title, location, date, note, exif });
            } catch (e) {
                console.log("EXIF failed: ", e);
            }
        });
    });
}

function renderMeta({ title, location, date, note, exif }) {
    const fmt = (v) => v != null ? String(v) : null;

    const camera = exif?.Make && exif?.Model ? `${exif.Make} ${exif.Model}` : null;
    const lens = fmt(exif?.LensModel);
    const focal = exif?.FocalLength ? `${exif.FocalLength}mm` : null;
    const shutter = exif?.ExposureTime
        ? (exif.ExposureTime < 1 ? `1/${Math.round(1 / exif.ExposureTime)}s` : `${exif.ExposureTime}s`)
        : null;
    const iso = exif?.ISOSpeedRatings ? `ISO ${exif.ISOSpeedRatings}` : null;
    const aperture = exif?.FNumber ? `f/${exif.FNumber.toFixed(1)}` : null;
    const exifDate = exif?.DateTimeOriginal
        ? new Date(exif.DateTimeOriginal).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    function dmsToDecimal([deg, min, sec]) {
        return deg + min / 60 + sec / 3600;
    }

    const gps = (exif?.GPSLatitude && exif?.GPSLongitude)
        ? `${dmsToDecimal(exif.GPSLatitude).toFixed(4)}° ${exif.GPSLatitudeRef},  ${dmsToDecimal(exif.GPSLongitude).toFixed(4)}° ${exif.GPSLongitudeRef}`
        : null;


    lightboxMeta.innerHTML = `
    ${title ? `<p class="lbm-title">${title}</p>` : ''}
    ${(location || date || exifDate) ? `
        <p class="lbm-sub">
            ${location ? `<span class="lbm-location">&#x2316; ${location}</span>` : ''}
            ${(date || exifDate) ? `<span class="lbm-date">${date || exifDate}</span>` : ''}
        </p>` : ''}
    ${note ? `<p class="lbm-note">${note}</p>` : ''}

    ${(camera || lens || focal || aperture || shutter || iso || gps) ? `
    <ul class="lbm-exif">
        ${camera ? `<li><span>Camera</span>${camera}</li>` : ''}
        ${lens ? `<li><span>Lens</span>${lens}</li>` : ''}
        ${[focal, aperture, shutter, iso].filter(Boolean).length ? `
        <li><span>Exposure</span>${[focal, aperture, shutter, iso].filter(Boolean).join('  ·  ')}</li>` : ''}
        ${gps ? `<li><span>GPS</span>${gps}</li>` : ''}
        <li>© 2026 Siwool Um <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></li>
    </ul>` : ''}
    `;
}

document.querySelector('.lightbox_close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

function createPhotoCard({ file, ext = 'jpeg', title = '', location = '', date = '', note = '' }) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    if (title) card.dataset.title = title;
    if (location) card.dataset.location = location;
    if (date) card.dataset.date = date;
    if (note) card.dataset.note = note;

    card.innerHTML = `
        <img src="../thumbnails/${file}.${ext}"
            data-full="../images/${file}.${ext}"
            alt="${title || file}">
        <div class="photo-card_overlay">
        <div class="photo-card_info">
            ${title ? `<p class="photo-card_label">${title}</p>` : ''}
            ${date ? `<p class="photo-card_date">${date}</p>` : ''}
        </div>
        </div>
    `;

    return card;
}

function waitForImages() {
    const cards = document.querySelectorAll('.photo-card');
    const imgs = [...cards].map(card => card.querySelector('img'));

    const promises = imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve); // don't hang on broken images
        });
    });

    Promise.all(promises).then(() => {
        cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('animate'), i * 60);
        });
    });
}