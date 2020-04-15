var Card = function() {
    this.events();
};

Card.prototype.renderScreenCards = function(options, data) 
{
    var self = this;

    var container = options.container;

    container.data('existing-nonpinned-count', data.existingNonPinnedCount);

    var html = "";
    for (var i in data.articles) {
        data.articles[i]['imageOptions'] = { width:1400, height:800 };
        data.articles[i]['lazyloadImage'] = false;
        html += self.renderCard(data.articles[i], {'cardClass': options.cardClass} );
    }

    container.empty().append(html);

    $(".j-truncate").dotdotdot();
};




Card.prototype.screen = function() 
{
    var self = this;

    var btn = $('.loadMoreArticles');
    var blogFetchInterval       = 300000 // 5 minutes
    var pageRefreshInterval     = 60000 * 10; // 10 minutes
    var articleRenderInterval   = 10000; // 10 seconds
    var csrf = $('meta[name="csrf-token"]').attr("content");
    var currentScreen = 0;
    var articleCount = 0;

    var options = {
        'screens' : [
            {
                style: "card-screen",
                limit: 15,
                logo: "large-logo"
            }
        ],
        'container': $( '#'+btn.data('container') ),
        'currentScreen': currentScreen,
        'count': 15
    };


    var runContinous = function() {

                            // 1 minute * amount of minutes
        var numberOfScreens = options.screens.length;
        currentScreen++;
        if (currentScreen > numberOfScreens) {
            currentScreen = 1;
        }
        url = _appJsConfig.appHostName + '/home/load-articles';
        requestData = {
            offset          : currentScreen,
            loadtype        : "home",
            _csrf           : csrf, 
            limit           : options.screens[currentScreen-1].limit,
            cardClass       : options.screens[currentScreen-1].style,
            blogGuid        : options.container.data('blogid')
        }
        articleCount            = 1;

        if (articleCount >= options.count) {
            articleCount = 0;
        }

        // options.offset = articleCount;
        // options.nonPinnedOffset = articleCount;

        $.ajax({
            url      : url,
            data     : requestData,
            type     : 'post',
            dataType : 'json',
        }).done(function(data) {

            if (data.articles.length == 0 ) {
                articleCount = 0;
                return;
            }

            if (data.success == 1) {

                if (self.interval) {
                    clearInterval(self.interval);
                }

                self.interval = setInterval( function() {
                    var article = data.articles[articleCount];

                    articleCount++;
                    self.renderScreenCards(options, { 'articles': [ article ] });
                    if (articleCount >= data.articles.length) {
                        articleCount = 0;
                    }
                } , articleRenderInterval );
                
                self.renderScreenCards(options, { 'articles': [ data.articles[2] ] });

            }
        });
    }


    runContinous();

    // setInterval( runContinous, blogFetchInterval ); //300000
    setInterval( function() {
        location.reload(false);
    } , pageRefreshInterval );
};

