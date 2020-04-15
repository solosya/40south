(function ($) {

    $(document).ready(function() {



        Acme.Weather = function()
        {
            this.subscriptions = Acme.PubSub.subscribe({
                'Acme.weather_model.listener' : ["state_changed"]
            });
            this.listeners = {
                "weather-location": function(data) {
                    var urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('weather')){
                        this.location = urlParams.get('weather');
                    } else {
                        this.location = data['weather-location'].location;
                    }
                    this.fetch();
                }
            };
        };
        Acme.Weather.prototype = new Acme._Model();
        Acme.Weather.constructor = Acme.Weather;
        Acme.Weather.prototype.fetch = function()
        {
            var self = this;
            Acme.server.fetch('https://weather.pagemasters.com.au/weather?q=' + this.location)
                .done(function(r) {
                    self.data = r.data[0];
                    if (self.data.location.indexOf("Err:") == 0) {
                        localStorage.removeItem('weather-location');
                        localStorage.removeItem('weather-town');
                        
                    } else {
                        Acme.PubSub.publish("state_changed", {'weather-data': self});
                    }

                }).fail(function(r) {
                    console.log(r);
                });
        };
    
        Acme.WeatherHeader_View_Class = function()
        {
            this.data = null;
            this.town = null;
            this.subscriptions = Acme.PubSub.subscribe({
                'Acme.weather_view.listener' : ["state_changed"]
            });
            this.listeners = {
                "weather-location" : function(data) {
                    this.town = data.town;
                },
                "weather-data" : function(data) {
                    this.data = data['weather-data'];
                    return this.render();
                }
            };
        };
        Acme.WeatherHeader_View_Class.prototype = new Acme._View();
        Acme.WeatherHeader_View_Class.constructor = Acme.WeatherHeader_View;
        

                    // inherit from WeatherHeader_View_Class
                    Acme.WeatherHeader_View = function(config)
                    {
                        this.container = config.container || null;

                        this.templates = {
                            "forecast" : 
                                '<div class="weather-dropdown__container"> \
                                    <div class="weather-dropdown__day">{{{date}}}</div> \
                                    <div class="weather-dropdown__icon">{{{icon}}}</div> \
                                    <div class="weather-dropdown__temperature">{{temperature}}&#176; </div> \
                                    <div class="weather-dropdown__description">{{description}}</div> \
                                </div>'
                            ,
                            "weatherPanel" : 
                                '<div class="weather-panel"> \
                                    <div class="weather-panel__icon">{{{icon}}}</div> \
                                    <p class="weather-panel__location">{{location}}</p> \
                                    <div class="weather-panel__temperature">{{temperature}}&#176; </div> \
                                    <div class="weather-panel__description">{{description}}</div> \
                                    <div class="j-show-weather-forcast weather-panel__pulldown-icon"> \
                                        <div class="o-arrow"></div> \
                                    </div> \
                                </div> \
                                \
                                <div class="weather-dropdown hidden j-weather-panel-dropdown"> \
                                </div>'
                            ,
                            "weatherPanel1" : 
                                '<div class="weather-panel weather-panel-1"> \
                                    <div class="weather-panel__icon weather-panel__icon-1">{{{icon}}}</div> \
                                    <p class="weather-panel__location weather-panel__location-1">{{location}}</p> \
                                    <div class="weather-panel__temperature weather-panel__temperature-1">{{temperature}}&#176; </div> \
                                    <div class="weather-panel__description weather-panel__description-1">{{description}}</div> \
                                    <div class="j-show-weather-forcast weather-panel__pulldown-icon weather-panel__pulldown-icon-1"> \
                                        <span class="o-arrow"></span> \
                                    </div> \
                                </div> \
                                \
                                <div class="weather-dropdown weather-dropdown-1 hidden j-weather-panel-dropdown"> \
                                </div>'
                            ,
                            "weatherPanel2" : 
                                '<div class="weather-panel weather-panel-2"> \
                                    <div class="weather-panel__icon weather-panel__icon-2">{{{icon}}}</div> \
                                    <p class="weather-panel__location weather-panel__location-2">{{location}}</p> \
                                    <div class="weather-panel__temperature weather-panel__temperature-2">{{temperature}}&#176; </div> \
                                    <div class="weather-panel__description weather-panel__description-2">{{description}}</div> \
                                    <div class="j-show-weather-forcast  weather-panel__pulldown-icon weather-panel__pulldown-icon-2"> \
                                        <span class="o-arrow"></span> \
                                    </div> \
                                </div> \
                                \
                                <div class="weather-dropdown weather-dropdown-2 hidden j-weather-panel-dropdown"> \
                                </div>'
                            ,
                            "screenWeatherPanel" : 
                                '<div class="c-screen-weather"> \
                                    <p class="c-screen-weather__location">{{location}}<br/>Australia</p> \
                                    <div class="c-screen-weather__temperature">{{temperature}}&#176; </div> \
                                </div>'
                                
                    
                        };

                        this.events();
                    };
                    Acme.WeatherHeader_View.prototype = new Acme.WeatherHeader_View_Class();
                    Acme.WeatherHeader_View.constructor = Acme.WeatherHeader_View;

                    Acme.WeatherHeader_View.prototype.render= function()
                    {
                        var self = this;
                        // var local = this.localdata[0];
                        // var name = local.location.split('/')[1];
                        var data = this.data.data;
                        if (this.container.hasClass('c-header-1__weather-info')) {
                            var weatherTmp = Handlebars.compile(this.templates.weatherPanel1);
                        } else if (this.container.hasClass('c-header-2__weather-info')) {
                            var weatherTmp = Handlebars.compile(this.templates.weatherPanel2);
                        } else if (this.container.hasClass('screenweather')) {
                            var weatherTmp = Handlebars.compile(this.templates.screenWeatherPanel);
                        } else {
                            var weatherTmp = Handlebars.compile(this.templates.weatherPanel);
                        }
                        var forecastTmp = Handlebars.compile(this.templates.forecast);
                        var range = Math.round(data.day_high) + '&#176; - ' + Math.round(data.day_low) + '&#176;';


                        this.container.html(
                            weatherTmp( {
                                "icon": weatherIcons( data.icon ),
                                "location": data.location.split('/')[1],
                                "description" : data.description,
                                "temperature" : Math.round(data.temperature),
                                "date" : data.date,
                                "wind_speed" : data.wind_speed,
                                "range" : range
                            }
                        ));
                        

                        var forecast = data.daily.slice(0,7).map(function(data) {
                            var forRange = Math.round(data.day_low) + ' - ' + Math.round(data.day_high);
                            return forecastTmp({
                                "icon": weatherIcons( data.icon ),
                                "description" : weatherStatus( data.icon ),
                                "temperature" : forRange,
                                "date" : data.date.split(',')[0]
                            });
                        });

                        $('.j-weather-panel-dropdown').append(forecast);


                    };

                    Acme.WeatherHeader_View.prototype.events = function()
                    {
                        var self = this;
                        this.container.on("click", ".j-show-weather-forcast", function (e) {
                            $(this).toggleClass('weather-panel__pulldown-icon--active');
                            $('.j-weather-panel-dropdown').toggleClass('hidden');
                        });
                    };

            



        var weatherStatus = function(icon) {
            // we need to use the icon to generate the description for future forecasts, as they have a longer 'description' field
            switch(icon) {
            case 'clear-day':
            case 'clear-night':
                return 'Clear';
            case 'cloudy':
                return 'Cloudy';
            case 'fog':
                return 'Foggy';
            case 'partly-cloudy-day':
            case 'partly-cloudy-night':
                return 'Partly cloudy';
            case 'rain':
                return 'Rain';
            case 'sleet':
                return 'Sleet';
            case 'snow':
                return 'Snow';
            case 'stormy':
                return 'Stormy';
            case 'wind':
                return 'Windy';
            default:
                return icon;
            }
        }


        var weatherIcons = function(icon) {

            switch(icon) {
            case 'clear-day':
                return '<svg class="svg-fill" width="37" height="37" viewBox="0 0 37 37">' +
                    '<g fill-rule="evenodd">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M7.425 29.76L29.76 7.425M7.425 7.425L29.76 29.76M.43 18h36.325M18 .43v36.325"/>' +
                        '<path stroke="none" d="M18.593 6.977c6.414 0 11.615 5.2 11.615 11.616 0 6.414-5.2 11.615-11.615 11.615s-11.616-5.2-11.616-11.615 5.2-11.616 11.616-11.616"/>' +
                        '<path stroke="none" d="M18.593 10.176a8.418 8.418 0 1 1-.001 16.835 8.418 8.418 0 0 1 0-16.835"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M18.593 10.176a8.418 8.418 0 1 1-.001 16.835 8.418 8.418 0 0 1 0-16.835z"/>' +
                    '</g>' +
                '</svg>';
            case 'clear-night':
                return '<svg class="svg-fill" width="31" height="33" viewBox="0 0 31 33">' +
                    '<g fill-rule="evenodd" stroke-width=".5">' +
                        '<path d="M22.926 26.08a.425.425 0 0 0-.447-.178c-5.675.894-11.081-2.815-12.243-8.445-.581-2.681-.09-5.407 1.296-7.775a.484.484 0 0 0 0-.492.425.425 0 0 0-.447-.178l-.581.089c-6.3 1.296-10.367 7.507-9.071 13.807 1.206 5.541 6.077 9.34 11.484 9.34.804 0 1.608-.09 2.413-.269a11.863 11.863 0 0 0 7.64-5.407c.045-.134.045-.357-.044-.491M22.001 10c.418 1.078.81 1.977 1.11 2.906.172.536.476.808 1.01.95.58.155 1.14.383 1.879.638-.793.279-1.417.525-2.059.714-.398.117-.625.315-.763.71-.344.985-.739 1.953-1.172 3.082-.42-1.086-.82-2.027-1.144-2.991-.156-.464-.407-.702-.88-.83-.62-.166-1.218-.414-1.982-.682.718-.247 1.293-.482 1.889-.639.54-.142.834-.426 1.006-.956.303-.928.692-1.83 1.106-2.902M16.997 9c-.391-1.019-.772-1.927-1.084-2.858-.179-.536-.453-.861-1.036-1-.601-.141-1.175-.397-1.877-.644.805-.273 1.5-.474 2.162-.752.25-.105.511-.35.614-.594.424-1 .79-2.025 1.218-3.152.426 1.105.828 2.087 1.178 3.086.138.394.362.598.756.715.658.196 1.303.436 2.072.699-.748.258-1.387.5-2.04.695-.415.124-.657.333-.801.756-.338.99-.742 1.958-1.162 3.049M25.112 7.496c1.717-.314 2.326-1.393 2.655-2.726.048-.194.154-.375.291-.699.289.725.58 1.31.75 1.926.172.624.532.967 1.157 1.117.303.073.588.22.98.37-.175.086-.24.139-.312.15-1.249.204-1.867.988-2.124 2.14-.077.345-.254.669-.45 1.171-.29-.73-.585-1.307-.746-1.917-.172-.654-.55-1.008-1.2-1.161-.286-.068-.557-.203-1-.37"/>' +
                    '</g>' +
                '</svg>';
            case 'cloudy':
                return '<svg class="svg-fill" width="38" height="26" viewBox="0 0 38 26">' +
                    '<g fill-rule="evenodd">' +
                        '<path d="M11.9256172,15.9300118 C11.9256172,14.0310763 10.4121978,12.4929903 8.54349892,12.4929903 C6.6763914,12.4929903 5.1609828,14.0310763 5.1609828,15.9300118 C5.1609828,17.8277538 6.6763914,19.3670333 8.54349892,19.3670333 L35.6024344,19.3670333" id="Fill-1" fill="#FFFFFF"></path>' +
                        '<path d="M11.9256172,15.9300118 C11.9256172,14.0310763 10.4121978,12.4929903 8.54349892,12.4929903 C6.6763914,12.4929903 5.1609828,14.0310763 5.1609828,15.9300118 C5.1609828,17.8277538 6.6763914,19.3670333 8.54349892,19.3670333 L35.6024344,19.3670333" id="Stroke-3" stroke-width="0.5"></path>' +
                        '<path d="M2.07506344,16.3971667 L25.0576333,16.3971667 C25.0576333,16.3971667 28.4349774,16.2977043 28.4349774,12.3192097 C28.4349774,8.34071505 24.4950742,7.14716667 24.4950742,7.14716667 C24.4950742,7.14716667 24.0817086,0.198725806 16.0141172,0.198725806 C10.488386,0.198725806 9.30398817,5.95043548 9.30398817,5.95043548 C9.30398817,5.95043548 6.98731075,4.57865054 4.73667634,6.73976882 C2.56282688,8.82728495 3.48225699,10.6283495 3.48225699,10.6283495 C3.48225699,10.6283495 0.198805376,10.5702634 0.198805376,13.5127581 C0.198805376,15.4646075 1.60679462,16.3971667 2.07506344,16.3971667" id="Fill-5" fill="#FFFFFF"></path>' +
                        '<path d="M2.07506344,16.3971667 L25.0576333,16.3971667 C25.0576333,16.3971667 28.4349774,16.2977043 28.4349774,12.3192097 C28.4349774,8.34071505 24.4950742,7.14716667 24.4950742,7.14716667 C24.4950742,7.14716667 24.0817086,0.198725806 16.0141172,0.198725806 C10.488386,0.198725806 9.30398817,5.95043548 9.30398817,5.95043548 C9.30398817,5.95043548 6.98731075,4.57865054 4.73667634,6.73976882 C2.56282688,8.82728495 3.48225699,10.6283495 3.48225699,10.6283495 C3.48225699,10.6283495 0.198805376,10.5702634 0.198805376,13.5127581 C0.198805376,15.4646075 1.60679462,16.3971667 2.07506344,16.3971667 Z" id="Stroke-7" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
                        '<path d="M34.1085097,13.5716 L18.9050903,13.5716 C18.9050903,13.5716 16.6126817,13.5039656 16.6126817,10.8025677 C16.6126817,8.10116989 19.2870258,7.29075054 19.2870258,7.29075054 C19.2870258,7.29075054 20.0075312,3.33015914 24.2728753,3.33015914 C28.7387355,3.33015914 29.5694452,6.13857849 29.5694452,6.13857849 C29.5694452,6.13857849 31.5567032,5.07791183 33.4174452,6.71347097 C35.2781871,8.34863226 34.675843,9.65437419 34.675843,9.65437419 C34.675843,9.65437419 36.9045957,9.87120215 36.9045957,11.6129871 C36.9045957,13.1665892 35.4377247,13.5716 34.1085097,13.5716" id="Fill-9" fill="#FFFFFF"></path>' +
                        '<path d="M34.1085097,13.5716 L18.9050903,13.5716 C18.9050903,13.5716 16.6126817,13.5039656 16.6126817,10.8025677 C16.6126817,8.10116989 19.2870258,7.29075054 19.2870258,7.29075054 C19.2870258,7.29075054 20.0075312,3.33015914 24.2728753,3.33015914 C28.7387355,3.33015914 29.5694452,6.13857849 29.5694452,6.13857849 C29.5694452,6.13857849 31.5567032,5.07791183 33.4174452,6.71347097 C35.2781871,8.34863226 34.675843,9.65437419 34.675843,9.65437419 C34.675843,9.65437419 36.9045957,9.87120215 36.9045957,11.6129871 C36.9045957,13.1665892 35.4377247,13.5716 34.1085097,13.5716 Z" id="Stroke-11" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
                    '</g>' +
                '</svg>';
            case 'fog':
                return '<svg class="svg-fill" width="38" height="26" viewBox="0 0 38 26">' +
                    '<g fill-rule="evenodd">' +
                        '<path stroke-width=".5" d="M5.868 19h24.233M9.763 22h22.03M7.816 25h19.827"/>' +
                        '<path d="M2.827 16.772h22.378s3.288-.097 3.288-3.97c0-3.874-3.836-5.036-3.836-5.036S24.254 1 16.399 1c-5.38 0-6.533 5.6-6.533 5.6S7.61 5.265 5.418 7.37C3.302 9.4 4.197 11.155 4.197 11.155S1 11.1 1 13.964c0 1.9 1.37 2.808 1.827 2.808"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M2.827 16.772h22.378s3.288-.097 3.288-3.97c0-3.874-3.836-5.036-3.836-5.036S24.254 1 16.399 1c-5.38 0-6.533 5.6-6.533 5.6S7.61 5.265 5.418 7.37C3.302 9.4 4.197 11.155 4.197 11.155S1 11.1 1 13.964c0 1.9 1.37 2.808 1.827 2.808z"/>' +
                        '<path d="M34.588 13.893H19.785s-2.232-.066-2.232-2.696c0-2.63 2.604-3.42 2.604-3.42s.701-3.856 4.854-3.856c4.349 0 5.157 2.735 5.157 2.735s1.935-1.033 3.747.56c1.812 1.591 1.225 2.863 1.225 2.863s2.17.211 2.17 1.907c0 1.513-1.428 1.907-2.722 1.907"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M34.588 13.893H19.785s-2.232-.066-2.232-2.696c0-2.63 2.604-3.42 2.604-3.42s.701-3.856 4.854-3.856c4.349 0 5.157 2.735 5.157 2.735s1.935-1.033 3.747.56c1.812 1.591 1.225 2.863 1.225 2.863s2.17.211 2.17 1.907c0 1.513-1.428 1.907-2.722 1.907z"/>' +
                    '</g>' +
                '</svg>';
            case 'partly-cloudy-day':
                return '<svg class="svg-fill" width="38" height="28" viewBox="0 0 38 28">' +
                    '<defs>' +
                        '<path id="a" d="M36.282 18.688v7.238H4.826v-7.238z"/>' +
                    '</defs>' +
                    '<g fill-rule="evenodd">' +
                        '<path d="M12.816 23.307c0-2-1.564-3.62-3.495-3.62-1.929 0-3.495 1.62-3.495 3.62 0 1.998 1.566 3.619 3.495 3.619h27.961"/>' +
                        '<path stroke-width=".5" d="M12.816 23.307c0-2-1.564-3.62-3.495-3.62-1.929 0-3.495 1.62-3.495 3.62 0 1.998 1.566 3.619 3.495 3.619h27.961"/>' +
                        '<path stroke="none"  d="M2.939 23.745h23.748s3.49-.105 3.49-4.294c0-4.19-4.07-5.447-4.07-5.447s-.428-7.316-8.765-7.316c-5.71 0-6.933 6.056-6.933 6.056s-2.394-1.444-4.72.831c-2.246 2.199-1.296 4.095-1.296 4.095S1 17.61 1 20.708c0 2.055 1.455 3.037 1.939 3.037"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M2.939 23.745h23.748s3.49-.105 3.49-4.294c0-4.19-4.07-5.447-4.07-5.447s-.428-7.316-8.765-7.316c-5.71 0-6.933 6.056-6.933 6.056s-2.394-1.444-4.72.831c-2.246 2.199-1.296 4.095-1.296 4.095S1 17.61 1 20.708c0 2.055 1.455 3.037 1.939 3.037zM21.109 15.125L31.779 4.25M21.109 4.25l10.67 10.875M17.891 9h17.355M26 1v17.686"/>' +
                        '<path stroke="none"  d="M26.658 4.25c3.065 0 5.55 2.532 5.55 5.655 0 3.124-2.485 5.656-5.55 5.656s-5.55-2.532-5.55-5.656c0-3.123 2.485-5.655 5.55-5.655"/>' +
                        '<path stroke="none"  d="M26.739 5.875c2.22 0 4.021 1.835 4.021 4.098s-1.8 4.098-4.021 4.098c-2.22 0-4.022-1.835-4.022-4.098s1.801-4.098 4.022-4.098"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M26.739 5.875c2.22 0 4.021 1.835 4.021 4.098s-1.8 4.098-4.021 4.098c-2.22 0-4.022-1.835-4.022-4.098s1.801-4.098 4.022-4.098z"/>' +
                    '</g>' +
                '</svg>';
            case 'partly-cloudy-night':
                return '<svg class="svg-fill" width="33" height="28" viewBox="0 0 33 28">' +
                    '<g fill-rule="evenodd">' +
                        '<path stroke-width=".5" d="M31.926 18.08a.425.425 0 0 0-.447-.178c-5.675.894-11.081-2.815-12.243-8.445-.581-2.681-.09-5.407 1.296-7.775a.484.484 0 0 0 0-.492.425.425 0 0 0-.447-.178l-.581.089c-6.3 1.296-10.367 7.507-9.071 13.807 1.206 5.541 6.077 9.34 11.484 9.34.804 0 1.608-.09 2.413-.269a11.863 11.863 0 0 0 7.64-5.407c.045-.134.045-.357-.044-.491"/>' +
                        '<path d="M3.831 27.212H19.62S22 27.142 22 24.337c0-2.806-2.777-3.647-2.777-3.647s-.748-4.113-5.178-4.113c-4.637 0-5.5 2.916-5.5 2.916s-2.064-1.101-3.996.597-1.307 3.054-1.307 3.054-2.314.226-2.314 2.034c0 1.614 1.523 2.034 2.903 2.034"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M3.831 27.212H19.62S22 27.142 22 24.337c0-2.806-2.777-3.647-2.777-3.647s-.748-4.113-5.178-4.113c-4.637 0-5.5 2.916-5.5 2.916s-2.064-1.101-3.996.597-1.307 3.054-1.307 3.054-2.314.226-2.314 2.034c0 1.614 1.523 2.034 2.903 2.034z"/>' +
                    '</g>' +
                '</svg>';
            case 'rain':
                return '<svg class="svg-fill" width="33" height="28" viewBox="0 0 33 28">' +
                    '<g fill-rule="evenodd">' +
                        '<path d="M1.87625806,16.1984409 L24.858828,16.1984409 C24.858828,16.1984409 28.236172,16.0989785 28.236172,12.1204839 C28.236172,8.14198925 24.2962688,6.94844086 24.2962688,6.94844086 C24.2962688,6.94844086 23.8829032,0 15.8153118,0 C10.2895806,0 9.1051828,5.75170968 9.1051828,5.75170968 C9.1051828,5.75170968 6.78850538,4.37992473 4.53787097,6.54104301 C2.36402151,8.62855914 3.28345161,10.4296237 3.28345161,10.4296237 C3.28345161,10.4296237 0,10.3715376 0,13.3140323 C0,15.2658817 1.40798925,16.1984409 1.87625806,16.1984409" id="Fill-5" fill="#FFFFFF"></path>' +
                        '<path d="M1.87625806,16.1984409 L24.858828,16.1984409 C24.858828,16.1984409 28.236172,16.0989785 28.236172,12.1204839 C28.236172,8.14198925 24.2962688,6.94844086 24.2962688,6.94844086 C24.2962688,6.94844086 23.8829032,0 15.8153118,0 C10.2895806,0 9.1051828,5.75170968 9.1051828,5.75170968 C9.1051828,5.75170968 6.78850538,4.37992473 4.53787097,6.54104301 C2.36402151,8.62855914 3.28345161,10.4296237 3.28345161,10.4296237 C3.28345161,10.4296237 0,10.3715376 0,13.3140323 C0,15.2658817 1.40798925,16.1984409 1.87625806,16.1984409 Z" id="Stroke-7" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
                        '<path d="M10.6338807,24.4821958 L12.5066314,19.6524613" id="Stroke-14" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
                        '<path d="M11.5,28.5 L15.81384,19.6524613" id="Stroke-20" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
                        '<path d="M17.248243,24.4821958 L19.1209937,19.6524613" id="Stroke-26" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
                    '</g>' +
                '</svg>';
            case 'sleet':
                return '<svg class="svg-fill" width="31" height="30" viewBox="0 0 31 30">' +
                    '<g fill-rule="evenodd">' +
                        '<path d="M3.827 16.772h22.378s3.288-.097 3.288-3.97c0-3.874-3.836-5.036-3.836-5.036S25.254 1 17.399 1c-5.38 0-6.533 5.6-6.533 5.6S8.61 5.265 6.418 7.37C4.302 9.4 5.197 11.155 5.197 11.155S2 11.1 2 13.964c0 1.9 1.37 2.808 1.827 2.808"/>' +
                        '<path stroke-width=".5" d="M1 20l4 4M1 24l4-4M7 26l4 4M7 30l4-4M13.5 20l4 4M13.5 24l4-4M26 20l4 4M26 24l4-4M20 26l4 4M20 30l4-4"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M3.827 16.772h22.378s3.288-.097 3.288-3.97c0-3.874-3.836-5.036-3.836-5.036S25.254 1 17.399 1c-5.38 0-6.533 5.6-6.533 5.6S8.61 5.265 6.418 7.37C4.302 9.4 5.197 11.155 5.197 11.155S2 11.1 2 13.964c0 1.9 1.37 2.808 1.827 2.808z"/>' +
                    '</g>' +
                '</svg>';
            case 'snow':
                return '<svg class="svg-fill" width="31" height="30" viewBox="0 0 31 30">' +
                    '<g fill-rule="evenodd">' +
                        '<path d="M3.827 16.772h22.378s3.288-.097 3.288-3.97c0-3.874-3.836-5.036-3.836-5.036S25.254 1 17.399 1c-5.38 0-6.533 5.6-6.533 5.6S8.61 5.265 6.418 7.37C4.302 9.4 5.197 11.155 5.197 11.155S2 11.1 2 13.964c0 1.9 1.37 2.808 1.827 2.808"/>' +
                        '<path stroke-width=".5" d="M1 20l4 4M1 24l4-4M7 26l4 4M7 30l4-4M13.5 20l4 4M13.5 24l4-4M26 20l4 4M26 24l4-4M20 26l4 4M20 30l4-4"/>' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M3.827 16.772h22.378s3.288-.097 3.288-3.97c0-3.874-3.836-5.036-3.836-5.036S25.254 1 17.399 1c-5.38 0-6.533 5.6-6.533 5.6S8.61 5.265 6.418 7.37C4.302 9.4 5.197 11.155 5.197 11.155S2 11.1 2 13.964c0 1.9 1.37 2.808 1.827 2.808z"/>' +
                    '</g>' +
                '</svg>';
            case 'stormy':
                return '<svg class="svg-fill" width="30" height="36" viewBox="0 0 30 36">' +
                    '<g fill-rule="evenodd">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M2.876 17.198H25.86s3.377-.099 3.377-4.078c0-3.978-3.94-5.172-3.94-5.172S24.883 1 16.816 1c-5.526 0-6.71 5.752-6.71 5.752S7.788 5.38 5.537 7.54C3.364 9.629 4.283 11.43 4.283 11.43S1 11.372 1 14.314c0 1.952 1.408 2.884 1.876 2.884z"/>' +
                        '<path stroke="none" d="M6 22.187h6L10 36l14-20.189h-6L20 2z"/>' +
                        '<path stroke-width=".5" d="M18 11l-7 9.5h3L13 27l7-9.5h-3z"/>' +
                    '</g>' +
                '</svg>';
            case 'wind':
                return '<svg class="svg-fill" width="38" height="25" viewBox="0 0 38 25">' +
                    '<g fill-rule="evenodd">' +
                        '<path d="M25.679 17.839c0 2.292 1.829 4.151 4.085 4.151 2.256 0 4.085-1.859 4.085-4.151 0-2.294-1.829-4.151-4.085-4.151H0"/>' +
                        '<path stroke-width=".5" d="M25.679 17.839c0 2.292 1.829 4.151 4.085 4.151 2.256 0 4.085-1.859 4.085-4.151 0-2.294-1.829-4.151-4.085-4.151H0"/>' +
                        '<path d="M28.597 5.385c0-2.293 1.828-4.15 4.085-4.15 2.256 0 4.086 1.857 4.086 4.15 0 2.292-1.83 4.151-4.086 4.151H0"/>' +
                        '<path stroke-width=".5" d="M28.597 5.385c0-2.293 1.828-4.15 4.085-4.15 2.256 0 4.086 1.857 4.086 4.15 0 2.292-1.83 4.151-4.086 4.151H0"/>' +
                        '<path d="M15.757 20.804c0 1.638 1.307 2.965 2.919 2.965 1.61 0 2.918-1.327 2.918-2.965s-1.307-2.965-2.918-2.965H0"/>' +
                        '<path stroke-width=".5" d="M15.757 20.804c0 1.638 1.307 2.965 2.919 2.965 1.61 0 2.918-1.327 2.918-2.965s-1.307-2.965-2.918-2.965H0"/>' +
                    '</g>' +
                '</svg>';
            default:
                return '';
            }
        }


        // $.ajax({
        //     url: 'https://weather.pagemasters.com.au/weather?q=' + location,
        //     dataType: "json",
        //     type: 'GET',
        //     success: function(res) {
        //         var local = res.data[0];
        //         var name = local.location.split('/')[1];

        //         $('.j-weather-panel').append(weatherPanel(name, mainWeather, false)(local));

        //         var days = local.daily.slice(1,7).map(weatherPanel(name, forecast, true));

        //         $('.j-weather-panel-dropdown').html(days);

        //         $('.j-show-weather-forcast').on("click", function () {
        //             $(this).toggleClass('flip');
        //             $('.j-weather-panel-dropdown').toggleClass('hidden');
        //         });
        //     }
        // })


        Acme.weather_model = new Acme.Weather();

        var location = localStorage.getItem('weather-location');
        var town = localStorage.getItem('weather-town');

        if (!location) {
            Acme.server.fetch(_appJsConfig.appHostName + '/api/theme/get-config')
                .done(function(r) {
                    var data = r.data['weather'];
                    if (data) {
                        var location = data.location;
                        var town = data.town;
                        localStorage.setItem('weather-location', location);
                        localStorage.setItem('weather-town', town);
                        console.log(data);
                        Acme.PubSub.publish("state_changed", 
                            {
                                'weather-location' : {
                                    'location'  : location,
                                    'town'      : town
                                }
                            });
                    }
                }).fail(function(r) {
                    console.log(r);
                });
        } else {

            Acme.PubSub.publish("state_changed", 
            {
                'weather-location' : {
                    'location'  : location,
                    'town'      : town
                }
            });

        }




        // Acme.weather_model.fetch();
        Acme.weather_view = new Acme.WeatherHeader_View(
            {
                'container': $('.j-weather-panel')
            }
        );
        var screenweather = $('#screenweather');
        if (screenweather.length){
            Acme.weather_view = new Acme.WeatherHeader_View(
                {
                    'container': $('#screenweather')
                }
            );
        }
    

    });





}(jQuery));