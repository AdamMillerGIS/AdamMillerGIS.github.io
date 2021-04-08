const responsiveContent = document.querySelector('as-responsive-content');
responsiveContent.addEventListener('ready', () => {
  const map = L.map('map', {zoomControl:false}).setView([42.6025, -96.720280], 14);
      //map.scrollWheelZoo.enable();

  original = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    maxZoom: 18,
    subdomains: 'abcd',
    //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  var zoomHome = L.Control.zoomHome();
  zoomHome.addTo(map);

  const client = new carto.Client({
    apiKey: '32e6b633d2166f8a2229b83e83b5df7222248b7d',
    username: 'armiller34'
  });

  var lc =L.control.locate({
      strings: {
          title: "Zoom to your current location"
      }
  }).addTo(map);



  const popup = L.popup({ closeButton: false });



  const dropdown = document.querySelector('as-dropdown');
    dropdown.options = [
      //{ text: 'All', value: '*' },
      { text: 'Easy', value: 'Easy' },
      { text: 'Moderate', value: 'Moderate' },
      { text: 'Difficult', value: 'Difficult' }
    ];

  const traildropdown = document.querySelector('#trailDropdown')
    traildropdown.options = [
      //{ text: 'All', value: '*' },
      { text: 'Bigley\'s Ravine Trail', value: 'Bigley\'s Ravine Trail' },
      { text: 'Bloodroot Connecting Trail', value: 'Bloodroot Connecting Trail' },
      { text: 'Bloodroot Trail', value: 'Bloodroot Trail' },
      { text: 'Buffalo Run Trail', value: 'Buffalo Run Trail' },
      { text: 'Corps of Discovery Trail', value: 'Corps of Discovery Trail' },
      { text: 'Education Center Trail', value: 'Education Center Trail' },
      { text: 'HIke/Bike Trail', value: 'HIke/Bike Trail' },
      { text: 'Oak Bluff Trail', value: 'Oak Bluff Trail' },
      { text: 'Old Oak Trail', value: 'Old Oak Trail' },
      { text: 'Ponca Trail', value: 'Ponca Trail' },
      { text: 'Real Bloodroot Trail', value: 'Real Bloodroot Trail' },
      { text: 'Shelter House Nature Trail', value: 'Shelter House Nature Trail' },
      { text: 'Tri State Overlook Trail', value: 'Tri State Overlook Trail' },
      { text: 'West Shelter Trail', value: 'West Shelter Trail' },
      { text: 'White Tail Trail', value: 'White Tail Trail' }
    ];

    const issuedropdown = document.querySelector('#issueDropdown')
      issuedropdown.options = [
        //{ text: 'All', value: '*' },
        { text: 'Trail Erosion', value: 'erosion' },
        { text: 'Water on Trail', value: 'water' },
        { text: 'Tree limb obstruction', value: 'limb' },
        { text: 'Escessive Litter', value: 'litter' },
        { text: 'Other (Describe Below)', value: 'other' }
      ];

    const siteActivitydropdown = document.querySelector('#siteActivitydropdown')
      siteActivitydropdown.options = [
        //{ text: 'All', value: '*' },
        { text: 'Fishing', value: 'Fishing' },
        { text: 'Golfing', value: 'Golfing' },
        { text: 'Horse Riding', value: 'Horse Riding' },
        { text: 'Playground', value: 'Playground' },
        { text: 'Point of Interest', value: 'Point of Interest' },
        { text: 'Education Center Trail', value: 'Education Center Trail' }
      ];

      const facilitydropdown = document.querySelector('#facilityDropdown')
        facilitydropdown.options = [
          //{ text: 'All', value: '*' },
          { text: 'Stairs', value: 'Stairs' },
          { text: 'Shelter', value: 'Shelter' },
          { text: 'RV Campground', value: 'RV Campground' },
          { text: 'Restroom', value: 'Restroom' },
          { text: 'Refreshment', value: 'Refreshment' },
          { text: 'Picnic Shelter', value: 'Picnic Shelter' },
          { text: 'Lodging', value: 'Lodging' },
          { text: 'Information', value: 'Information' },
          { text: 'Drinking Water', value: 'Drinking Water' },
          { text: 'Campground', value: 'Campground' }
        ];





  const difficulties = ['Easy','Moderate','Difficult']

  var difficultyFilter = new carto.filter.Category('difficulty', { in:difficulties});

  var choice = 'test'

  var trailsQuery = `SELECT * FROM armiller34.trails`
  var sitesQuery =  `SELECT * FROM armiller34.sites`
  var facilityQuery = `SELECT * FROM armiller34.facility`




  let drawnItems = new L.FeatureGroup();
  let drawControl = new L.Control.Draw({
      draw: {
          polygon: false,
          polyline: false,
          line: false,
          marker: true,
          rectangle: false,
          circle: false,
          circlemarker: false,
      },
      edit: {
          featureGroup: drawnItems,
          edit: false,
          remove: true
      },
  });

  //map.addControl(drawControl);
  //map.addLayer(drawnItems);

  function trailsFilter(){
    var string = dropdown.selectedOption;
    var query = `
      SELECT *
        FROM armiller34.trails;`
    console.log(query);
    drawMap(query);
  };


  document.getElementById("filterButton").addEventListener("click",function(){
    //client.removeLayers();
    //trailsFilter();
    document.getElementById("clearButton").disabled = false;
    updateTrailsSource();
  });

  // document.getElementById("filterButton").addEventListener("click",function(){
  //   values = applyFilter(difficultyFilter, choice, trailsSource);
  //   choice = values[0];
  //   difficultyFilter = values[1];
  //   trailsSource = values[2];
  // });
  document.getElementById("clearButton").addEventListener("click",function(){
    clearFilters();
  })

  document.getElementById("mylocationBottun").addEventListener("click",function(){
    var trailoption = traildropdown.selectedOption;
    var issueoption = issuedropdown.selectedOption;
    if (trailoption !== null && issueoption !== null){
      lc.start();
    } else{
      alert("Please select the issue and trail before submitting!");
    }
  })

  document.getElementById("locationButton").addEventListener("click",function(){
    // define leaflet.draw settings
    var trailoption = traildropdown.selectedOption;
    var issueoption = issuedropdown.selectedOption;
    if (trailoption !== null && issueoption !== null){
      new L.Draw.Marker(map, drawControl.options.marker).enable();
    } else{
      alert("Please select the issue and trail before submitting!");
    }
  });



  //values = applyFilter();
  function clearFilters(){
    trailsSource.setQuery(`SELECT * FROM armiller34.trails`)
    sitesSource.setQuery(`SELECT * FROM armiller34.sites`);
    facilitySource.setQuery(`SELECT * FROM armiller34.facility`)
    document.getElementById("clearButton").disabled = true;
    dropdown.selectedOption = null
    siteActivitydropdown.selectedOption = null
    facilitydropdown.selectedOption = null
  }

  //trailsSource.addFilter(difficultyFilter);
  function updateTrailsSource(){
    var string = dropdown.selectedOption;
    var query = `
      SELECT *
        FROM armiller34.trails
        WHERE difficulty ='` + string + `'`;
    if (string !== null) {
      trailsSource.setQuery(query)
    } else {
      trailsSource.setQuery(`SELECT * FROM armiller34.trails`)
    };

    var siteString = siteActivitydropdown.selectedOption;
    var siteQuery = `
      SELECT *
        FROM armiller34.sites
        WHERE activity ='` + siteString + `'`;
    if (siteString !== null){
      sitesSource.setQuery(siteQuery);
    } else{
      sitesSource.setQuery(`SELECT * FROM armiller34.sites`);
    }
    var facilityString = facilitydropdown.selectedOption;
    var facilityQuery = `
      SELECT *
        FROM armiller34.facility
        WHERE factype ='` + facilityString + `'`;
    if (facilityString !== null){
      facilitySource.setQuery(facilityQuery);
    } else{
      facilitySource.setQuery(`SELECT * FROM armiller34.facility`);
    }
  };


  const trailsSource = new carto.source.SQL(trailsQuery);

  const trailsStyle = new carto.style.CartoCSS(`
    #layer {
      line-color: #BD4F19;
      line-width: 1.5;
      line-opacity: 1;
    }
  `);
  const trailsLayer = new carto.layer.Layer(trailsSource, trailsStyle, {
      featureOverColumns:['trailname','length','difficulty']
  });

  trailsLayer.off('featureOver');
  trailsLayer.off('featureOut');
  trailsLayer.on('featureClicked', openPopup);


  currentLayers = client.getLayers();
  console.log(currentLayers);

  const sitesSource = new carto.source.SQL(sitesQuery);

  const sitesStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 7;
      marker-fill: #FFB927;
      marker-fill-opacity: 0.9;
      marker-line-color: #FFF;
      marker-line-width: 1;
      marker-line-opacity: 1;
      marker-placement: point;
      marker-type: ellipse;
      marker-allow-overlap: true;
    }
  `);

  const sitesLayer = new carto.layer.Layer(sitesSource, sitesStyle, {
      featureOverColumns:['sitename','activity']
  });

  sitesLayer.off('featureOver');
  sitesLayer.off('featureOut');
  sitesLayer.on('featureClicked', openPopup);

  const parkingSource = new carto.source.SQL(`
    SELECT *
      FROM armiller34.parking
  `);

  const parkingStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 7;
      marker-fill: #FF0000;
      marker-fill-opacity: 0.9;
      marker-line-color: #FFF;
      marker-line-width: 1;
      marker-line-opacity: 1;
      marker-placement: point;
      marker-type: ellipse;
      marker-allow-overlap: true;
    }
  `);

  const parkingLayer = new carto.layer.Layer(parkingSource, parkingStyle, {
      featureOverColumns:['parkingid','trailheadname']
  });

  parkingLayer.off('featureOver');
  parkingLayer.off('featureOut');
  parkingLayer.on('featureClicked', openPopup);

  const facilitySource = new carto.source.SQL(facilityQuery);

  const facilityStyle = new carto.style.CartoCSS(`
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


  const facilityLayer = new carto.layer.Layer(facilitySource, facilityStyle, {
      featureOverColumns:['facname','factype']
  });

  facilityLayer.off('featureOver');
  facilityLayer.off('featureOut');
  facilityLayer.on('featureClicked', openPopup);

  const trailreportSource = new carto.source.SQL(`
    SELECT *
      FROM armiller34.trailreport
  `);

  const trailreportStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 7;
      marker-fill: #FFC0CB;
      marker-fill-opacity: 0.9;
      marker-line-color: #FFF;
      marker-line-width: 1;
      marker-line-opacity: 1;
      marker-placement: point;
      marker-type: ellipse;
      marker-allow-overlap: true;
    }
  `);

  const trailreportLayer = new carto.layer.Layer(trailreportSource, trailreportStyle, {
      featureOverColumns:['reporttype','description','date','trailname']
  });

  trailreportLayer.off('featureOver');
  trailreportLayer.off('featureOut');
  trailreportLayer.on('featureClicked', openPopup);

  map.on('locationfound', onLocationFound);
  map.on('locationerror', onLocationError);
  map.on(L.Draw.Event.CREATED, onDraw);


  var legend = document.querySelector('as-legend-category');
  legend.data = [
    { type: 'point', width: 7, color: '#FFC0CB', label: 'Reported Trail Issue' },
    { type: 'point', width: 7, color: '#000080', label: 'Park Facility' },
    { type: 'point', width: 7, color: '#FF0000', label: 'Trailhead Parking Lot' },
    { type: 'point', width: 7, color: '#FFB927', label: 'Park Sites of Interest' },
    { type: 'line', width: 2, color: '#BD4F19', label: 'Hiking Trails' },
  ];




  //client.removeLayers([trailsLayer, sitesLayer, parkingLayer, facilityLayer, trailreportLayer]);
  client.addLayers([sitesLayer, parkingLayer, facilityLayer, trailreportLayer, trailsLayer ]);
  // currentLayers = client.getLayers();
  // console.log(currentLayers);
  client.getLeafletLayer().addTo(map);










  function onDraw(e){
    let layer = e.layer;
    map.addLayer(layer);
    let layerAdded = JSON.stringify(layer.toGeoJSON().geometry)


    console.log(layerAdded)

    var coords = Object.values(layerAdded)
    var lat = coords[0];
    var long = coords[1];

    console.log(lat + " , " + long);

    var geomstring = long + " , " + lat;

    var trailoption = traildropdown.selectedOption;
    var issueoption = issuedropdown.selectedOption;
    var description = document.getElementById("descriptionInput").value;


    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    if (trailoption !== null && issueoption !== null){
      fetch(`

        https:armiller34.cartodb.com/api/v2/sql?q=INSERT INTO trailreport (reporttype, description, date, trailname, the_geom) VALUES ('${issueoption}','${description}','${today}','${trailoption}', St_SetSRID(St_GeomFromGeoJSON('${layerAdded}'), 4326))&api_key=32e6b633d2166f8a2229b83e83b5df7222248b7d`)
      // we transform the response from the Fetch API into a JSON format
      .then((resp) => resp.json())

      .then((response) => {
          // we get the data from the request response
          console.log(response.rows[0])
      })
      .catch(function (error) {
          // check if the request is returning an error
          console.log(error)
      });
      lc.stop()
      map.invalidateSize()
      traildropdown.selectedOption = null
      issueDropdown.selectedOption = null
      document.getElementById("descriptionInput").value = ''
      L.drawControl.remove();

    };
  }





   function onLocationFound(e) {
         var radius = e.accuracy / 2;

         console.log(e.latlng);



         found = e.latlng
         console.log("found=", found);

         var coords = Object.values(found)
         var lat = coords[0];
         var long = coords[1];

         console.log(lat + " , " + long);

         var geomstring = long + " , " + lat;

         var trailoption = traildropdown.selectedOption;
         var issueoption = issuedropdown.selectedOption;
         var description = document.getElementById("descriptionInput").value;


         var today = new Date();
         var dd = String(today.getDate()).padStart(2, '0');
         var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
         var yyyy = today.getFullYear();

         today = mm + '/' + dd + '/' + yyyy;
         if (trailoption !== null && issueoption !== null){
           fetch(`

             https:armiller34.cartodb.com/api/v2/sql?q=INSERT INTO trailreport (reporttype, description, date, trailname, the_geom) VALUES ('${issueoption}','${description}','${today}','${trailoption}', ST_SetSRID(ST_Point(${geomstring}),4326))&api_key=32e6b633d2166f8a2229b83e83b5df7222248b7d`
           )
           // we transform the response from the Fetch API into a JSON format
           .then((resp) => resp.json())

           .then((response) => {
               // we get the data from the request response
               console.log(response.rows[0])
           })
           .catch(function (error) {
               // check if the request is returning an error
               console.log(error)
           });
           lc.stop()
           map.invalidateSize()
           traildropdown.selectedOption = null
           issueDropdown.selectedOption = null
           document.getElementById("descriptionInput").value = ''
       }



     }

     function onLocationError(e) {
         alert(e.message);
     }


  //    map.on('locationfound', onLocationFound);
  //    map.on('locationerror', onLocationError);
  //    map.on(L.Draw.Event.CREATED, onDraw);
  //
  //
  //
  //
  //
  //
  //
  //
  // client.addLayers([trailsLayer, sitesLayer, parkingLayer, facilityLayer, trailreportLayer]);
  //
  // client.getLeafletLayer().addTo(map);

  function openPopup(featureEvent) {
    let content = '<div class="widget">';

    if (featureEvent.data.length) {
      content += `<h2 class="h2">${featureEvent.data.trailname}</h2>`;
    }

    if (featureEvent.data.sitename) {
      content += `<h2 class="h2">${featureEvent.data.sitename}</h2>`;
    }
      if (featureEvent.data.activity) {
        content += `<li><h3>Activity:</h3><p class="open-sans">${featureEvent.data.activity}</p></li>`;
      }




    if (featureEvent.data.parkingid) {
      content += `<h2 class="h2">Parking Lot for Trailhead</h2>`;
    }
      if (featureEvent.data.trailheadname) {
        content += `<li><h3>Trail Name</h3><p class="open-sans">${featureEvent.data.trailheadname}</p></li>`;
      }

    if (featureEvent.data.facname) {
      content += `<h2 class="h2">${featureEvent.data.facname}</h2>`;
    }
      if (featureEvent.data.factype) {
        content += `<li><h3>Facility Type:</h3><p class="open-sans">${featureEvent.data.factype}</p></li>`;
      }


    if (featureEvent.data.reporttype) {
      content += `<h2 class="h2">${featureEvent.data.reporttype}</h2>`;
    }
      if (featureEvent.data.description) {
        content += `<li><h3>Report Description:</h3><p class="open-sans">${featureEvent.data.description}</p></li>`;
      }
      if (featureEvent.data.date) {
        date = featureEvent.date.date.toString();
        content += `<li><h3>Date Reported:</h3><p class="open-sans">${date}</p></li>`;
      }

    if (featureEvent.data.length || featureEvent.data.difficulty) {
      content += `<ul>`;

      if (featureEvent.data.length) {
        content += `<li><h3>Length (Miles)</h3><p class="open-sans">${featureEvent.data.length}</p></li>`;
      }

      if (featureEvent.data.difficulty) {
        content += `<li><h3>Difficulty</h3><p class="open-sans">${featureEvent.data.difficulty}</p></li>`;
      }



      content += `</ul>`;
    }

    content += `</div>`;

    popup.setContent(content);
    popup.setLatLng(featureEvent.latLng);
    if (!popup.isOpen()) {
      popup.openOn(map);
    }
  }

  function closePopup(featureEvent) {
    popup.removeFrom(map);
  }


});