Card.prototype.renderCard = function(card, options)
{

    var self = this;
    options = options || {};

    var template = (options.template) ? Acme.templates[options.template] : Acme.templates.systemCardTemplate;
    card['containerClass'] = options.cardClass || "";
    card['cardType'] = options.type || "";
    card['lightbox'] = options.lightbox || "";
    
    if (card.status == "draft") {
        card['articleStatus'] = "draft";
        card['containerClass'] += " draft"; 
    }

    card['pinTitle'] = (card.isPinned == 1) ? 'Un-Pin Article' : 'Pin Article';
    card['pinText']  = (card.isPinned == 1) ? 'Un-Pin' : 'Pin';
    card['promotedClass'] = (card.isPromoted == 1)? 'ad_icon' : '';
    
    // mainly for screen to turn off lazyload and loading background img
    // card['imgClass'] = (card.lazyloadImage == false) ? '' : 'lazyload';
    // card['imgBackgroundStyle'] = (card.lazyloadImage == false) ? '' : 'style="background-image:url(https://placeholdit.imgix.net/~text?w=1&h=1)"';
    

    // card['readingTime']= self.renderReadingTime(card.readingTime);
    
    var width = 500;
    var height = 350;

    if (card.imageOptions) {
        width = card.imageOptions.width || width;
        height = card.imageOptions.height || height;
    }

    if (options.imageOriginal) {
        var width = card.featuredMedia.width;
        var height = card.featuredMedia.height;
    }

    var articleContent = card.excerpt;
    if (typeof options.content != "undefined" && options.content === "full") {
        articleContent = '<div class="acme-c-cards-view__articleContent">' + card.content + '</div>';
    }

    
    card['titleString'] = "";
    if (_appJsConfig.isUserLoggedIn === 1 && _appJsConfig.userHasBlogAccess === 1) {
        var totalstring = "";
        var totals = (card.total ) ? card.total : false;
        if ( totals ) {
            totalstring = "Viewed " + totals.view + " times";
            totalstring = totalstring + " Published " + card.publishedDateTime;
        }
        card['titleString'] = totalstring;
    }



    if (card.social) {
        card['hasMediaClass'] = (card.hasMedia == 1)? 'withImage__content' : 'without-image';

        card.params = {
            guid        : card.socialGuid,
            image       : card.media.path,
            category    : card.source,
            title       : "",
            content     : card.content,
            author      : card.user.name,
            publishDate : card.publishDate,
            videoClass  : card.media['type'] == 'video' ? 'c-cards-view__media--video' : '',
            hasMedia    : card.hasMedia,
            social      : 1
        }

    } else {
        card['hasMediaClass'] = (card.hasMedia == 1)? 'withImage__content' : 'without-image';

        card.params = {
            id          : parseInt(card.articleId),
            guid        : card.guid,
            image       : $.image({media:card['featuredMedia'], mediaOptions:{width: width ,height:height, crop: 'limit'} }),
            category    : card.label,
            title       : card.title,
            content     : articleContent,
            author      : card.createdBy.displayName,
            publishDate : card.publishDate,
            videoClass  : card.featuredMedia['type'] == 'video' ? 'c-cards-view__media--video' : '',
            hasMedia    : card.hasMedia,
            social      : 0
        };


    }

    var articleTemplate = Handlebars.compile(template);

    return articleTemplate(card);
}

Card.prototype.renderReadingTime = function (time) 
{
    if (time <= '59') {
        return ((time <= 0) ? 1 : time) + ' min read';
    } else {
        var hr = Math.round(parseInt(time) / 100);
        return hr + ' hour read';
    }
};



// events
Card.prototype.bindPinUnpinArticle = function()
{
    $('button.PinArticleBtn').Ajax_pinUnpinArticle({
        onSuccess: function(data, obj){
            var status = $(obj).data('status');
            var obj = $(obj);
            (status == 1) 
                ? obj.attr('title', 'Un-Pin Article') 
                : obj.attr('title', 'Pin Article');
            (status == 1) 
                ? obj.find('span').first().html('Un-Pin')
                : obj.find('span').first().html('Pin');        
        }
    });

    // $('button.liveArticleBtn').on('click', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();

    //     var $elem = $(e.target);
    //     var card = $elem.closest('a');
    //     var status = card.data('editing');
    //     var headline = card.find('.j-headline');
    //     var excerpt = card.find('.j-excerpt');

    //     excerpt.unbind();

    //     if (!status) {
    //         card.draggable( 'disable' );
    //         card.on("click", function(e) {e.preventDefault()});
    //         card.data('editing', true);
    
    //         headline.attr('contenteditable', true)
    //                 .addClass('editactive')
    //                 .on('click', function(ev) {
    //                     ev.preventDefault();
    //                     console.log('clicked on headline');
    //                 });

    //         var origExcerpt = excerpt.data('original');

    //         excerpt 
    //             .attr('contenteditable', true)
    //             .addClass('editactive')
    //             .css({"overflow":'initial'})
    //             .text(origExcerpt)
    //             .on({
    //                 "keyup": function(ev) {
    //                     if (ev.which === 13) {
    //                         ev.preventDefault();
    //                         console.log('saving');
    //                     }
    //                 },
    //                 "keydown": function(ev) {
    //                     if (ev.which === 13) {
    //                         ev.preventDefault();
    //                         console.log('entering');
    //                     }
    //                 }
    //             });

        
    //     } else {
    //         headline.removeAttr('contenteditable')
    //                 .removeClass('editactive');
    //          excerpt.removeAttr('contenteditable')
    //                 .removeClass('editactive')
    //                 .attr('style', "")

    //         card.data('editing', false);
    //         card.draggable( 'enable' );

    //     }
    // });



};

