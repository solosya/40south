Acme.Feed = function() {
    this.domain = _appJsConfig.appHostName;
    this.requestType = 'post';
    this.csrf = $('meta[name="csrf-token"]').attr("content");
    this.dataType = 'json';
};

Acme.Feed.prototype.fetch = function()
{
    var self = this;

    if (self.renderType === "write") self.container.empty();


    self.elem.html("Please wait...");
    // blogfeed makes 2 sql calls.  
    //      Offset is to get pinned contect 
    //      nonPinnedOffset gets the rest
    //      They're combined to return full result


    this.url = this.domain + '/home/load-articles';

    this.requestData = { 
        offset      : this.options.offset, 
        limit       : this.options.limit, 
        _csrf       : this.csrf, 
        dateFormat  : 'SHORT',
        existingNonPinnedCount: this.options.nonPinnedOffset
    };

    if (this.options.blogid) {
        this.requestData['blogGuid'] = this.options.blogid;
    }

    if (this.options.type) {
        this.requestData['type'] = this.options.type;
    }

    if (this.options.loadtype == 'user') {
        this.url = this.domain + '/api/'+options.loadtype+'/load-more-managed';
        this.requestType = 'get';
    }
    
    if (this.options.loadtype == 'user_articles') {
        var urlArr = window.location.href.split('/');
        var username = decodeURIComponent(urlArr[urlArr.length - 2]);
        this.url = this.domain + '/profile/'+ username + '/posts';
    }

    if (this.options.search) {
        var refinedSearch = this.options.search;
        if (this.options.blogid) {
            this.requestData['blogguid'] = this.options.blogid;
        }

        if (refinedSearch.indexOf(",listingquery") >= 0) {
            refinedSearch = refinedSearch.replace(",listingquery","");
            this.requestData['meta_info'] = refinedSearch;
        } else{
            this.requestData['s'] = refinedSearch;
        }
        this.url = this.domain + '/'+ this.options.loadtype;
        this.requestType = 'get';
    }

    return $.ajax({
        url      : this.url,
        data     : this.requestData,
        type     : this.requestType,
        dataType : this.dataType,
    }).done(function(data) {
        console.log(data);
        if (data.success == 1) {
            self.render(data);
        }
    });   
};

Acme.Feed.prototype.events = function() 
{
    var self = this;
    self.elem.unbind().on('click', function(e) {
        e.preventDefault();
        self.fetch();
    });

    self.lessElem.on('click', function(e) {
        var section = $(this).data('section');
        $('#' + section).empty();
        $(this).hide();
        self.options.nonPinnedOffset = self.originalCount;
        self.elem.show();
    });



    if (this.infinite && this.offset >= this.limit) {
        self.waypoint = new Waypoint({
            element: self.elem,
            offset: '80%',
            handler: function (direction) {
                if (direction == 'down') {
                    self.fetch();
                }
            }
        });
    }
};






Acme.View.articleFeed = function(options)
{
    this.feedModel = options.model;
    this.limit     = options.limit      || 10;
    this.offset    = options.offset     || this.limit;
    this.infinite  = options.infinite   || false;
    this.failText  = options.failText   || null;
    this.container = $('#' + options.container);
    this.template  = options.cardTemplate;
    this.cardClass = options.card_class;
    this.renderType = options.renderType || 'append';
    this.before     = options.before     || false;
    this.after      = options.after      || false;
    this.button_label = options.label    || false;
    this.cardType   = options.cardType   || "";
    this.lightbox   = options.lightbox   || null;

    // when clicking less, reset the original offset count
    this.originalCount = options.non_pinned;


    this.options = {
        'nonPinnedOffset'   :   options.non_pinned  || -1,
        'search'            :   options.searchterm  || null,
        'loadtype'          :   options.loadtype    || "home",
        'offset'            :   options.offset      || 0,
        'blogid'            :   options.blogid,
        'limit'             :   options.limit,
        'type'              :   options.type        || null

        // 'page'              :   self.elem.data('page') || 1, // page is used for user articles
    };
    this.waypoint  = false;
    this.elem      = $('#' + options.name);
    this.lessElem  = $('#less-' + options.name);
    this.failText  = options.failText || null;
    this.events();
};

Acme.View.articleFeed.prototype = new Acme.Feed();
Acme.View.articleFeed.constructor = Acme.View.articleFeed;
Acme.View.articleFeed.prototype.render = function(data) 
{
    console.log('rendering');
    console.log(this.renderType);

    var self = this;
    var articles = [];
    if (data.articles) {
        articles = data.articles;
    }
    if (data.userArticles) {
        articles = data.userArticles;
    }
    if (data.users) {
        articles = data.users.users;
    }

    var label = "";
    if (typeof self.button_label != "undefined" || self.button_label != false ) {
        label = self.button_label;
    }
    var ads_on =   self.ads || null;

    self.elem.html(label);
    self.lessElem.show();

    // add counts to the dom for next request
    self.options.offset += self.options.limit;
    self.options.nonPinnedOffset = data.existingNonPinnedCount;

    var html = [];
    if (ads_on == "yes") {
        html.push( window.templates.ads_infinite );
    }

    if (articles.length === 0 && self.failText) {
        html = ["<p>" + self.failText + "</p>"];
    } else {
        for (var i in articles) {
            articles[i].imageOptions = {'width': self.imgWidth, 'height': self.imgHeight};
            html.push( self.feedModel.renderCard(articles[i], {
                "cardClass": self.cardClass, 
                "template": self.template,
                "type": self.cardType,
                "lightbox": self.lightbox || null

            }));
        }
        if (self.before ) {
            var beforeStr =  self.before.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
            html = [beforeStr].concat(html);
        }
        if (self.after) {
            var afterStr =  self.after.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
            html = html.concat([afterStr]);
        }


    }

    (self.renderType === "write")
        ? self.container.empty().append( html.join('') )
        : self.container.append( html.join('') );
    

    // show or hide the load more button depending on article count
    (articles.length < self.options.limit) 
        ? self.elem.css('display', 'none')
        : self.elem.show();

    // reset infinite load depending on article count
    if (self.waypoint) {
        (articles.length < self.options.limit)
            ? self.waypoint.disable()
            : self.waypoint.enable();
    }

    // $(".card .content > p, .card h2, .card .content .author > p").dotdotdot();     
    // $('.video-player').videoPlayer();
    $("div.lazyload").lazyload({
        effect: "fadeIn"
    });
    $('.j-truncate').dotdotdot({
        watch: true
    });

    // self.elem.data('rendertype', '');
    this.feedModel.events();
};