function applyFilter(filter,choice,source){
  var option = dropdown.selectedOption;
  console.log(option)
  console.log(choice)
  if (choice == 'test'){
    //const difficultyFilter = new carto.filter.Category('difficulty', { in:event.detail});
    filter.setFilters(option);
    source.addFilter(filter);
    choice = option
    console.log(choice);
    const trailsStyle = new carto.style.CartoCSS(`
      #layer {
        line-color: #3EBCAE;
        line-width: 1.5;
        line-opacity: 1;
      }
    `);
    const trailsLayer = new carto.layer.Layer(source, trailsStyle, {
        featureOverColumns:['trailname','length','difficulty']
    });
    return[choice,filter,source];
  } else if (choice !== option){
      //difficultyFilter.setFilters('difficulty', { in:event.detail});
      filter.resetFilters();
      filter.setFilters(option);
      source.addFilter(filter);
      choice = option;
      console.log(choice);
      const trailsStyle = new carto.style.CartoCSS(`
        #layer {
          line-color: #3EBCAE;
          line-width: 1.5;
          line-opacity: 1;
        }
      `);
      const trailsLayer = new carto.layer.Layer(source, trailsStyle, {
          featureOverColumns:['trailname','length','difficulty']
      });
      return[choice,filter,source];

  }
}


