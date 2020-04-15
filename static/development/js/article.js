Acme.ArticleController = function() {
    return new Acme.article();
}
Acme.article = function() {
    this.events();
};



Acme.article.prototype.InsertInterstitial = function(teads) {
    if ($('.article_content > p').length >= 8 && teads == true) {
        teadsAd = true;       
    }
    if ($('.article_content > p').length >= 7) {
        $("<div class='visible-xs-block ad-article' style='position:relative;width:300px;margin: 0 auto;'><div class='advert-mobile' data-adsize='mrec'></div></div>").insertAfter( $('.article_content > p')[6] );
	}
}
Acme.article.prototype.events = function() {
    var self=this;

    $('#oovvuu-curate').on('click', function(e) {
        e.preventDefault();
        window.OVU = {};
        $.getScript("https://videos.oovvuu.com/mmgp/v1/ovu_curate.js")
            .done(function() {
                var article_text = $('#articleContent').text();
                var id = ""+$('#article-content').data('id');
                var headline = $('#article-title').text();
                var status = $('#article-content').data('status');
                OVU.OovvuuCurateVideos(id, null, headline, null, article_text, status);
             // OVU.OovvuuCurateVideos(id, user_id, headline, lede, article_text,article_status, tags);

            }).fail(function(r) {
                console.log(r);
            });
    });
}


Acme.GalleryToggle = function() {
    this.events();
};
Acme.GalleryToggle.prototype.events = function() {
    var self = this;
    $('#gallery-toggle').on('click', function(e) {
        var option = $(e.target);

        if (option.hasClass('gallery-toggle__item')) {
            var types = ['image', 'video'];
            var items = $('.gallery-toggle__item').removeClass('gallery-toggle__item--selected');

            option.addClass('gallery-toggle__item--selected');
            var type = types.indexOf( option.data('type') );
            var show = $('.owl-gallery-' + types[type]);
            var hide = $('.owl-gallery-' + types[!type | 0]);
            hide.removeClass('default');
            show.addClass('default');
            
            if (types[type] == 'image') {
                self.stopVideo();
            }
        }
    });


    $('.owl-prev, .owl-next').on('click', function(e) {
        self.stopVideo();
    });

};

Acme.GalleryToggle.prototype.stopVideo = function() {
    $('.article-video').each(function() {
        this.pause();
    });
    
    $('.external-article-video').each(function() {
        var videoSource = $(this).data('source');
        if ( videoSource == 'youtube' ){
            this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        } else if (videoSource == 'brightcove') {
            this.contentWindow.postMessage("pauseVideo", location.protocol+'//players.brightcove.net');
        } else if (videoSource == 'vimeo') {
            var player = new Vimeo.Player(this);
            player.pause();
        }
    });

}