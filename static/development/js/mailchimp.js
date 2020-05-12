(function ($) {


    Acme.mailChimp = function(template, parent, layouts) {
        this.template = template;
        this.parentCont = parent;
        this.layouts = layouts;
        this.parent = Acme.modal.prototype;
    };
    Acme.mailChimp.prototype = new Acme.modal();
    Acme.mailChimp.constructor = Acme.mailChimp;
    
    
    Acme.mailChimp.prototype.handle = function(e) {
        var $elem = this.parent.handle.call(this, e);
        if ( $elem.is('a') ) {
    
            if ($elem.hasClass('close')) {
    
                e.preventDefault();
                $('body').removeClass("active");
                this.closeWindow();
            }
        }
        if ($elem.is('button')) {
    
    
            if ($elem.hasClass('close')) {
                $('body').removeClass("active");
                this.closeWindow();
            }
       
    
        }
    
        if ($elem.data('layout') != null) {
            var layout = $elem.data('layout');
            this.renderLayout(layout);
    
        }
    
    
    };

    var layouts = {
        "mailchimp"         : 'mailChimpSignup'
    
    }

    var mailchimpLink = '//not-loaded';
    var mailChimpTitle = 'Please configure your mailchimp';
    var mailChimpDescription = 'in the site config';

    Acme.mailchimpView = new Acme.mailChimp('modal', 'mailchimp-modal', layouts);

    Acme.server.fetch(_appJsConfig.appHostName + '/api/theme/get-config')
        .done(function(r) {
            
            var data = r.data['mailchimp'];
            console.log(data);
            if (data) {
                mailchimpLink = data.url;
                mailChimpTitle = data.title;
                mailChimpDescription = data.description;
            }
            $('.j-insider-signup').on('click', function() {
                Acme.mailchimpView.render("mailchimp", "Become a Forty South Insider", {mailChimpClass: mailchimpLink, mctitle: mailChimpTitle, mcdescription: mailChimpDescription});
            });
        }).fail(function(r) {
            console.log(r);
        });
    
    
    
    
    
    
    
    
    
    // $('.j-insider-signup').on('click', function() {
    //     Acme.mailchimpView.render("mailchimp", "Become a Forty South Insider", {mailChimpClass: mailchimpLink, mctitle: mailChimpTitle, mcdescription: mailChimpDescription});
    // });
    
    // $('a.j-register').on('click', function(e) {
    //     e.preventDefault();
    //     Acme.SigninView.render("register", "Register your interest");
    // });
    
    
    
    
    }(jQuery));