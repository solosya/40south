/***                      ****
  Dialog Confirmation Box
***                       ****/

Acme.Confirm = function(template, parent, layouts) {

    this.template = template;
    this.parentCont = parent;
    this.layouts = layouts;
    this.parent = Acme.modal.prototype;
    this.data = {};
};
    Acme.Confirm.prototype = new Acme.modal();
    Acme.Confirm.constructor = Acme.Confirm;
    Acme.Confirm.prototype.errorMsg = function(msg) {
        $('.message').toggleClass('hide');
    };
    Acme.Confirm.prototype.handle = function(e) {
        var self = this;
        this.parent.handle.call(this, e);
        var $elem = $(e.target);

        if ( $elem.is('a') ) {
            if ($elem.hasClass('close')) {
                $('body').removeClass("active");
                this.closeWindow();
            }
        }
        if ($elem.is('button')) {
            if ($elem.hasClass('signin')) {
                e.preventDefault();
                var formData = {};
                $.each($('#loginForm').serializeArray(), function () {
                    formData[this.name] = this.value;
                });
                console.log(_appJsConfig.baseHttpPath + '/api/auth/login');
                Acme.server.create(_appJsConfig.baseHttpPath + '/api/auth/login', formData).done(function(r) {
                    if (r.success === 1) {
                        window.location.href = location.origin;
                    } else {
                        self.errorMsg();
                    }
                }).fail(function(r) { console.log(r);});
            }


            if ($elem.hasClass('register')) {
                e.preventDefault();
                var formData = {};
                $.each($('#registerForm').serializeArray(), function () {
                    formData[this.name] = this.value;
                });

                if (formData['email'] !== '' && formData['name'] !== ''){
                    $.get( 'https://submit.pagemasters.com.au/ubt/submit.php?email='+encodeURI(formData['email'])+'&name='+encodeURI(formData['name']) );
                    $elem.addClass('spinner');
                    function close() {
                        self.closeWindow();
                    };
                    setTimeout(close, 2000);

                } else {
                    alert ("Please fill out all fields.");
                }
            }


            if ($elem.hasClass('forgot')) {
                e.preventDefault();
                var formData = {};
                $.each($('#forgotForm').serializeArray(), function () {
                    formData[this.name] = this.value;
                });

                Acme.server.create('/api/auth/forgot-password', formData).done(function(r) {
                    if (r.success === 1) {
                        location.reload();
                    } else {
                        self.errorMsg();
                    }

                }).fail(function(r) { console.log(r);});
            }

            if ($elem.hasClass('default-weather')) {
                var newDefault = Acme.State.Country + '/' + Acme.State.City;

                localStorage.setItem('city', newDefault);
                function close() {

                    Acme.PubSub.publish("update_state", {'localweather': newDefault });                

                    self.closeWindow();
                };
                setTimeout(close, 500);            
            }        

            if ($elem.data('role') === 'delete') {
                $elem.addClass("spinner");
                Acme.PubSub.publish("update_state", {'delete listing': "" });
            }

            if ($elem.data('role') === 'deleteImage') {
                // console.log('you want to delete an image???');
                // console.log(self.data);
                Acme.PubSub.publish("update_state", {'delete image': self.data });

                // $elem.addClass("spinner");
                // Acme.PubSub.publish("update_state", {'delete listing': "" });
            }


        }
        if ($elem.hasClass('layout')) {
            var layout = $elem.data('layout');
            this.renderLayout(layout);
        }
    };
