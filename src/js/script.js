// When the window has finished loading create our google map below
if (typeof google) {
  google.maps.event.addDomListener(window, 'load', init);
  var map;

  function init() {
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var mapOptions = {
      // How zoomed in you want the map to start at (always required)
      zoom: 11,

      // The latitude and longitude to center the map (always required)
      center: new google.maps.LatLng(4.710989, -74.072092), // New York

      // How you would like to style the map.
      // This is where you would paste any style found on Snazzy Maps.
      styles: [
        {
          "featureType": "administrative",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#444444"
            }
          ]
        },
        {
          "featureType": "landscape",
          "elementType": "all",
          "stylers": [
            {
              "color": "#f2f2f2"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "all",
          "stylers": [
            {
              "saturation": -100
            },
            {
              "lightness": 45
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "simplified"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "all",
          "stylers": [
            {
              "color": "#46bcec"
            },
            {
              "visibility": "on"
            }
          ]
        }
      ]
    };

    // Get the HTML DOM element that will contain your map
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map');
    if (!mapElement) return;
    // Create the Google Map using our element and options defined above
    map = new google.maps.Map(mapElement, mapOptions);
  }
}
var calendarActiveMonth, calendarEvents = [];
// The publicaciones toggles
$(document).ready(function () {
  // Get the events
  getEvents();

  var dates = new DateUtilFunctions();

  // The container where the months get into
  var monthsContainer = $('.calendar__months-container');
  monthsContainer.append('<ul />');
  var monthsContainerList = monthsContainer.find('ul');

  // First create an array of months where we later loop through
  var months = dates.getNext12MonthNamesWithYear();

  // Create the months inside the container
  $.each(months, function (index) {
    var month = months[index];
    var li = $('<li class="calendar__month" data-month="' + month.number + '">');
    var button = $('<button class="calendar__month__button">' + month.name + '</button>');
    button.click(function () {
      activateMonth(month)
    });
    li.append(button);
    monthsContainerList.append(li);
  });

  activateMonth(months[0]);


  $('.publicacion').each(function () {
    var $this = $(this);
    $this.find('.publicacion-toggle').click(function () {
      $this.toggleClass('publicacion--active');
      $this.find('.publicaciones__content').slideToggle(400);
    });
  });

  $('.dia-evento').click(function () {
    $('.dia-evento').not($(this)).removeClass('dia-evento--active');
    $(this).toggleClass('dia-evento--active');
  });
});

function getEvents() {
  var url = 'https://clients6.google.com/calendar/v3/calendars/tnt5vs3ereq39hd4km1jdphjao@group.calendar.google.com/events?calendarId=tnt5vs3ereq39hd4km1jdphjao%40group.calendar.google.com&singleEvents=true&timeZone=America%2FBogota&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2017-05-29T00%3A00%3A00-05%3A00&timeMax=2020-07-03T00%3A00%3A00-05%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs';
  $.get(url)
    .done(function (data) {
      var events = {};
      $.each(data.items, function (index) {
        var item = data.items[index];
        var start = (item.start.date) ? item.start.date : item.start.dateTime;
        start = (start.length === 10) ? start + 'T00:00:00-05:00' : start;
        var date = new Date(start);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (!events[year]) events[year] = {};
        if (!events[year][month]) events[year][month] = {};
        if (!events[year][month][day]) events[year][month][day] = [];

        item.startTime = start;
        events[year][month][day].push(item);
      });
      calendarEvents = events;
      createDays();
    });
}

function createDays() {
  var month = calendarActiveMonth;
  var year = month.year;
  var number = month.number;
  var numberOfDays = month.days;
  var daysContainer = $('.calendar__days-container');

  var events = [];
  if (calendarEvents[year]) {
    if (calendarEvents[year][number]) events = calendarEvents[year][number];
  }

  // Remove the old days
  daysContainer.empty();

  // Create a list inside
  daysContainer.append('<ul />');

  var list = daysContainer.find('ul');

  for (var i = 0; i < numberOfDays; i++) {
    var day = i + 1;
    var dayContent = $('<li />').addClass('calendar__day');
    if (events[day]) {
      dayContent.addClass('calendar__day--has-event');

      var button = $('<button class="calendar__day__button">' + day + '</button>');
      button.click(openEvent.bind(false, dayContent));
      dayContent.append(button);

      var eventsWrap = $('<div class="calendar__events"></div>');

      $.each(events[day], function (index) {
        var event = events[day][index];
        var title = (event.summary) ? event.summary : '';
        var location = (event.location) ? event.location : '';
        var rDate = event.startTime;
        var date = formatDate(new Date(rDate));
        // console.log(rDate, date);
        var description = (event.description) ? event.description : '';
        var eventEl = $('<div class="calendar__events__event"><h5>' + date + '</h5><h3>' + title + '</h3><h5>' + location + '</h5><p>' + description +'</p></div>');
        eventsWrap.append(eventEl);
      });

      dayContent.append(eventsWrap);
    } else {
      dayContent.append(day);
    }
    list.append(dayContent);
  }
}


function formatDate(date) {
  var dayNames = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];
  var monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var dayIndex = date.getDay();

  return dayNames[dayIndex - 1] + ' ' + day + ' de ' + monthNames[monthIndex];
}

function openEvent(element) {
  $('.calendar__day').not(element).removeClass('calendar__day--open');
  element.toggleClass('calendar__day--open');
}

function activateMonth(month) {
  calendarActiveMonth = month;
  $('.calendar__month').removeClass('calendar__month--active');
  $('.calendar__month[data-month="' + month.number + '"]').addClass('calendar__month--active');
  createDays();
}

function DateUtilFunctions() {
  var self = this;

  var monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  self.getNext12MonthNamesWithYear = function () {
    var months = [];
    var tmpDate = new Date();
    var tmpYear = tmpDate.getFullYear();
    var tmpMonth = tmpDate.getMonth();
    var monthLiteral, daysInMonth;

    for (var i = 0; i < 12; i++) {
      tmpDate.setMonth(tmpMonth + i);
      tmpDate.setFullYear(tmpYear);
      monthLiteral = monthNames[tmpMonth];
      daysInMonth = new Date(tmpYear, tmpMonth + 1, 0).getDate();

      months.push({ name: monthLiteral, year: tmpYear, days: daysInMonth, number: tmpMonth + 1 });

      tmpYear = (tmpMonth === 11) ? tmpYear + 1 : tmpYear;
      tmpMonth = (tmpMonth === 11) ? 0 : tmpMonth + 1;
    }

    return months;
  };
}