/* Map of GeoJSON data from MegaCities.geojson */


//function to create and add data to the map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [40, -98],
        zoom: 4
    });


    //add Stamen Toner base tilelayer
    L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
    }).addTo(map);


    //load symbol marker data and the chloropleth state layer to the map
    loadStates(map);
    getData(map);
};

//function to create the symbol markerlegend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //create attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="100px">';

            //array of circle names to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string

                svg += '<circle class="legend-circle" id="' + circle + '" fill="#E34132" fill-opacity="0.9" stroke="#000000" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';

            };

            //close svg string
            svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    //add the legend to the map
    map.addControl(new LegendControl());
    //run the updateLegend script to update the size of the circles and text
    updateLegend(map, attributes[0]);
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};


//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Electric Vehicles per 1000 in " + year;

    //replace legend content
    $('#temporal-legend').html("<b>" + content + "</b>");

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
      //get the radius
      var radius = calcPropRadius(circleValues[key]);

      //assign the cy and r attributes
      $('#'+key).attr({
          cy: 59 - radius,
          r: radius
      });

      //add legend text
      $('#'+key+'-text').text(circleValues[key].toFixed(1) + " Vehicles");

    };
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 100;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
   //Determine which attribute to visualize with proportional symbols
   var attribute = attributes[0];

   console.log(attribute)

   //create marker options
   var options = {
       fillColor: "#E34132",
       color: "#000",
       weight: 1,
       opacity: 1,
       fillOpacity: 0.9
   };

   //For each feature, determine its value for the selected attribute
   var attValue = Number(feature.properties[attribute]);

   //Give each feature's circle marker a radius based on its attribute value
   options.radius = calcPropRadius(attValue);

   //create circle marker layer
   var layer = L.circleMarker(latlng, options);



   //build popup content string
   var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p>";

   var year = attribute.split("_")[1];
   popupContent +=  "<p><b>Electric Vehicles per 1000 in:</b></p> "
   popupContent += "<p><b> " + year + ":</b> " + feature.properties[attribute] + "</p>";

   //bind the popup to the circle marker
   layer.bindPopup(popupContent, {
    offset: new L.Point(0,-options.radius)
    });

   //event listeners to open popup on hover
    layer.on({
        click: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

   //return the circle marker to the L.geoJson pointToLayer option
   return layer;
};



// Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
  //create a Leaflet GeoJSON layer and add it to the map
   L.geoJson(data, {
      pointToLayer: function(feature, latlng){
          return pointToLayer(feature, latlng, attributes);
      }
  }).addTo(map);

};

//function to add the title to topright corner of the page
function createTitle(map){
  var logo = L.control({position: 'topright'});
  logo.onAdd = function(map){
      var div = L.DomUtil.create('div', 'title-img');
      div.innerHTML= "<img src='img/title.png'/>";
      return div;
  }
  logo.addTo(map);
}

//Create new sequence controls
function createSequenceControls(map,attributes){

    var SequenceControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },

      onAdd: function (map) {
        // create the control container div with a particular class name
        var container = L.DomUtil.create('div', 'sequence-control-container');

        //kill any mouse event listeners on the map
        $(container).on('mousedown dblclick', function(e){
            L.DomEvent.stopPropagation(e);
            L.DomEvent.disableClickPropagation(container);
        });

        // ... initialize other DOM elements, add listeners, etc.
        //create range input element (slider)
        $(container).append('<input class="range-slider" type="range">');

        //add skip buttons
        $(container).append('<button class="skip" id="reverse" title="reverse">Reverse</button>');
        $(container).append('<button class="skip" id="forward" title="forward">Skip</button>');



        return container;
      }
      });

    map.addControl(new SequenceControl());
    //create range input element (slider)

    //set slider attributes
    $('.range-slider').attr({
    max: 3,
    min: 0,
    value: 0,
    step: 1
    });


    //replace button content with images
    $('#reverse').html('<img src="img/rewind.svg">');
    $('#forward').html('<img src="img/forward.svg">');

    //click listener for buttons
    $('.skip').click(function(){
           //get the old index value
           var index = $('.range-slider').val();

           //increment or decrement depending on button clicked
           if ($(this).attr('id') == 'forward'){
               index++;
               //if past the last attribute, wrap around to first attribute
               index = index > 3 ? 0 : index;
           } else if ($(this).attr('id') == 'reverse'){
               index--;
               //if past the first attribute, wrap around to last attribute
               index = index < 0 ? 3 : index;
           };

           //update slider
           $('.range-slider').val(index);

           //Called in both skip button and slider event listener handlers
            //pass new attribute to update symbols
            updatePropSymbols(map, attributes[index]);
       });

//input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        //Called in both skip button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);

        console.log(index)
        console.log(attributes)
    });
};



//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){

       if (layer.feature && layer.feature.properties[attribute]){
           //access feature properties
           var props = layer.feature.properties;

           //update each feature's radius based on new attribute values
           var radius = calcPropRadius(props[attribute]);
           layer.setRadius(radius);

           //add city to popup content string
           var popupContent = "<p><b>State:</b> " + props.State + "</p>";

           //add formatted attribute to panel content string
           var year = attribute.split("_")[1];
           popupContent +=  "<p><b>Electric Vehicles per 1000 in:</b></p> "
           popupContent += "<p><b> " + year + ":</b> " + props[attribute] + "</p>";

           //replace the layer popup
           layer.bindPopup(popupContent, {
               offset: new L.Point(0,-radius)
           });
       };
     });
     updateLegend(map,attribute)

};


// build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("V") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/ElectricVehicles.geojson", {
        dataType: "json",
        success: function(response){

            //create an attributes Array
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map,attributes);
            createLegend(map,attributes);
            createTitle(map);
        }
    });

};


//function to assign color to the chloropleth map categories
function getColor(d) {
    return d > 25 ? '#2171b5' :
           d > 15  ? '#6baed6' :
           d > 5  ? '#bdd7e7'  :
           d > 0  ? '#eff3ff' :
                    '#eff3ff';
};

//function to set the style for the states chloropleth layer
function styleStates(feature){
  return{
      fillColor: getColor(feature.properties.INCENTIVES),
      weight: 1,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.4
  };
};




//function to load the states layer
function loadStates(map){
//load the geosjon and assign it to the states variable
  $.getJSON("data/states.geojson")
  	 .done(function(data) {
      var states =  L.geoJson(data, {style: styleStates});
      //create an overlays & baselayers variable
      var overlays = {
        "Electric Vehicle Incentives": states};
      var baseLayers;
      //create layer control in the top right of the page
      L.control.layers(baseLayers,overlays).addTo(map);

    //create a chloropleth legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
        states = [0, 5, 15, 25],
        labels = [];

  //create a heading for the legend
  div.innerHTML = "<h4> Incentives for <br> Electric Cars </h4>"
    // loop through the incentives intervals and generate a label with a colored square for each interval
    for (var i = 0; i < states.length; i++) {
        div.innerHTML +=

            '<i style="background:' + getColor(states[i] + 1) + '"></i> ' +
            states[i] + (states[i + 1] ? '&ndash;' + states[i + 1] + '<br>'+ '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);
  })
};


//create the map
$(document).ready(createMap);
