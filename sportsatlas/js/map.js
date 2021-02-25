function main() {
  var map = new L.Map('map', {
    zoomControl: false,
    center: [43, 0],
    zoom: 3
  });

  L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: 'Stamen'
  }).addTo(map);

  const client = new carto.Client({
    apiKey: '32e6b633d2166f8a2229b83e83b5df7222248b7d',
    username: 'armiller34'
  });


  const teamSource = new carto.source.SQL(`
    SELECT *
      FROM armiller34.teamslist
  `);

  const teamStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 7;
      marker-fill: #000080;
      marker-fill-opacity: 0.9;
      marker-line-color: #FFF;
      marker-line-width: 1;
      marker-line-opacity: 1;
      marker-placement: point;
      marker-type: ellipse;
      marker-allow-overlap: true;
    }
  `);

  const teamLayer = new carto.layer.Layer(teamSource, teamStyle, {
  });



  client.addLayers([teamLayer]);
  // currentLayers = client.getLayers();
  // console.log(currentLayers);
  client.getLeafletLayer().addTo(map);
}


//   cartodb.createLayer(map, 'http://documentation.cartodb.com/api/v2/viz/2b13c956-e7c1-11e2-806b-5404a6a683d5/viz.json')
//       .addTo(map)
//    .on('done', function(layer) {
//
//     layer.setInteraction(true);
//
//     layer.on('featureOver', function(e, latlng, pos, data) {
//       cartodb.log.log(e, latlng, pos, data);
//     });
//
//     layer.on('error', function(err) {
//       cartodb.log.log('error: ' + err);
//     });
//   }).on('error', function() {
//     cartodb.log.log("some error occurred");
//   });
// }

// you could use $(window).load(main);
window.onload = main;