function showMap(event) {
  showLeftPanel(false);
  showRightPanel(false);
  showLegendsPanel(false);
  showBottomPanel(false);
  setActiveTab(event.target);
}

function showLeft(event) {
  showLeftPanel(true);
  showRightPanel(false);
  showLegendsPanel(false);
  showBottomPanel(false);
  setActiveTab(event.target);
}

function showRight(event) {
  showLeftPanel(false);
  showRightPanel(true);
  showLegendsPanel(false);
  showBottomPanel(false);
  setActiveTab(event.target);
}

function showLegends(event) {
  console.log('show legends');
  showLeftPanel(false);
  showRightPanel(false);
  showLegendsPanel(true);
  showBottomPanel(false);
  setActiveTab(event.target);
}

function showBottom(event) {
  showLeftPanel(false);
  showRightPanel(false);
  showLegendsPanel(false);
  showBottomPanel(true);
  setActiveTab(event.target);
}

function showLeftPanel(visible) {
  showPanel('as-sidebar--left', visible, 'as-sidebar--visible');
}

function showRightPanel(visible) {
  showPanel('as-sidebar--right', visible, 'as-sidebar--visible');
}

function showLegendsPanel(visible) {
  showPanel('as-map-panels', visible);
}

function showBottomPanel(visible) {
  showPanel('as-map-footer', visible);
}

