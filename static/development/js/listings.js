(function ($) {


var contractList = [
    { 'label': "Buy", 'value': "For Sale"},
    { 'label': "Rent", 'value': "For Rent"}
];



/***                    ****
      SEARCH PULLDOWNS
***                     ****/

Acme.saleTypePulldown = function(params) {
    this.container = params['container'] || $('#saleSelect');
    this.subscriptions = Acme.PubSub.subscribe({
        'Acme.saleTypeFilter.listener' : ["update_state"]
    });
    this.render();
};
    Acme.saleTypePulldown.prototype = new Acme._View();

    Acme.saleTypePulldown.prototype.listeners =  {
        "saleSelect" : function(data) {
            var data = {
                "contracttype": data.saleSelect
            };
            Acme.PubSub.publish('update_state', data);
        },
        "clear" : function(data) {
            this.menu.reset();
        }
    };
    Acme.saleTypePulldown.prototype.render = function() {
        this.menu = new Acme.listMenu({
            'parent'        : this.container,
            'list'          : contractList,
            'defaultSelect' : {"label": 'Buy'},
            'name'          : 'saleSelect',
            'key'           : 'saleSelect',
            'allowClear'    : true
        }).init().render();
    };
    Acme.saleTypePulldown.prototype.reset = function() {
        this.menu.reset();
    };





/***                    ****
  FETCHES SEARCH RESULTS
***                     ****/
Acme.searchCollectionClass = function(blogId, params)
{
    this.blogId = blogId;
    this.searchTerms = params.searchTerms || {};
    console.log(blogId);
};
    Acme.searchCollectionClass.prototype = new Acme._Collection(Acme.jobsearch);
    Acme.searchCollectionClass.prototype.constructor=Acme.searchCollectionClass;

    Acme.searchCollectionClass.prototype.subscriptions = Acme.PubSub.subscribe({
        'Acme.searchCollection.listener' : [ "update_state" ]
    });
    Acme.searchCollectionClass.prototype.clear = function() {
        this.searchTerms = {};
        Acme.propertyFeed.options.search = '';
        Acme.propertyFeed.options.loadtype = '';
        Acme.propertyFeed.options.offset = 0;
        Acme.propertyFeed.rendertype = 'write';
        Acme.propertyFeed.options.nonPinnedOffset = 0;
        Acme.propertyFeed.fetch().done(function() {
            Acme.propertyFeed.rendertype = 'append';
        });
    };

    Acme.searchCollectionClass.prototype.listeners = {
        "contracttype" : function(data) {
            if (data.contracttype === "") {
                delete this.searchTerms['contracttype'];
                return;
            }
            this.searchTerms['contracttype'] = data.contracttype;
        },
        "clear" : function(data) {
            this.clear();
        },
        "fetch" :  function() {
            var searchTerms = [];
                console.log(this.searchTerms);
            for (search in this.searchTerms) {
                searchTerms.push( search + ":" + this.searchTerms[search]);
            }   
            function setSearchText(label, data) {
                if (data[0] != undefined) {
                    if (data[0].value === "") {
                        return;
                    }
                    
                    searchTerms.push(label + ":" + data[0].value);
                } else {
                    return
                }
            }
            setSearchText("title", $('#location'));
            var searchString = searchTerms.join(",");

            if (searchString) {
                searchString = searchString +",listingquery";

                Acme.propertyFeed.options.search = searchString;
                Acme.propertyFeed.options.loadtype = 'api/search';
                Acme.propertyFeed.options.offset = 0;
                Acme.propertyFeed.options.nonPinnedOffset = 0;
                Acme.propertyFeed.rendertype = 'write';
                Acme.propertyFeed.fetch().done(function(r) {
                    console.log(r);
                    $('#searchResults').text("Showing " + r.articles.length + " results for '" + $('#location').val() + "'");
                });
                return
            }

            // clear the search
            // Acme.propertyFeed.options.search = '';
            // Acme.propertyFeed.options.loadtype = '';
            // Acme.propertyFeed.options.offset = 0;
            // Acme.propertyFeed.rendertype = 'write';
            // Acme.propertyFeed.options.nonPinnedOffset = 0;
            // Acme.propertyFeed.fetch().done(function() {
            //     Acme.propertyFeed.rendertype = 'append';
            // });

            return;
        },
    };

$('#searchButton').on('click', function(e) {
    e.preventDefault();
    Acme.PubSub.publish('update_state', {'fetch': self});
});

$('#clearButton').on('click', function(e) {
    e.preventDefault();
    // $('#location').val("");
    Acme.PubSub.publish('update_state', {'clear': self})
        .done(function() {
            Acme.PubSub.publish('update_state', {'fetch': self});
        });
});









/***                             ****
      Base Class property forms
        Extends Form Class
***                              ****/
var ListingForm = function() {};
    ListingForm.prototype = new Acme.Form(Acme.Validators);
    ListingForm.constructor = ListingForm;
    ListingForm.prototype.init = function(blogId, layout) 
    {
        this.blogId = blogId;
        this.errorField = $('#formerror');
        this.data = {
            'id': 0,
            'blogs': this.blogId,
            'media_ids': ''
        };
        this.layout = layout;
        this.addPulldowns();
        this.events();
    };
    ListingForm.prototype.container = {
        'main' : $('#listingForm')
    };
    ListingForm.prototype.listeners = 
    {
        "user listing" : function(data, topic) {
            if (data['user listing'] == null) {
                this.clear();
                return;
            }
            this.data = data['user listing'];

            this.render();
        },
        "delete listing" : function(data, topic) {
            return this.deleteListing();
        },
        "delete image" : function(data, topic) {
            return this.deleteImage(data);
        },
        // "extendedData.region" : function(data, topic) {
        //     this.updateData(data);
        // },
        "extendedData.contracttype" : function(data, topic) {
            this.updateData(data);
        },
        // "extendedData.type" : function(data, topic) {
        //     this.updateData(data);
        // },
        // "extendedData.worktype" : function(data, topic) {
        //     this.updateData(data);
        // },
        // "extendedData.listingclose" : function(data, topic) {
        //     this.updateData(data);
        // },
        // "extendedData.availability" : function(data, topic) {
        //     this.updateData(data);
        // },
        "start_date" : function(data, topic) {
            this.data.start_date = data['start_date'];
        },
        "end_date" : function(data, topic) {
            this.data.end_date = data['end_date'];
        },
        "after" : function(data, topic) {
            var keys = Object.keys(data);

            if(keys[0] === 'user listing' || keys[0] === 'delete image') return;
            // var validated = this.validate(keys);

            if (!validated) {
                this.render();
                return;
            }
        }
    };
    ListingForm.prototype.addPulldowns = function() 
    {
        this.menus = {};

        // this.menus.regionMenu = new Acme.listMenu({
        //             'parent'        : $('#regionSelect'),
        //             'list'          : regionList,
        //             'defaultSelect' : {"label": '*'},
        //             'name'          : 'region',
        //             'key'           : 'extendedData.region',
        //             'class'         : 'formPulldowns'
        // }).init().render();

        // this.menus.propertyMenu = new Acme.listMenu({
        //             'parent'        : $('#propertySelect'),
        //             'list'          : propertyList,
        //             'defaultSelect' : {"label": 'Type of property*'},
        //             'name'          : 'type',
        //             'key'           : 'extendedData.type',
        //             'class'         : 'formPulldowns'

        // }).init().render();

        this.menus.buyMenu = new Acme.listMenu({
                    'parent'        : $('#buySelect'),
                    'list'          : contractList,
                    'defaultSelect' : {"label": 'For sale/rent*'},
                    'name'          : 'contracttype',
                    'key'           : 'extendedData.contracttype',
                    'class'         : 'formPulldowns'
        }).init().render();

        // this.menus.workType = new Acme.listMenu({
        //             'parent'        : $('#worktypeSelect'),
        //             'list'          : workType,
        //             'defaultSelect' : {"label": 'Work type*'},
        //             'name'          : 'worktype',
        //             'key'           : 'extendedData.worktype',
        //             'class'         : 'formPulldowns'
        // }).init().render();
    };
    ListingForm.prototype.render = function() 
    {
        var form = this.container.main;
        var title = form.find("#title");
        var content = form.find("#content");

        title.val(this.data.title);
        content.val(this.data.content);

        this.clearInlineErrors();
        
        if (this.menus) {
            var menus = Object.keys(this.menus);
            for(var i=0;i<menus.length;i++) {
                this.menus[menus[i]].reset();
            }
        }

        for (key in this.data.extendedData) {
            if (key === 'listing_type') {
                this.menus.buyMenu.select(this.data.extendedData[key]);
                continue;
            }
            // if (key === 'salary') {
            //     $('#'+key+this.data.extendedData[key]).prop("checked", true);
            // }

            $('#'+key).val(this.data.extendedData[key]);
        }

        this.addInlineErrors();

        if (this.data.id) {
            $('#listingFormSubmit').text('UPDATE');
            $('#listingFormDelete').show();
        }

        if (this.data.mediaData){
            this.renderImageThumbs(this.data.mediaData);
        }
    };
    ListingForm.prototype.renderImageThumbs = function(images, addImage) 
    {
        var imageArray = $('#imageArray');

        if ( imageArray.children().length != images.length  || addImage) {
            var html = "";
            var temp = Handlebars.compile(Acme.templates.carousel_item); 
    
            for (var i=0;i<images.length;i++) {
                var imagePath = images[i].url || images[i].path;
                html += temp({"imagePath": imagePath, 'imageid' : images[i].media_id});
            }
            imageArray.append(html);
            this.initSortable();

        }
    };
    ListingForm.prototype.clear = function() 
    {
        if (this.menus) {
            var menus = Object.keys(this.menus);
            for(var i=0;i<menus.length;i++) {
                this.menus[menus[i]].reset();
            }
        }
        $('#listingFormDelete').hide();
        $('#imageArray').empty();
        this.clearInlineErrors();
        this.resetData();
    };
    ListingForm.prototype.resetData = function() 
    {
        this.data = {
            'id': 0,
            'blogs': this.blogId,
            'media_ids': ''
        };
    };
    ListingForm.prototype.deleteListing = function() 
    {

        return Acme.server.create(_appJsConfig.appHostName + '/api/article/delete-user-article', {"articleguid": this.data.guid}).done(function(r) {
            $('#listingFormClear').click();
            Acme.PubSub.publish('update_state', {'closeConfirm': ''});

        }).fail(function(r) {
            // Acme.PubSub.publish('update_state', {'confirm': r});
            console.log(r);
        });
    };
    ListingForm.prototype.saveImage = function(r, data)
    {
        var newImageId = r.media.media_id;
        data.media_id = newImageId;
        var mediaids = [];
        if (this.data.media_ids != "") {
            mediaids = this.data.media_ids.split(',');
        }
        mediaids.push(newImageId);
        this.data.media_ids = mediaids.join(',');
        this.data.media_id = mediaids[0];

        this.renderImageThumbs([data], true);
        return true;
    }
    ListingForm.prototype.deleteImage = function(data) 
    {
        var info = data['delete image'].confirmDeleteImage;
        var elem = info.elem;
        var id = info.id;
        elem.parent().remove();

        mediaids = this.data.media_ids.split(',');

        var index = mediaids.indexOf(id.toString());
        if (index > -1) {
            mediaids.splice(index, 1);
        }
        
        if (mediaids.length > 0) {
            this.data.media_id = mediaids[0];
            this.data.media_ids = mediaids.join(',');
        } else {
            this.data.media_id = '';
            this.data.media_ids = '-1';
        }

        Acme.PubSub.publish('update_state', {'closeConfirm': ''});

    };
    ListingForm.prototype.submit = function()
    {
        var validated = this.validate();
        if (!validated) {
            this.render();
            return;
        }

        this.data.theme_layout_name = this.layout;

        Acme.server.create(_appJsConfig.appHostName + '/api/article/create', this.data).done(function(r) {
            console.log(r);
            $('#listingFormClear').click();
            Acme.PubSub.publish('update_state', {'confirm': r});
            Acme.PubSub.publish('update_state', {'userArticles': ''});
        }).fail(function(r) {
            Acme.PubSub.publish('update_state', {'confirm': r});
            console.log(r);
        });
    };
    ListingForm.prototype.initSortable = function()
    {
        var self = this;

        $( "#imageArray" ).sortable({
            self: self,
            axis: "y", // only sort horizontal
            update: function(e, ui) {
                var data = {
                    articleGuid: self.data.guid,
                    images: []
                };
                var container = $(e.target);

                var images = container.children();
                images.each(function(i,e) {
                    var id = $(e).find('span').data('id');
                    data.images.push(id);
                });

                Acme.server.create(_appJsConfig.appHostName + '/api/article/reorder-article-media', data).done(function(r) {
                    if (r.success == 1) {
                        images.css({outline: '0 solid rgba(167, 237, 52, 1)' })
                        images.animate({
                            "outlineWidth": 4
                        }, 100).animate({
                            "outlineWidth": 0
                        }, 100, function() {
                            $(this).removeAttr('style');
                        });
                    }
                });
            }
        });

    };
    ListingForm.prototype.events = function() 
    {
        var self = this;


        $('input, textarea').on("change", function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = {};
            var elem = $(e.target);
            var elemid = elem.attr('name');

            data[elemid] = elem.val();
            self.updateData(data);
            var validated = self.validate([elemid]);
            self.render();
        });


        $('#uploadFileBtn').uploadFile({
               onSuccess: function(data, obj){

                    var resultJsonStr = JSON.stringify(data);

                    var postdata = {
                        'blogs' : self.blogId,
                        'imgData' : resultJsonStr
                    };

                    var outer = $("#uploadFileBtn");
                    outer.addClass("spinner");

                    Acme.server.create(_appJsConfig.appHostName + '/api/article/save-image', postdata).done(function(r) {
                        // console.log(r);
                        if (self.saveImage(r, data) ) {
                            outer.removeClass("spinner");
                        }
                    }).fail(function(r) {
                        console.log(r);
                    });
                }
        });

        $('#imageArray').on('click', '.carousel-tray__delete', function(e) {
            var elem = $(e.target);
            var mediaId = elem.data('id');
            Acme.PubSub.publish('update_state', {'confirmDeleteImage': {elem:elem, id:mediaId}});
        });

        $('#listingFormClear').on('click', function(e) {
            $('#listingFormSubmit').text('SUBMIT');
            self.clear();
        });

        $('#listingFormDelete').on('click', function(e) {
            Acme.PubSub.publish('update_state', {'confirmDelete': ""});
        });

        $('#listingForm').submit(function(e) {
            e.preventDefault();
            self.submit();
        });
    }






Acme.PropertyForm = function(blogId, layout) 
{
    this.subscriptions = Acme.PubSub.subscribe({
        'Acme.propertyForm.listener' : ['state_changed', 'update_state']
    });

    this.parent = ListingForm.prototype;

    this.errorFields = [];

    this.validateRules = {
        "title"                       : ["notEmpty"], 
        "content"                     : ["notEmpty"], 
        "extendedData.location"       : ["notEmpty"], 
        "extendedData.pricerange"     : ["notEmpty"], 
        "extendedData.pricerange"     : ["notEmpty"], 
        "extendedData.bedroom_count"  : ["isNumeric"], 
        "extendedData.bathroom_count" : ["isNumeric"], 
        "extendedData.car_count"      : ["isNumeric"], 
        "extendedData.contactname"    : ["notEmpty"], 
    };

    this.validateFields = Object.keys(this.validateRules);

    this.init(blogId, layout);
};
    Acme.PropertyForm.prototype = new ListingForm();
    Acme.PropertyForm.prototype.constructor=Acme.PropertyForm;
        Acme.PropertyForm.prototype.events = function() 
        {
            this.parent.events.call(this);

            // $('#availability').datetimepicker({
            //     format: "DD-MM-YYYY",
            //     useCurrent: false,
            //     icons: {
            //         time: "fa fa-clock-o",
            //         date: "fa fa-calendar",
            //         up: "fa fa-angle-up",
            //         down: "fa fa-angle-down"
            //     },
            //     tooltips: {selectTime: ''}
            // }).on('dp.change', function (e) {
            //     var data = {};
            //     data[e.target.name] = e.date.format('YYYY-MM-DD');
            //     Acme.PubSub.publish("update_state", data);
            // });
        };

Acme.EventForm = function(blogId) 
{

    this.subscriptions = Acme.PubSub.subscribe({
        'Acme.eventForm.listener' : ['state_changed', 'update_state']
    });

    this.errorFields = [];

    this.validateRules = {
        "title"         : ["notEmpty"], 
        "content"       : ["notEmpty"], 
        "start_date"    : ["notEmpty"], 
    };

    this.validateFields = Object.keys(this.validateRules);

    this.blogId = blogId;

    this.data = {
        'id': 0,
        'blogs': this.blogId,
        'media_ids': '',
        'type': 'event'
    };

    this.events();
    this.events2();
};
    Acme.EventForm.prototype = new ListingForm();
    Acme.EventForm.prototype.constructor=Acme.EventForm;
    Acme.EventForm.prototype.resetData = function() 
    {
        this.data = {
            'id': 0,
            'blogs': this.blogId,
            'media_ids': '',
            'type': 'event'
        };
    };
    Acme.EventForm.prototype.events2 = function() {

        $('#start_date, #end_date').datetimepicker({
            format: "DD-MM-YYYY h:mm A",
            useCurrent: false,
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-angle-up",
                down: "fa fa-angle-down"
            },
            tooltips: {selectTime: ''}
        }).on('dp.change', function (e) {
            var data = {};
            data[e.target.id] = e.date.format('YYYY-MM-DD HH:mm');
            if(data['start_date'] || data['end_date']) {
                if(data['start_date'] && e.date.hour() == 9 && e.date.minute() == 0) {
                        $('#end_date').data("DateTimePicker").minDate(e.date.hour(16).minute(59));
                    } else if (data['start_date']) {
                         $('#end_date').data("DateTimePicker").minDate(e.date);
                    }
                Acme.PubSub.publish("update_state", data);
            }
        });
    }








