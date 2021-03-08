

function main() {
  // var map = new L.Map('map', {
  //   zoomControl: false,
  //   center: [43, 0],
  //   zoom: 3
  // });


  

  L.mapquest.key = 'VSdCN6AdXZoLBKk7TgTb0TGmm0teyCst';

  var map = L.mapquest.map('map', {
    center: [39.542195978089374, -97.87155940081236],
    layers: L.mapquest.tileLayer('light'),
    zoom: 4,
    maxZoom: 16
  });



  // populate dropdown menu
  populateDrowpDown()
  populateDrowpDowndir1()
  populateDrowpDowndir2()

  // L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  //   attribution: 'Stamen'
  // }).addTo(map);

  // L.mapquest.directions().route({
  //   start: 'Yankee Stadium',
  //   end: 'MetLife Stadium'
  // });

  $(document).ready(function(){
        var date_input=$('input[name="date"]'); //our date input has the name "date"
        var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
        var options={
          format: 'mm/dd/yyyy',
          container: container,
          todayHighlight: true,
          autoclose: true,
        };
        date_input.datepicker(options);
      })

  document.getElementById("submit").addEventListener("click",function(){
      var selectedDate = $("#date").datepicker("getFormattedDate");
      console.log(selectedDate)
  });

  document.getElementById("submitDirections").addEventListener("click",function(){
    var teamOne = $('#directDrop1').val();
    var teamTwo = $('#directDrop2').val();
    console.log(teamOne)
    console.log(teamTwo)

    L.mapquest.directions().route({
      start: teamOne,
      end: teamTwo
    });
  });






  const client = new carto.Client({
    apiKey: '32e6b633d2166f8a2229b83e83b5df7222248b7d',
    username: 'armiller34'
  });

  // var myDropdown = document.getElementById('leaguedropdown')
  //   myDropdown.addEventListener('show.bs.dropdown', function () {
  //     // do something...
  //     console.log("You're a genius");
  //   })




  const teamSource = new carto.source.SQL(`
    SELECT *
      FROM armiller34.teamslist
  `);

  const teamStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 7;
      marker-fill-opacity: 0.9;
      marker-line-color: #FFF;
      marker-line-width: 1;
      marker-line-opacity: 1;
      marker-placement: point;
      marker-type: ellipse;
      marker-allow-overlap: true;
      [sport="Basketball"] {
       marker-fill: #B54213;
     }
     [sport="Baseball"] {
       marker-fill: #b72126;
     }
     [sport="Hockey"] {
       marker-fill: #656760;
     }
     [sport="Football"] {
       marker-fill: #91672C;
     }
     [sport="Soccer"] {
       marker-fill: #45b6fe;
     }
    }
  `);

  const teamLayer = new carto.layer.Layer(teamSource, teamStyle, {
    featureClickColumns: ['team', 'league', 'conference','division','teamurl','stadiumname','capacity','city','state']
  });





  client.addLayers([teamLayer]);
  // currentLayers = client.getLayers();
  // console.log(currentLayers);
  client.getLeafletLayer().addTo(map);

  teamLayer.on('featureClicked', featureEvent => {
    const content = `
      <h5>${featureEvent.data.team}</h5>
      <p class="open-sans"> <small>League: </small>${featureEvent.data.league}</p>
      <p class="open-sans"> <small>Conference: </small>${featureEvent.data.conference}</p>
      <p class="open-sans"> <small>Division: </small>${featureEvent.data.division}</p>
      <p class="open-sans"> <a href=${featureEvent.data.teamurl} target="_blank">Visit Team Website</a></p>
      <h5>${featureEvent.data.stadiumname}</h5>
      <p class="open-sans"> <small>Stadium Capacity: </small>${featureEvent.data.capacity}</p>
      <p class="open-sans"> ${featureEvent.data.city}<small>, </small>${featureEvent.data.state}</p>
    `;

    document.getElementById('info2').innerHTML = content;
  });

  // function to get list of country names to populate dropdown menu
  function populateDrowpDown(){
      return fetch(
          `https://armiller34.carto.com/api/v2/sql?format=geojson&q=SELECT the_geom, team FROM teamslist ORDER BY team ASC`
          ).then((resp) => resp.json())
          .then((response) => {
              return response['features'].map(function(feature){
                  option = document.createElement("option")
                  option.setAttribute("value", feature.properties.team)
                  option.textContent = feature.properties.team
                  document.getElementById("selectDrop").appendChild(option);
              });
          }).catch((error) => {
              console.log(error)
          })
  }
  function populateDrowpDowndir1(){
      return fetch(
          `https://armiller34.carto.com/api/v2/sql?format=geojson&q=SELECT the_geom, team FROM teamslist ORDER BY team ASC`
          ).then((resp) => resp.json())
          .then((response) => {
              return response['features'].map(function(feature){
                  option = document.createElement("option")
                  option.setAttribute("value", feature.properties.team)
                  option.textContent = feature.properties.team
                  document.getElementById("directDrop1").appendChild(option);
              });
          }).catch((error) => {
              console.log(error)
          })
  }

  function populateDrowpDowndir2(){
      return fetch(
          `https://armiller34.carto.com/api/v2/sql?format=geojson&q=SELECT the_geom, team FROM teamslist ORDER BY team ASC`
          ).then((resp) => resp.json())
          .then((response) => {
              return response['features'].map(function(feature){
                  option = document.createElement("option")
                  option.setAttribute("value", feature.properties.team)
                  option.textContent = feature.properties.team
                  document.getElementById("directDrop2").appendChild(option);
              });
          }).catch((error) => {
              console.log(error)
          })
  }

  // when select option from downdown menu, change bounding box of map
 // to geometry of the selected country
   document.getElementById('selectDrop').addEventListener("change", function (e) {
       input = e.currentTarget.selectedOptions[0].attributes[0].value;
       return  fetch(`https://armiller34.carto.com/api/v2/sql?format=geojson&q=SELECT * FROM teamslist where team Ilike '${input}'`)
       .then((resp) => resp.json())
       .then((response) => {
           geojsonLayer = L.geoJson(response)
           map.fitBounds(geojsonLayer.getBounds());
       })
   });
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