function showPanel(className, visible, visibleClassName) {
  var element = document.querySelector(`.${className}`)

  if (!element) {
    return;
  }

  var visibleClass = visibleClassName || (className + '--visible');
  visible
    ? element.classList.add(visibleClass)
    : element.classList.remove(visibleClass);
}

function setActiveTab(target) {
  document.querySelector('.as-toolbar-tabs .as-tabs__item--active').classList.remove('as-tabs__item--active');
  target.classList.add('as-tabs__item--active');
}

function _toggleDrawer() {
  document.querySelector('.as-toolbar__actions').classList.toggle('as-toolbar__actions--visible');
}

function createTrails(source){
  const trailsStyle = new carto.style.CartoCSS(`
    #layer {
      line-color: #3EBCAE;
      line-width: 1.5;
      line-opacity: 1;
    }
  `);
  const trailsLayer = new carto.layer.Layer(source, trailsStyle, {
      featureOverColumns:['trailname','length','difficulty']
  });

  trailsLayer.off('featureOver');
  trailsLayer.off('featureOut');
  trailsLayer.on('featureClicked', openPopup);

  return(source);
}


// function openPopup(featureEvent) {
//   let content = '<div class="widget">';
//
//   if (featureEvent.data.length) {
//     content += `<h2 class="h2">${featureEvent.data.trailname}</h2>`;
//   }
//
//   if (featureEvent.data.sitename) {
//     content += `<h2 class="h2">${featureEvent.data.sitename}</h2>`;
//   }
//     if (featureEvent.data.activity) {
//       content += `<li><h3>Activity:</h3><p class="open-sans">${featureEvent.data.activity}</p></li>`;
//     }
//
//
//
//
//   if (featureEvent.data.parkingid) {
//     content += `<h2 class="h2">Parking Lot for Trailhead</h2>`;
//   }
//
//   if (featureEvent.data.facname) {
//     content += `<h2 class="h2">${featureEvent.data.facname}</h2>`;
//   }
//     if (featureEvent.data.factype) {
//       content += `<li><h3>Facility Type:</h3><p class="open-sans">${featureEvent.data.factype}</p></li>`;
//     }
//
//
//   if (featureEvent.data.reporttype) {
//     content += `<h2 class="h2">${featureEvent.data.reporttype}</h2>`;
//   }
//     if (featureEvent.data.description) {
//       content += `<li><h3>Report Description:</h3><p class="open-sans">${featureEvent.data.description}</p></li>`;
//     }
//     if (featureEvent.data.date) {
//       date = featureEvent.date.date.toString();
//       content += `<li><h3>Date Reported:</h3><p class="open-sans">${date}</p></li>`;
//     }
//
//   if (featureEvent.data.length || featureEvent.data.difficulty) {
//     content += `<ul>`;
//
//     if (featureEvent.data.length) {
//       content += `<li><h3>Length (Miles)</h3><p class="open-sans">${featureEvent.data.length}</p></li>`;
//     }
//
//     if (featureEvent.data.difficulty) {
//       content += `<li><h3>Difficulty</h3><p class="open-sans">${featureEvent.data.difficulty}</p></li>`;
//     }
//
//
//
//     content += `</ul>`;
//   }
//
//   content += `</div>`;
//
//   popup.setContent(content);
//   popup.setLatLng(featureEvent.latLng);
//   if (!popup.isOpen()) {
//     popup.openOn(map);
//   }
// }
//
// function closePopup(featureEvent) {
//   popup.removeFrom(map);
// }

