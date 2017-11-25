function OWMREQURL(longitude, latitude) {
  APP_ID = 'b0b5dd304d1528eb307b1b266fccd3ab';

  REQUEST_URL = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${APP_ID}`;
  return REQUEST_URL;
}

function convertToF(value) {
  return (value * (9 / 5)) + 32;
}

function convertToC(value) {
  return (value - 32) * (5 / 9);
}

function humanize(x){
  return x.toFixed(1).replace(/\.?0*$/,'');
}

const app = {
  init() {
    view.init();
    model.init();
  },
  geo(callback) {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    function success(position) {
      const {longitude, latitude} = position.coords;

      callback({longitude, latitude})
    }

    function error() {
      console.error('Unable to retrieve your location');
    }

    navigator.geolocation.getCurrentPosition(success, error);
  },
  get(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.addEventListener('load', function() {
      const res = req.responseText;
      if (req.status < 400) {
        callback(res)
      } else {
        callback(null, new Error('Request failed: ' + res))
      }
    })
    req.addEventListener("error", function() {
      callback(null, new Error("Network error"));
    });
    req.send();
  },
  controller(obj) {
    this.model = obj;
    view.render();
  },
  icon(id, icon) {
    let result = '';
    if (id >= 200 && id < 300) {
      result = 'tstorms';
    } else if (id >= 300 && id < 400) {
      result = 'flurries';
    } else if (id >= 500 && id < 600) {
      result = 'rain';
    } else if (id >= 600 && id < 700) {
      result = 'snow';
    } else if (id >= 700 && id < 800) {
      result = 'fog';
    } else if (id == 800) {
      result = 'clear';
    } else if (id > 800 && id <= 900) {
      result = 'partlycloudy';
    } else {
      result = 'unknown';
    }
    return result;
  }
}

const model = {
  data: null,
  init() {
    this.render();
  },
  render() {
    app.geo((position) => {
      const {longitude:lon, latitude:lat} = position;
      const REQUEST_URL = OWMREQURL(lon, lat);

      app.get(REQUEST_URL, (res, err) => {
        if (!err) {
          this.data = JSON.parse(res);
          app.controller(this.data);
        } else {
          console.error(err);
        }
      });
    });
  }
};

const view = {
  init() {
    this.iconView = document.querySelector('.weather__icon i');
    this.tempView = document.querySelector('.js-temperature');
    this.locaView = document.querySelector('.weather__location');
    this.descView = document.querySelector('.weather__description');

    // this will only work once now
    this.loadView = document.querySelector('.js-loader');
    let tempTogl = document.querySelectorAll('.weather__temperature-toggler');
    tempTogl.forEach(function(btn, index) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        tempTogl.forEach(function(btn) {
          btn.classList.remove('weather__temperature-toggler--active');
        });
        e.target.classList.add('weather__temperature-toggler--active');

        const unit = btn.dataset.key;
        const currentTemp = view.tempView;
        const temperature = parseFloat(currentTemp.innerText);

        if (unit === 'c') {
          // if current temperature is already in c don't do anything
          if (currentTemp.dataset.unit === 'c') return;
          currentTemp.dataset.unit = 'c';
          currentTemp.innerText = humanize(convertToC(temperature));
        } else if (unit === 'f') {
          // if current temperature is already in f don't do anything
          if (currentTemp.dataset.unit === 'f') return;
          currentTemp.dataset.unit = 'f';
          currentTemp.innerText = humanize(convertToF(temperature));
        }
      })
    });
  },
  render() {
    const model = app.model;
    const iconId = model.weather[0].id;
    const temp = model.main.temp;
    const city = `${model.name}, ${model.sys.country}`;
    const desc = model.weather[0].main;
    this.loadView.style.display = 'none';
    this.tempView.innerText = temp;
    this.locaView.innerText = city;
    this.descView.innerText = desc;
    this.iconView.classList.add(`weather-icon--${app.icon(iconId)}`)
  }
};

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(function(position) {
  });
} else {
  console.error('this device doesnot support geolocation');
}

app.init();
