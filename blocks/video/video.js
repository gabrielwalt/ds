/*
 * video — a row/carousel of video cards (source: dentsplysirona.com Learn
 * "Watch, learn, improve"). Each authored row is [ thumbnail , title (+link) ].
 * The thumbnail gets a play-button overlay; clicking the card opens the linked
 * video (the source uses a lightbox; here the CTA link opens the video page).
 */
const PLAY_SVG = '<svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" fill="currentColor"></path></svg>';

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const track = document.createElement('ul');
  track.className = 'video-track';

  rows.forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const textCell = cells.find((c) => c !== mediaCell) || cells[1];

    const item = document.createElement('li');
    item.className = 'video-card';

    // link wrapping the whole card if the text cell has one
    const link = textCell && textCell.querySelector('a');
    const href = link ? link.getAttribute('href') : null;

    const thumb = document.createElement('div');
    thumb.className = 'video-card-thumb';
    const pic = mediaCell && mediaCell.querySelector('picture, img');
    if (pic) thumb.append(pic);
    thumb.insertAdjacentHTML('beforeend', `<span class="video-card-play" aria-hidden="true">${PLAY_SVG}</span>`);

    const body = document.createElement('div');
    body.className = 'video-card-body';
    if (textCell) {
      while (textCell.firstChild) body.append(textCell.firstChild);
    }

    if (href) {
      const a = document.createElement('a');
      a.className = 'video-card-link';
      a.href = href;
      a.setAttribute('aria-label', body.textContent.trim() || 'Play video');
      a.append(thumb, body);
      item.append(a);
    } else {
      item.append(thumb, body);
    }
    track.append(item);
  });

  block.append(track);
}