function showFilter() {
  var filterbox = document.getElementById("filterBox");
  var infobox = document.getElementById("infoBox");
  var reportbox = document.getElementById("reportBox");
  if (filterbox.style.display === "none") {
    filterbox.style.display = "block";
  }
  if (infobox.style.display === "block") {
    infobox.style.display = "none";
  } else {
    infobox.style.display = "none";
  }
  if (reportbox.style.display === "block") {
    reportbox.style.display = "none";
  } else {
    reportbox.style.display = "none";
  }
}

function showInfo() {
  var infobox = document.getElementById("infoBox");
  var filterbox = document.getElementById("filterBox");
  var reportbox = document.getElementById("reportBox");
  if (infobox.style.display === "none") {
    infobox.style.display = "block";
  }
  if (filterbox.style.display === "block") {
    filterbox.style.display = "none";
  } else {
    filterbox.style.display = "none";
  }
  if (reportbox.style.display === "block") {
    reportbox.style.display = "none";
  } else {
    reportbox.style.display = "none";
  }
}

function showReport() {
  var infobox = document.getElementById("infoBox");
  var filterbox = document.getElementById("filterBox");
  var reportbox = document.getElementById("reportBox");
  if (reportbox.style.display === "none") {
    reportbox.style.display = "block";
  }
  if (filterbox.style.display === "block") {
    filterbox.style.display = "none";
  } else {
    filterbox.style.display = "none";
  }
  if (infobox.style.display === "block") {
    infobox.style.display = "none";
  } else {
    infobox.style.display = "none";
  }
}

function sendReport(){
  //https://armiller34.cartodb.com/api/v2/sql?q=SELECT COUNT(*) FROM trails&api_key=32e6b633d2166f8a2229b83e83b5df7222248b7d`
  // request to CARTO account using the Fetch API
  fetch(`

    https:armiller34.cartodb.com/api/v2/sql?q=INSERT INTO trailreport (reporttype, description, reportid, date, trailname, the_geom) VALUES ('Water Damage','Water Everywhere','R124','11/1/2020','Bob Winters', ST_SetSRID(ST_Point(-96.713, 42.60),4326))&api_key=32e6b633d2166f8a2229b83e83b5df7222248b7d`
  )
  // we transform the response from the Fetch API into a JSON format
  .then((resp) => resp.json())

  .then((response) => {
      // we get the data from the request response
      console.log(response.rows[0])
  })
  .catch(function (error) {
      // check if the request is returning an error
      console.log(error)
  });
  //https://armiller34.cartodb.com/api/v2/sql?q=INSERT INTO test_table (column_name, column_name_2, the_geom) VALUES ('this is a string', 11, ST_SetSRID(ST_Point(-110, 43),4326))&api_key=32e6b633d2166f8a2229b83e83b5df7222248b7d""
}
