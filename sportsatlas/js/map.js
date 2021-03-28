

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
  populateDropDownSport()
  populateDropDownLeague()

  // L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  //   attribution: 'Stamen'
  // }).addTo(map);

  /*Legend specific*/
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Professional Teams</h4>";
    div.innerHTML += '<i class="dot" style="background: #B54213"></i><span>Basketball</span><br>';
    div.innerHTML += '<i class="dot" style="background: #b72126"></i><span>Baseball</span><br>';
    div.innerHTML += '<i class="dot" style="background: #656760"></i><span>Hockey</span><br>';
    div.innerHTML += '<i class="dot" style="background: #91672C"></i><span>Football</span><br>';
    div.innerHTML += '<i class="dot" style="background: #45b6fe"></i><span>Soccer</span><br>';



    return div;
  };

  legend.addTo(map);


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
      teamlist = []
      console.log(selectedDate)
      // async function
      async function fetchAsync (teamlist) {
        // await response of fetch call
        let response = await fetch(
            `https://armiller34.carto.com/api/v2/sql?q=SELECT date, teamid FROM schedule WHERE date ='${selectedDate}'`);
        // only proceed once promise is resolved
        let data = await response.json();
        // only proceed once second promise is resolved
        for (const rows of data.rows) {
            console.log(rows.teamid)
            teamlist.push("'"+rows.teamid+"'")
            console.log(teamlist)
          }

        return teamlist





      }

      // trigger async function
      // log response or catch error of fetch promise
      fetchAsync(teamlist)
          .then(teamlist => {
            console.log(teamlist)
            var query = `
              SELECT *
                FROM armiller34.teamslist
                WHERE scheduleid IN (` + teamlist + `)`;
            console.log(query)
            if (teamlist.length !== 0) {
              teamSource.setQuery(query)
            } else {
              teamSource.setQuery(`SELECT * FROM armiller34.teamslist`)
            };





          })
          .catch(reason => console.log(reason.message))

  });



  document.getElementById("submitDirections").addEventListener("click",function(){
    var teamOne = $('#directDrop1').val();
    var teamTwo = $('#directDrop2').val();




    // async function
    async function fetchAsync () {
      // await response of fetch call
      let response = await fetch(`
          https://armiller34.carto.com/api/v2/sql?format=geojson&q=SELECT the_geom, address, city, state, zip  FROM teamslist WHERE team='${teamOne}'`);
      // only proceed once promise is resolved
      let data = await response.json();
      // only proceed once second promise is resolved


      let response2 = await fetch(`
          https://armiller34.carto.com/api/v2/sql?format=geojson&q=SELECT the_geom, address, city, state, zip  FROM teamslist WHERE team='${teamTwo}'`);
      // only proceed once promise is resolved
      let data2 = await response2.json();
      // only proceed once second promise is resolved
      return [data,data2];

    }

    // trigger async function
    // log response or catch error of fetch promise
    fetchAsync()
        .then(data => {
          console.log(data[0]);
          console.log(data[1]);
          let siteOne = data[0]
          let siteTwo = data[1]
          console.log(siteOne)
          console.log(siteTwo)
          let string1 =
          siteOne['features'].map(function(feature,string1){
                  option = document.createElement("option")
                  option.setAttribute("value", feature.properties.address+", "+feature.properties.city+", "+feature.properties.state+" "+feature.properties.zip)
                  option.textContent = feature.properties.address

                  string1 = option.value


                  return string1
                })



          console.log(string1)
          string1 = JSON.stringify(string1);
          console.log(string1)
          string1 = string1.slice(1,-1);
          console.log(string1)

          let string2 =
          siteTwo['features'].map(function(feature,string2){
                  option = document.createElement("option")
                  option.setAttribute("value", feature.properties.address+", "+feature.properties.city+", "+feature.properties.state+" "+feature.properties.zip)
                  option.textContent = feature.properties.address

                  string2 = (option.value)
                  return string2
                })



          console.log(string2)
          string2 = JSON.stringify(string2);
          console.log(string2)
          string2 = string2.slice(1,-1);
          console.log(string2)

          var directions = L.mapquest.directions().route({
            start: string1,
            end: string2,
            options: {
              enhancedNarrative: true
            }
          });

          let directionsControl = L.mapquest.directionsControl({
            endInput: {
              disabled: true,
              geolocation: {
                enabled: false
              },
            },
            startInput: {
              disabled: true,
              geolocation: {
                enabled: false
              },
            },
            addDestinationButton: {
              enabled: false
            }
          }).addTo(map);

          directionsControl.setFirstDestination({
            street: {
              string2
            }
          });

          directionsControl.setStart({
            street: string1
          });






        })
        .catch(reason => console.log(reason.message))

  });






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
      marker-width: 10;
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

  // teamLayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
  //   console.log("mouse over polygon with data: " + e.data.team);
  // });

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
    console.log(featureEvent.data)
  });

  const popup = L.popup({ closeButton: false });

  function openPopup(featureEvent) {
          let content = '<div class="widget">';

          if (featureEvent.data.team || featureEvent.data.stadiumname ) {
            content += `<h6>${featureEvent.data.team}</h6>`;

            content +=  `<h6>${featureEvent.data.stadiumname}</h6>`;
          }

          content += `</div>`;
          console.log(content)
          popup.setContent(content);
          popup.setLatLng(featureEvent.latLng);
          if (!popup.isOpen()) {
            popup.openOn(map);
          }
        }

  function closePopup(featureEvent) {
    popup.removeFrom(map);
  }




    teamLayer.on('featureOver', openPopup);
    teamLayer.on('featureOut', closePopup);




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

  function populateDropDownSport(){
    var workers = ["All","Baseball", "Basketball", "Football","Hockey","Soccer"];

    $('#sportFilter').html( $.map(workers, function(i){
         return '<option value="' + i + '">'+ i + '</option>';
    }).join('') );
  }

  document.getElementById('sportFilter').addEventListener("change", function (e) {
    input = e.currentTarget.selectedOptions[0].attributes[0].value;
    var query = `
      SELECT *
        FROM armiller34.teamslist
        WHERE sport ='` + input + `'`;
    if (input !== "All") {
      teamSource.setQuery(query)
      document.getElementById('sportFilter')

    } else {
      teamSource.setQuery(`SELECT * FROM armiller34.teamslist`)
      $("leagueFilter").val("All");
    };
  });

  function populateDropDownLeague(){
    var workers = ["All","MLB", "MILB", "MLS","NBA","NFL","NHL","WNBA"];

    $('#leagueFilter').html( $.map(workers, function(i){
         return '<option value="' + i + '">'+ i + '</option>';
    }).join('') );
  }

  document.getElementById('leagueFilter').addEventListener("change", function (e) {
    input = e.currentTarget.selectedOptions[0].attributes[0].value;
    var query = `
      SELECT *
        FROM armiller34.teamslist
        WHERE league ='` + input + `'`;
    if (input !== "All") {
      teamSource.setQuery(query)
    } else {
      teamSource.setQuery(`SELECT * FROM armiller34.teamslist`)
      $("sportFilter").val("All");
    };
  });










  }

  function showDirections() {
     var directionsbox = document.getElementById("directionsBox");
     var infobox = document.getElementById("infoBox");
     var datebox = document.getElementById("dateBox");
     var filterbox = document.getElementById("filterBox");
     if (directionsbox.style.display === "none") {
       directionsbox.style.display = "block";
     }
     if (infobox.style.display === "block") {
       infobox.style.display = "none";
     } else {
       infobox.style.display = "none";
     }
     if (datebox.style.display === "block") {
       datebox.style.display = "none";
     } else {
       datebox.style.display = "none";
     }
     if (filterbox.style.display === "block") {
       filterbox.style.display = "none";
     } else {
       filterbox.style.display = "none";
     }
   }

   function showInfo() {
     var infobox = document.getElementById("infoBox");
     var directionsbox = document.getElementById("directionsBox");
     var datebox = document.getElementById("dateBox");
     var filterbox = document.getElementById("filterBox");
     if (infobox.style.display === "none") {
       infobox.style.display = "block";
     }
     if (directionsbox.style.display === "block") {
       directionsbox.style.display = "none";
     } else {
       directionsbox.style.display = "none";
     }
     if (datebox.style.display === "block") {
       datebox.style.display = "none";
     } else {
       datebox.style.display = "none";
     }
     if (filterbox.style.display === "block") {
       filterbox.style.display = "none";
     } else {
       filterbox.style.display = "none";
     }
   }

   function showDate() {
     var infobox = document.getElementById("infoBox");
     var directionsbox = document.getElementById("directionsBox");
     var datebox = document.getElementById("dateBox");
     var filterbox = document.getElementById("filterBox");
     if (datebox.style.display === "none") {
       datebox.style.display = "block";
     }
     if (directionsbox.style.display === "block") {
       directionsbox.style.display = "none";
     } else {
       directionsbox.style.display = "none";
     }
     if (infobox.style.display === "block") {
       infobox.style.display = "none";
     } else {
       infobox.style.display = "none";
     }
     if (filterbox.style.display === "block") {
       filterbox.style.display = "none";
     } else {
       filterbox.style.display = "none";
     }
   }

   function showFilter() {
     var infobox = document.getElementById("infoBox");
     var directionsbox = document.getElementById("directionsBox");
     var datebox = document.getElementById("dateBox");
     var filterbox = document.getElementById("filterBox");
     if (filterbox.style.display === "none") {
       filterbox.style.display = "block";
     }
     if (directionsbox.style.display === "block") {
       directionsbox.style.display = "none";
     } else {
       directionsbox.style.display = "none";
     }
     if (infobox.style.display === "block") {
       infobox.style.display = "none";
     } else {
       infobox.style.display = "none";
     }
     if (datebox.style.display === "block") {
       datebox.style.display = "none";
     } else {
       datebox.style.display = "none";
     }
   }

   $(document).ready(function(){
    var date_input=$('input[name="date"]'); //our date input has the name "date"
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    var options={
      format: 'm/dd/yyyy',
      container: container,
      todayHighlight: true,
      autoclose: true,
    };
    date_input.datepicker(options);
  })



window.onload = main;