Acme.listing = Acme.Model.create({
    'url' : 'user'
});
    Acme.listing.subscriptions = Acme.PubSub.subscribe({
        'Acme.listing.listener' : [ "state_changed", "update_state"]
    });




Acme.listingCollectionClass = function(name, blogId) {
    this.blogId = blogId || "";
    this.name = name || "";
    this.listeners = {
        "userArticles" : function(data) {
            return this.fetch(_appJsConfig.appHostName + '/api/user/user-articles?userguid='+Acme.currentUser+'&blogs='+this.blogId+'&status=-1');
        }
    };
};
    Acme.listingCollectionClass.prototype = new Acme._Collection(Acme.listing);
    Acme.listingCollectionClass.prototype.constructor = Acme.listingCollectionClass;
    Acme.listingCollectionClass.subscriptions = Acme.PubSub.subscribe({
        'Acme.listingCollection.listener' : [ "update_state" ]
    });



Acme.listingViewClass = function() {
};
    Acme.listingViewClass.prototype = new Acme._View();

    Acme.listingViewClass.prototype.init =  function(blogId, type) {
        this.events();
        this.blogs = blogId;
        this.type = type || "";
    };
    Acme.listingViewClass.prototype.container = {
        'main' : $('#userListings')
    };
    Acme.listingViewClass.prototype.listeners = {
        "listingCollection" : function(data) {
            this.data = data.listingCollection.data;
            this.render();
        }
    };
    Acme.listingViewClass.prototype.events = function() 
    {
        var self = this;

        if(_appJsConfig.isUserLoggedIn === 1) {
            init();
        }

        function init() {

            self.container.main.on('click', '.j-listingCard', function(e) {
                e.preventDefault();

                $('#listingFormClear').click();

                var elem = $(this);
                var card = elem.find('a').first();
                var status = card.data('status');
                var articleId = card.data('id');

                Acme.server.fetch(_appJsConfig.appHostName + '/api/article/get-article?articleId='+articleId+"&status="+status).done(function(r) {
                    console.log(r);
                    var data = {
                        'id'        : r.id,
                        'guid'      : r.guid,
                        'blogs'     : self.blogs,
                        'title'     : r.title,
                        'status'    : self.status,
                        'content'   : r.content,
                        'mediaData' : r.media
                    };
                    var mediaids = [];
                    if (r.media) {
                        for (var i=0;i<r.media.length;i++) {
                            mediaids.push(r.media[i].media_id);
                        }
                    }
                    data.media_id = mediaids[0];
                    data.media_ids = mediaids.join(',');

                    if (r.additionalInfo) {
                        var extendedData = {};
                        for (d in r.additionalInfo) {
                            extendedData[d] = r.additionalInfo[d];
                        }
                        data['extendedData'] = extendedData;
                    }

                    Acme.PubSub.publish('state_changed', {'user listing': data});
                });
            });


            $("#userlistingsrefresh").on('click',function(e) {
                Acme.PubSub.publish('update_state', {"userArticles":''});
            });
        }  
    },
    Acme.listingViewClass.prototype.render = function()
    {
        var container = this.container.main;
        var cardClass = "card-7-mobile card-7-tablet card-7-desktop j-listingCard";

        var html = "";
        for (var i=0; i < this.data.length; i++) {
            html += window.Acme.cards.renderCard(this.data[i].data, {'cardClass': cardClass});
            html += '<hr class="u-divide">';
        }
        container.empty().append(html);

        $(".j-truncate").dotdotdot();
    };