Card.prototype.bindDeleteHideArticle = function()
{
    $('button.HideBlogArticle').Ajax_deleteArticle({
        onSuccess: function(data, obj){
            $(obj).closest('.card').parent('div').remove();
            var postsCount = $('body').find('.card').length;
            if(postsCount <= 0) {
                $('.NoArticlesMsg').removeClass('hide');
            }
        }
    });
};

Card.prototype.bindSocialUpdatePost = function () 
{
    $(document).on('click', '.j-editSocialPost', function (e) {

        e.preventDefault();
        var elem = $(this);
        var url = elem.data('url');
        var popup = window.open(url, '_blank', 'toolbar=no,scrollbars=yes,resizable=false,width=360,height=450');
        popup.focus();

        var intervalId = setInterval(function () {
            if (popup.closed) {
                clearInterval(intervalId);
                var socialId = elem.parents('a').data('id');
                if ($('#updateSocial' + socialId).data('update') == '1') {
                    $().General_ShowNotification({message: 'Social Post(s) updated successfully.'});
                }
            }
        }, 50);

        return;
    });
};

Card.prototype.bindLightbox = function()
{
    var isRequestSent = false;
    var self = this;
    $('article.lightbox').unbind().on('click', 'article.lightbox', function (e) {
        e.preventDefault();

        var csrfToken = $('meta[name="csrf-token"]').attr("content");
        var isSocial = $(this).parent().data('social');
        var action = 'POST';

        Acme.LightBox = new Acme.lightBox('modal', 'lightbox-modal');
        Acme.LightBox.render(null, null, '<div class="spinner" style="position:relative;height:70px;margin-top:30px;margin-bottom:30px"></div>' );


        if (isSocial) {
            var url = '/api/social/get-social-post';
            var blogGuid = $(this).parent().data('blog-guid');
            var postGuid = $(this).parent().data('guid');
            var payload = {blog_guid: blogGuid, guid: postGuid, _csrf: csrfToken};

        } else {
            var url = '/api/article/get-article';
            var articleId = $(this).parent().data('id');
            var payload = {articleId: articleId, _csrf: csrfToken}
            action = 'GET';
        }
        if (!isRequestSent) {

            $.ajax({
                type: action,
                url: _appJsConfig.appHostName + url,
                dataType: 'json',
                data: payload,
                success: function (data, textStatus, jqXHR) {

                    data.social = isSocial;
                    data.hasMediaVideo = false;
                    if (data.media['type'] === 'video') {
                        data.hasMediaVideo = true;
                    }
                    
                    if (data.source == 'youtube') {
                        var watch = data.media.videoUrl.split("=");
                        data.media.videoUrl = "https://www.youtube.com/embed/" + watch[1];
                    }

                    data.templatePath = _appJsConfig.templatePath;

                    var article = self.renderCard(data, {
                        cardClass : "card-10-mobile card-10-tablet card-10-desktop card-10-desktop-lg"
                    });

                    Acme.LightBox.renderPreLayout(article);



                    // var articleTemplate = Handlebars.compile(Acme.templates.socialPopup);
                    // var article = articleTemplate(data);
                    // $('.modal').html(article);

                    // setTimeout(function () {
                    //     $('.modal').modal('show');
                    // }, 0);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown, textStatus, jqXHR);
                    isRequestSent = false;
                },
                beforeSend: function (jqXHR, settings) {
                    isRequestSent = true;
                },
                complete: function (jqXHR, textStatus) {
                    isRequestSent = false;
                }
            });
        }
    });
};

Card.prototype.initDraggable = function()
{
    $('.swap').draggable({
        helper: 'clone',
        revert: true,
        zIndex: 100,
        scroll: true,
        scrollSensitivity: 100,
        cursorAt: { left: 150, top: 50 },
        appendTo:'body',
        start: function( event, ui ) {

            ui.helper.attr('class', '');
            var postImage = $(ui.helper).data('article-image');
            var postText = $(ui.helper).data('article-text');
            if(postImage !== "") {
                $('div.SwappingHelper img.article-image').attr('src', postImage);
            }
            else {
                $('div.SwappingHelper img.article-image').attr('src', 'http://www.placehold.it/100x100/EFEFEF/AAAAAA&amp;text=no+image');
            }
            $('div.SwappingHelper p.article-text').html(postText);
            $(ui.helper).html($('div.SwappingHelper').html());    
        }
    });
};

