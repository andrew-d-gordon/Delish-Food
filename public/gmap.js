// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = ''; // Insert personal GMAPS API Key between '', callback => initMap()
script.defer = true;

// Append the 'script' element to 'head'
document.head.appendChild(script);
