(function ($) {
    
    $.image = function (options) {
        var defaults = {
            media : {},
            mediaOptions: {}
        };

        var opts = $.extend({}, defaults, options);
        
        var imageId = opts.media.id;
        var path = opts.media.path;
        var cloudName = opts.media.cloudName;
        if(typeof cloudName === 'undefined' || cloudName === '') {
            return;
        }
        
        $.cloudinary.config({cloud_name:cloudName});
        if(imageId === '' &&  path === '') {
            return;
        }
        

        var size = {};
        if (opts.width !== 0) {
            size.width = opts.width;
        }
        if (opts.height !== 0) {
            size.height = opts.height;
        } 

        if (opts.mediaOptions.width === 0) {
            delete opts.mediaOptions.width;
        }

        if (opts.mediaOptions.height === 0) {
            delete opts.mediaOptions.height;
        }




        var imageOptions = $.extend({},size, opts.mediaOptions);
        var url = $.cloudinary.url(imageId, imageOptions);
        
        return url;
    };
    
    $.video = function (options) {
        var defaults = {
            media : {},
            width: 700,
            height:400,
            mediaOptions: {}
        };

        var opts = $.extend({}, defaults, options);
        
        var videoId = opts.media.videoId;
        var path = opts.media.path;
        var cloudName = opts.media.cloudName;
        if(typeof cloudName === 'undefined' || cloudName === '') {
            return;
        }
        
        $.cloudinary.config({cloud_name:cloudName});
        if(videoId === '' &&  path === '') {
            return;
        }
        var videoOptions = $.extend({},{height: opts.height, width: opts.width}, opts.mediaOptions);
        var url = $.cloudinary.video(videoId, videoOptions);
        
        return url;
    };
}(jQuery));