document.head.insertAdjacentHTML('beforeend', `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="icon" href="../images/icon.JPG">
    <link rel="stylesheet" href="../styles.css">
`);

const exifrScript = document.createElement('script');
exifrScript.src = 'https://cdn.jsdelivr.net/npm/exifr/dist/full.umd.js';
document.head.appendChild(exifrScript);