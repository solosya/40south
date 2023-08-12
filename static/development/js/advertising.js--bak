(function($) {


    Acme.LoadAds = function()
    {
        if ($(".j-adslot").length > 0) {
            var adslots = $(".j-adslot");
            var deviceSize = getDeviceForAd();
            for (var i=0;i<adslots.length;i++) {
                var elem = adslots[i];
                var self = $("#"+elem.id);
                self.removeClass("j-adslot");
                var keysArray = [elem.id,deviceSize];
                if ($(".j-keyword-cont").length > 0) {
                    var keywordCont = $(".j-keyword-cont")[0];
                    var keysExtra = keywordCont.dataset.keywords.split(',');
                    if (keysExtra[0] != ""){
                        for (var j=0;j<keysExtra.length;j++){
                            if (keysExtra[j] != "") {
                                keysArray.push(keysExtra[j]);
                            }
                        }
                    } else {
                        keysArray.push('default');
                    }
                } else {
                    keysArray.push('default');
                }
                var keysString = keysArray.join(',')
                $.ajax({
                    type: 'GET',
                    url: _appJsConfig.appHostName + '/api/ad/get-all',
                    dataType: 'json',
                    data: {
                        'keywords': keysString,
                    },
                    success: function (data, textStatus, jqXHR) {
                        if (data.length < 1 ){
                            console.log('no ads found with those keywords',keysString)
                            return;
                        } else if (data.length > 1 ){
                            var k = Math.round(Math.random()*(data.length-1));
                        } else {
                            var k = 0;
                        }
                        var self = data[k];
                        keys = self.keywords.split(',');
                        if (self.media.path){
                            var settings = self.button.url.split(' ');
                            var extras = " ";
                            for (i=1;i<settings.length;i++){
                                extras = extras + ' ' + settings[i]
                            }
                            $("#"+keys[0]).html("<div class='advertisment advertisment__"+keys[0]+" advertisment__"+keys[1]+"'><a href='"+settings[0]+"'"+extras+"><img src='"+self.media.path+"'></a></div>");
                        } else if (self.description){
                            $("#"+keys[0]).html("<div class='advertisment advertisment__"+keys[0]+" advertisment__"+keys[1]+"'>"+self.description+"</div>");
                        }
                        
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('error retreiving ad', textStatus, errorThrown);
                        $('#createUserErrorMessage').text(textStatus);
                    },
                });
            }
        }

        function getDeviceForAd() {
            var width = $(window).width();
            if (width > 991) {
                return 'desktop';
            } else if (width < 992 && width > 767) {
                return 'tablet';
            } else if (width < 768) {
                return 'mobile';
            }
        }
    }

    Acme.LoadAds()
}(jQuery));