Acme.listingView = new Acme.listingViewClass();
    Acme.listingView.subscriptions = Acme.PubSub.subscribe({
        'Acme.listingView.listener' : ["state_changed", 'update_state']
    });






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
                Acme.server.create(_appJsConfig.appHostName + '/api/auth/login', formData).done(function(r) {
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

                if (formData['email'] !== '' && formData['name'] !== '') {
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

                Acme.server.create(_appJsConfig.appHostName + '/api/auth/forgot-password', formData).done(function(r) {
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
                Acme.PubSub.publish("update_state", {'delete image': self.data });
            }


        }
        if ($elem.hasClass('layout')) {
            var layout = $elem.data('layout');
            this.renderLayout(layout);
        }
    };

var layouts = {
    "listing"  : 'listingSavedTmpl',
    "delete"   : 'listingDeleteTmpl',
};

Acme.confirmView = new Acme.Confirm('modal', 'signin', layouts);
    Acme.confirmView.subscriptions = Acme.PubSub.subscribe({
        'Acme.confirmView.listener' : ['update_state']
    });

    Acme.confirmView.listeners = 
    {
        "confirm" : function(data, topic) {
            this.render("listing", "Listing saved");
        },
        "confirmDelete" : function(data, topic) {
            this.render("delete", "Warning", { msg: "Are you sure you want to permanently delete this listing?", role:"delete"});
        },
        "confirmDeleteImage" : function(data, topic) {
            this.data = data;

            this.render("delete", "Warning", 
                {
                     msg: "Are you sure you want to permanently delete this image?", 
                     role:"deleteImage"
                 }
            );
        },
        "closeConfirm" : function(data, topic) {
            this.closeWindow();
        }

    };


}(jQuery));