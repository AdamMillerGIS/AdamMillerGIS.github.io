/* Map of GeoJSON data from MegaCities.geojson */
//l.mapbox.accessToken = 'pk.eyJ1IjoiYXJtaWxsZXIzNCIsImEiOiJjajZ6cW4yam8wM3c2Mnhxbmh6Mnc1OGszIn0.5rdbrjGFmUv2Pw94FQTCtQ'
//function to instantiate the Leaflet map
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

    // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    // }).addTo(map);

    //call getData function
    getData(map);
};

//function to create the legend
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

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //array of circle names to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            //Step 2: loop to add each circle and text to svg string
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

    map.addControl(new LegendControl());

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

      //Step 3: assign the cy and r attributes
      $('#'+key).attr({
          cy: 59 - radius,
          r: radius
      });

      //Step 4: add legend text
      $('#'+key+'-text').text(circleValues[key] + " Vehicles /1000");

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
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

    ///event listeners to open popup on hover and fill panel on click...Example 2.5 line 4
   layer.on({
       mouseover: function(){
           this.openPopup();
       },
       mouseout: function(){
           this.closePopup();
       },
       click: function(){
           $("#panel").html(popupContent);
       }
   });

   filter(layer)
   //return the circle marker to the L.geoJson pointToLayer option
   return layer;
};



//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
      pointToLayer: function(feature, latlng){
          return pointToLayer(feature, latlng, attributes);
      }
  }).addTo(map);
};

//Step 1: Create new sequence controls
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


    //Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/rewind.svg">');
    $('#forward').html('<img src="img/forward.svg">');

    //Step 5: click listener for buttons
    $('.skip').click(function(){
           //get the old index value
           var index = $('.range-slider').val();

           //Step 6: increment or decrement depending on button clicked
           if ($(this).attr('id') == 'forward'){
               index++;
               //Step 7: if past the last attribute, wrap around to first attribute
               index = index > 3 ? 0 : index;
           } else if ($(this).attr('id') == 'reverse'){
               index--;
               //Step 7: if past the first attribute, wrap around to last attribute
               index = index < 0 ? 3 : index;
           };

           //Step 8: update slider
           $('.range-slider').val(index);

           //Called in both skip button and slider event listener handlers
            //Step 9: pass new attribute to update symbols
            updatePropSymbols(map, attributes[index]);
       });

//Step 5: input listener for slider
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



//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
      //Example 3.16 line 4
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

function filter(layer){
  console.log()
  $('.menu-ui a').on('click', function() {
      // For each filter link, get the 'data-filter' attribute value.
      var filter = $(this).data('filter');
      $(this).addClass('active').siblings().removeClass('active');
      layer.setFilter(function(f) {
          // If the data-filter attribute is set to "all", return
          // all (true). Otherwise, filter on markers that have
          // a value set to true based on the filter name.
          return (filter === 'all') ? true : f.properties[filter] === true;
      });
      return false;
  });

};
//function layerControl(map,layer1,layer2){

//}
//Above Example 3.8...Step 3: build an attributes array from the data
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

//Step 2: Import GeoJSON data
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
        }
    });


};




$(document).ready(createMap);
