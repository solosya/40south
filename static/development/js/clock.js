(function ($) {

    Acme.Clock = function() {
        var self = this;
        this.date = new Date();
        this.datetime = this.date.toISOString().substring(0, 16);
        this.monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        this.dayNames = [
            "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday", "Sunday"
        ];
        this.container = document.getElementById('screentime');
        this.render();
        setInterval( function() {
            self.tick();
        }, 10000 );
    };

    Acme.Clock.prototype.formatTo12hrTime = function() 
    {
      var hours = this.date.getHours();
      var minutes = this.date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0'+minutes : minutes;
      return hours + ':' + minutes + ampm;
    };

    Acme.Clock.prototype.tick = function() 
    {
        this.date = new Date();
        this.datetime = this.date.toISOString().substring(0, 16);
        this.render();
    }

    Acme.Clock.prototype.formatDate = function() 
    {
        var day = this.date.getDate();
        var daystring = this.dayNames[this.date.getDay()];
        var monthIndex = this.date.getMonth();
        var year = this.date.getFullYear();
        var time = this.formatTo12hrTime(this.date);
        var output = [time+',', daystring+',', this.monthNames[monthIndex], day+',', year];
                    // 12:00,    FRIDAY,                JULY                  4,     2019 
        return output.join(' ');
    }

    
    Acme.Clock.prototype.render = function()
    {
        if (this.container) {
            this.container.setAttribute('datetime', this.datetime);
            this.container.innerHTML = this.formatDate();
        }
    }


}(jQuery));