Card.prototype.initDroppable = function()
{
    var self = this;

    $('.swap').droppable({
        hoverClass: "ui-state-hover",
        drop: function(event, ui) {
            function getElementAtPosition(elem, pos) {
                return elem.find('a.card').eq(pos);
            }

            var sourceObj       = $(ui.draggable);
            var destObject      = $(this);
            var sourceProxy     = null;
            var destProxy       = null;


            if (typeof sourceObj.data('proxyfor') !== 'undefined') {
                sourceProxy = sourceObj;
                sourceObj   = getElementAtPosition($( '.' + sourceProxy.data('proxyfor')), sourceProxy.data('position') -1);
                sourceObj.attr('data-position', destObject.data('position'));

            }
            if (typeof destObject.data('proxyfor') !== 'undefined') {
                destProxy = destObject;
                destObject = getElementAtPosition($( '.' + destObject.data('proxyfor')), destObject.data('position') -1);
                destObject.attr('data-position', sourceObj.data('position'));
            }



            //get positions
            var sourcePosition      = sourceObj.data('position');
            var sourcePostId        = sourceObj.data('id');
            var sourceIsSocial      = parseInt(sourceObj.data('social'));
            var destinationPosition = destObject.data('position');
            var destinationPostId   = destObject.data('id');
            var destinationIsSocial = parseInt(destObject.data('social'));

            var swappedDestinationElement = sourceObj.clone().removeAttr('style').insertAfter( destObject );
            var swappedSourceElement = destObject.clone().insertAfter( sourceObj );
            

            if (sourceProxy) {
                sourceProxy.find('h2').text(destObject.find('h2').text());
                swappedDestinationElement.addClass('swap');
                swappedSourceElement.removeClass('swap');
                sourceProxy.attr('data-article-text', destObject.data('article-text'));
                sourceProxy.attr('data-article-image', destObject.data('article-image'));
            }

            if (destProxy) {
                if (sourceIsSocial) {
                    destProxy.find('h2').text( sourceObj.find('p').text() );
                } else {
                    destProxy.find('h2').text( sourceObj.find('h2').text() );
                }
                swappedSourceElement.addClass('swap');
                swappedDestinationElement.removeClass('swap');
                destProxy.attr('data-article-text', sourceObj.data('article-text'));
                destProxy.attr('data-article-image', sourceObj.data('article-image'));
            }
            
            swappedSourceElement.data('position', sourcePosition);
            swappedDestinationElement.data('position', destinationPosition);
            swappedSourceElement.find('.PinArticleBtn').data('position', sourcePosition);
            swappedDestinationElement.find('.PinArticleBtn').data('position', destinationPosition);


            $(ui.helper).remove(); //destroy clone
            sourceObj.remove();
            destObject.remove();
            
            var csrfToken = $('meta[name="csrf-token"]').attr("content");
            var postData = {
                sourcePosition: sourcePosition,
                sourceArticleId: sourcePostId,
                sourceIsSocial: sourceIsSocial,
                
                destinationPosition: destinationPosition,
                destinationArticleId: destinationPostId,
                destinationIsSocial: destinationIsSocial,
                
                _csrf: csrfToken
            };

            $.ajax({
                url: _appJsConfig.baseHttpPath + '/home/swap-article',
                type: 'post',
                data: postData,
                dataType: 'json',
                success: function(data){

                    if(data.success) {
                        $.fn.General_ShowNotification({message: "Articles swapped successfully"});
                    }
                    
                    $(".card p, .card h2").dotdotdot();
                    // self.events();
                    self.events_refresh();

                },
            });

        }
    }); 
};

Card.prototype.events_refresh = function() 
{
    if (_appJsConfig.isUserLoggedIn === 1 && _appJsConfig.userHasBlogAccess === 1) {
        this.initDroppable();
        this.initDraggable();        
        this.bindPinUnpinArticle();
        this.bindDeleteHideArticle();
    }
};

Card.prototype.events = function() 
{
    this.bindLightbox();

    if (_appJsConfig.isUserLoggedIn === 1 && _appJsConfig.userHasBlogAccess === 1) {
        this.initDraggable();        
        this.initDroppable();
        this.bindPinUnpinArticle();
        this.bindDeleteHideArticle();
        this.bindSocialUpdatePost();
    }
};
