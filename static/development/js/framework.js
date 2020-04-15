(function ($) {
    window.Acme       = {};
    Acme.View         = {};
    Acme.Model        = {};
    Acme.Collection   = {};
    Acme.Controller   = {};
    Acme.State        = {};
    Acme.SigninView   = {};
    Acme.SigninView   = {};
    Acme.UserProfileController = function(){};

    if (window.location.port && window.location.port !== '80' && !_appJsConfig.baseHttpPath.split(':')[2] ) {
        var path = _appJsConfig.baseHttpPath;
        if (path.indexOf('/@') > -1) {
            path = path.split('/@');
            path = path[0] + ":" + window.location.port + "/@" + path[1];
        } else {
            path += ':' + window.location.port;
        }
        _appJsConfig.baseHttpPath = path;

        var path = _appJsConfig.appHostName;
        if (path.indexOf('/@') > -1) {
            path = path.split('/@');
            path = path[0] + ":" + window.location.port + "/@" + path[1];
        } else {
            path += ':' + window.location.port;
        }
        _appJsConfig.appHostName = path;


        

    }

    $('html').on('click', function(e) {
        $('.Acme-pulldown ul').hide();
    });

    Acme.server = {

        create: function(uri, queryParams) {return this.call(uri, queryParams, 'post');},
        fetch: function(uri, queryParams, datatype){return this.call(uri, queryParams, 'get', datatype);},
        update: function(uri, queryParams) {return this.call(uri, queryParams, 'put');},
        delete: function(uri, queryParams) {return this.call(uri, queryParams, 'delete');},
        call: function(uri, queryParams, type, datatype) {

            if (!window.location.origin) {
                 window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
            }
            type = (typeof type !== 'undefined') ? type : 'get';

            queryParams = (typeof queryParams !== 'undefined') ? queryParams : {};
            
            var url = (uri.indexOf("http") === 0) ? uri : _appJsConfig.appHostName + uri;

            return $.ajax({
                url: url,
                data: queryParams,
                dataType: datatype || "json",
                type: type
            }).fail(function(r) {
                // console.log(r);
                if (r.status == 501 || r.status == 404) console.log(r.responseText);
                if (r.responseJSON) console.log(r.responseJSON);
                console.log(r);
                console.log(r.responseText);
            });
        },
        callClient: function(uri, queryParams, type) {
            type = (typeof type !== 'undefined') ? type : 'get';
            queryParams = (typeof queryParams !== 'undefined') ? queryParams : '';
            return $.ajax({
                url: window.location.origin + uri,
                data: queryParams,
                dataType: "json",
                type: type
            });
        }
    }

    Acme.listen = function() {};
    Acme.listen.prototype.listener = function(topic, data)
    {
        // console.log(listner);
        var keys = Object.keys(data);
        for (var i = 0; i<keys.length; i++) {
            for (var listener in this.listeners) {
                if ( listener === keys[i] ) {
                    this.listeners[listener].call(this, data, topic);
                    if (this.listeners.after) {
                        this.listeners.after.call(this, data, topic);
                    }
                    break;
                }
            }
        }
    };


    Acme.Model.create = function(config)
    {
        var obj = Object.create(
        Acme._Model.prototype, {
            'resource': {
                    'value' : config['url'],
                    'enumerable': true,
                },
                'alias' : {
                    'value' : config['alias'] || null,
                    'enumerable': true,
                },
                'resource_id': {
                    'value' : config['resource_id'],
                    'enumerable': true,
                },
                'query' : {
                    'value': [],
                    'writable': true,
                    'enumerable': true,
                }
            }
        );
        for (var param in config['this']) {
            obj[param] = config['this'][param];
        }
        obj.messages = {
            'set'   : 'updated',
            'delete': 'deleted',
        };

        if (config['messages']) {
            for (var msg in config['messages']) {
                obj.messages[msg] = config['messages'][msg];
            }
        }

        return obj;
    };



    Acme._View = function() {};
        Acme._View.prototype = new Acme.listen();
        Acme._View.prototype.updateData = function(data) {
            var keys = Object.keys(data);
            for (var j=0; j<keys.length; j++) {
                var key = keys[j];
                var keySplit = key.split('.');
                var scope = this.data;
    
                for(var i=0; i<keySplit.length; i++) {
                    if (!scope[keySplit[i]]) {
                        scope[keySplit[i]] = {};
                    }
                    if(i == keySplit.length -1 ) {
                        scope[keySplit[i]] = data[key];
                    }
                    scope = scope[keySplit[i]];
                }
            }
        }

    Acme.View.create = function(config)
    {
        var obj = function(){};

        for (conf in config) {
            obj.prototype[conf] = config[conf];
        }

        return obj;
    }

    Acme._Collection = function(model) {
        this.model = model || null;
    };
        Acme._Collection.prototype = Object.create(Acme.listen.prototype);
        Acme._Collection.prototype.fetch = function(url)
        {
            var self = this;
            var publishToken = self.name;
            var url = (url === undefined) ? this.url() : url;
            var data = Acme.server.fetch( url );
            data.done( function(response) {

                self.data = [];
                for (var i=0; i<response.length; i++) {
                    self.data.push( Object.create(self.model,
                        {   'data' : {
                                'value': response[i],
                                'writable': true
                            }
                        }
                    ));
                }

                var data = {};
                data[publishToken] = self;
                Acme.PubSub.publish('state_changed', data);
            });
            return data;
        };

    Acme._Model = function() {};
        Acme._Model.prototype = Object.create(Acme.listen.prototype);
        Acme._Model.prototype.url = function()
        {
            if (this.resource_id) {
                var scope = this;
                var scopeSplit = this.resource_id.split('.');
                for (var k = 0; k < scopeSplit.length; k++) {
                    scope = scope[scopeSplit[k]];
                    if (scope == undefined) return;
                }
                var resource_id = scope
            }
            var id = resource_id || this.data.id;
            return this.resource + '/' + id + this.buildParams();
        };
        Acme._Model.prototype.buildParams = function()
        {
            var query = '';
            for(var i=0;i<this.query.length; i+=2) {
                if (this.query[i+1] != false ) {
                    query += (i===0) ? '?' : '&';
                    query += this.query[i] + '=' + this.query[i+1];
                }
            }
            return query;
        };
        Acme._Model.prototype.fetch = function(set)
        {
            var self = this;
            var set = (set === void 0) ? true : set;
            return Acme.server.request(self.url())
            .done(function(r) {
                if (set) self.set(r.data);
            });
        };
        Acme._Model.prototype.update = function(data, msg)
        {
            var self = this;

            return Acme.server.update(self.url(), data)
            .done(function(d, status, xhr) {
                if (xhr.status === 200) {
                    self.set(data, msg);

                    var message = self.resource + '/update';

                    // console.log(Acme.socket.send(JSON.stringify({action: message, value: self.data.id})));

                }
            });
        };

        Acme._Model.prototype.updater = function()
        {
            var self = this;
            var _url = self.url();

            return function(data, msg) {
                return Acme.server.update(_url, data)
                .done(function(d, status, xhr) {
                    if (xhr.status === 200) {
                        self.set(data, msg);
                    }
                });
            }
        };

        Acme._Model.prototype.set = function(value, msg)
        {
            var suppress = msg || false;
            for (var v in value) {
                this.data[v] = value[v];
            }
            if (!suppress) {
                var resource = {};
                resource[this.resource] = this;
                // Acme.PubSub.publish('state_changed', resource);
                // Acme.PubSub.publish('update_state', resource);
                Acme.PubSub.publish(this.resource + '/' + this.messages.set, this);
            }
        };
        Acme._Model.prototype.delete = function()
        {
            var self = this;
            var name = self.alias || self.resource;
            var msg = name + '/delete';

            // console.log(Acme.socket.send(JSON.stringify({action: msg, value: self.data.id})));

            return Acme.server.delete(self.url())
            .done(function(response) {
                if (response.data == true) {
                    self.data = {};
                    var data =  {};
                    data[name] = null;
                    Acme.PubSub.publish('update_state', data);
                }
            });
        };




    Acme.PubSub = {
        topics : {},
        lastUid : -1,
    };

        Acme.PubSub.publisher = function(topic, data) {
            var self = this;
            var Deferred = function() {
                return {
                    done: function(func) {
                        this.func = func;
                    },
                    resolve: function() {
                        if (this.func) {
                            this.func();
                        }
                    }
                }
            };

            if ( !this.topics.hasOwnProperty( topic ) ){
                return false;
            }

            var dfd = Deferred();

            var notify = function(){
                var subscribers = self.topics[topic];

                for ( var i = 0, j = subscribers.length; i < j; i++ ){
                    var scope = window;
                    var scopeSplit = subscribers[i].context.split('.');

                    for (var k = 0; k < scopeSplit.length - 1; k++) {
                        scope = scope[scopeSplit[k]];
                        if (scope == undefined) return;
                    }

                    var caller = scope[scopeSplit[scopeSplit.length - 1]];
                    var func   = subscribers[i].func;
                    if (caller) {
                        caller[func]( topic, data );
                    }
                }
                dfd.resolve();
            };

            setTimeout( notify , 0 );

            return dfd;
        };

        Acme.PubSub.publish = function( topic, data ){
            return this.publisher( topic, data, false );
        };

        Acme.PubSub.reset = function( ){
            this.lastUid = -1;
        };

        Acme.PubSub.print = function(){
            var subscribers = this.topics;
            for (var sub in subscribers) {
                for ( var i = 0; i < subscribers[sub].length; i++ ) {
                }
            }
        };

        Acme.PubSub.subscribe = function( subscription ) {
            var callbacks = Object.keys(subscription);
            var ret_topics = {};

            for (var i=0;i<callbacks.length; i++) {
                for(var j=0;j<subscription[callbacks[i]].length;j++) {
                    var topic = subscription[callbacks[i]][j];

                    var context = callbacks[i].substring(0, callbacks[i].lastIndexOf('.'));

                    var func = callbacks[i].substring(callbacks[i].lastIndexOf('.') + 1);

                    if ( !this.topics.hasOwnProperty( topic ) ) {
                        this.topics[topic] = [];
                    }

                   for (var k=0;k<this.topics[topic].length; k++) {
                        if (this.topics[topic][k].context === context && this.topics[topic][k].func === func) {
                            return;
                        }
                    }

                    var token = (++this.lastUid).toString();

                    this.topics[topic].push( { token : token, func : func, context : context } );
                    ret_topics[topic] = this.topics[topic];
                }

            }
            return ret_topics;
        };

        Acme.PubSub.unsubscribe = function( token ){
            for ( var m in this.topics ){
                if ( this.topics.hasOwnProperty( m ) ){
                    for ( var i = 0, j = this.topics[m].length; i < j; i++ ){
                        if ( this.topics[m][i].token === token ){
                            this.topics[m].splice( i, 1 );
                            return token;
                        }
                    }
                }
            }
            return false;
        };










    Acme.listMenu = function(config)
    {
   
        this.defaultTemp = Handlebars.compile(
            '<div id="{{ name }}" class="{{class}}"> \
                <p class="Acme-pulldown__selected-item"></p> \
                <span class="Acme-pulldown__span"></span> \
                <ul class="Acme-pulldown__list" data-key="{{ key }}" class="articleExtendedData"></ul> \
            </div>'
        );
        this.defaultItemTemp  = Handlebars.compile(
            '<li data-clear="{{clear}}" data-value="{{value}}" style="text-align:left">{{label}}</li>'
        );
        this.divider          = "<hr>";
        this.callback         = config.callback      || null,
        this.menuParent       = config.parent        || {};
        this.class            = config.class         || "";
        this.template         = config.template      || this.defaultTemp;
        this.itemTemp         = config.itemTemp      || this.defaultItemTemp;
        this.list             = config.list          || [];
        this.allowClear       = config.allowClear    || null;
        this.defaultSelection = config.defaultSelect || null;
        this.name             = config.name          || null;
        this.key              = config.key           || null;
        this.listContainer    = null;
        this.defaultItem      = null;
        return this;
    };
        Acme.listMenu.prototype.init = function(prepend)
        {
            var prepend = prepend || 'append';
            this.menuParent[prepend]( this.template({"name": this.name, "key":this.key, "class":this.class}) );
            this.defaultItem   = $('#' + this.name+' p');
            this.listContainer = $('#' + this.name+' ul');
            this.events();
            if (this.extendedEvents) this.extendedEvents();
            return this;
        };
        Acme.listMenu.prototype.render = function()
        {
            this.listContainer.empty();
            if (this.defaultSelection != null) {
                this.defaultItem.text(this.defaultSelection.label);
            }
            var html = this.createList();
            this.listContainer.append( html );
            this.listElements  = this.listContainer.find('li');
            this.listItemEvents();
            return this;
        };
        Acme.listMenu.prototype.events = function()
        {
            var self = this;
            this.defaultItem.parent().on('click', function(e) {
                e.stopPropagation();
                self.listContainer.toggle();
            });
        };
        Acme.listMenu.prototype.createList = function()
        {
            var itemTemp = this.itemTemp;
            var html = '';
            if (this.allowClear) {
                html = itemTemp({
                    'label'   :  'Any',
                    'value'   :  '',
                    'clear'   : true
                });      
            }

            for (var i=0; i<this.list.length; i++) {
                if (typeof this.list[i] === 'string') {
                    var label = value = this.list[i];
                } else {
                    var label = this.list[i].label;
                    var value = this.list[i].value;
                }
                html += itemTemp({
                    'label'   :  label,
                    'value'   :  value || ''
                });
            }
            return html;
        };
        Acme.listMenu.prototype.listItemEvents = function()
        {
            var self = this;
            this.listContainer.unbind().on('click', function(e) {
                $.each(self.listElements, function(i,e) {
                    $(e).attr('checked', false);
                });
                var elem = $(e.target);
                var value = elem.data('value');
                var clear = elem.data('clear');
                elem.attr('checked', true);
                var data = {};
                data[self.key || self.name] = value;

                if (self.callback) {
                    self.callback(data);
                } else {
                    Acme.PubSub.publish('update_state', data);
                }
                
                if (clear) {
                    self.reset();
                } else {
                    self.defaultItem.text(elem.text())
                        .addClass('Acme-pulldown__selected-item--is-active');
                }

                $(self.listContainer).hide(100);
            });
        };
        Acme.listMenu.prototype.select = function(item)
        {
            var menuid = '#' + this.name + ' > p';
            $(menuid).text(item);
            return this;
        };
        Acme.listMenu.prototype.reset = function()
        {
            this.defaultItem.text(this.defaultSelection.label)
                  .removeClass('Acme-pulldown__selected-item--is-active');
            return this;
        };
        Acme.listMenu.prototype.remove = function()
        {
            $('#' + this.name).remove();
            return this;
        };
        Acme.listMenu.prototype.clear = function()
        {
            $('#' + this.name).html('');
            return this;
        };
        Acme.listMenu.prototype.empty = function()
        {
            this.listContainer.empty();
            return this;
        };
        Acme.listMenu.prototype.update = function(list)
        {
            this.list = list;
            this.empty();
            this.render();
            return this;
        };



        Acme.modal = function(template, name, layouts, data) {
            this.template = template || null;
            this.parentCont = name   || null;
            this.layouts = layouts   || null;
            this.data = data         || {};
            this.dfd = $.Deferred();
        }
            Acme.modal.prototype = new Acme.listen();
    
            Acme.modal.prototype.render = function(layout, title, data) {
                var preRendered = false;
    
                if (typeof data === 'string') {
                    preRendered = true;
                } else {
                    this.data = data || this.data;
                }
    
                if (title) {
                    this.data['title'] = title;
                }
    
    
                this.data['name'] = this.parentCont;
                console.log(this.template);
                var tmp = Handlebars.compile(Acme.templates[this.template]);
                var tmp = tmp(this.data);
    
                $('html').addClass('u-noscroll')
                $('body').addClass('u-noscroll').append(tmp);
                // $('body').append(tmp);
    
                if (layout) {
                    this.renderLayout(layout, this.data);
                }
    
                if (preRendered) {
                    this.renderPreLayout(data);
                }
    
                this.events();
                this.rendered(); // lifecycle hook that can be overriden
                return this.dfd.promise();
            };
            Acme.modal.prototype.renderLayout = function(layout, data) {
                var data = data || {};
                var layoutTemplate = Acme.templates[this.layouts[layout]];
                console.log(this.layouts);
                console.log(layout);
                if (layoutTemplate) {

                    var tmp = Handlebars.compile(Acme.templates[this.layouts[layout]]);
                    // $('#'+this.parentCont).attr("title", layout); 
                    var layout = tmp(data);
                    $('#'+this.parentCont).find('#dialogContent').empty().append(layout); 
                } else {
                    console.log(this.layouts[layout], 'Does not exist' );
                }

                // if (typeof data.modal_title != 'undefined') {
                //     $('.signin-modal__title').text(data.modal_title);
                // }
            };
            Acme.modal.prototype.renderPreLayout = function(html) {
                $('#'+this.parentCont).find('#dialogContent').empty().append(html); 
            };
            Acme.modal.prototype.events = function() 
            {
                var self = this;
                $('#'+this.parentCont).on("click", function(e) {
                    self.handle(e);
                });
    
            };
            Acme.modal.prototype.rendered = function() {
                return true;
            };
            Acme.modal.prototype.handle = function(e) {
                var $elem = $(e.target);
                if ( !$elem.is('input') && !$elem.is('a') && !$elem.parent().is('a') ) {
                    e.preventDefault();
                }
                if ($elem.data('behaviour') == 'close') {
                    e.preventDefault();
                    this.closeWindow();
                }
                if ( $elem.is('button') ) {
                    if ($elem.text().toLowerCase() === "cancel" || $elem.data('role') == 'cancel') {
                        this.dfd.fail();
                        this.closeWindow();
    
                    } else if ($elem.text().toLowerCase() === "okay" || $elem.data('role') == 'okay') {
                        this.dfd.resolve();
                        this.closeWindow();
                    }
                }
                return $elem;
            };
            Acme.modal.prototype.closeWindow = function() {
                $('body').removeClass('u-noscroll');
                $('html').removeClass('u-noscroll');
                $('#'+this.parentCont).remove();
            };
        
    
        Acme.lightBox = function(template, parent, layouts) {
            this.template = template;
            this.parentCont = parent;
            this.layouts = layouts;
            this.parent = Acme.modal.prototype;
        };
            Acme.lightBox.prototype = new Acme.modal();
            Acme.lightBox.constructor = Acme.lightBox;
            Acme.lightBox.prototype.handle = function(e) {
                var self = this;
                var $elem = this.parent.handle.call(this, e);
            };
    


    Acme.dialog = {
        type : '',
        state : {},

        show : function(message, type, callback, self, data) {
            var that = this;
            var template  = '<div id="wrapper" class="flex_col"> <div id="dialog"><div><p id="dialogTitle">{{title}}</p><div id="dialogMessage">{{message}}</div>';
                template += '<ul id="dialogButtons"><button>Okay</button><button>Cancel</button></div></div></div>';

            template = template.replace( /{{title}}/ig, type || "");
            template = template.replace( /{{message}}/ig, message);
            var dfd = $.Deferred();

            $('body').append(template);
            $('#dialog').on("click", function(e) {
                var $elem = $(e.target);
                if (!$elem.is('input')) {
                    e.preventDefault();
                }

                if ( $elem.is('button') ) {
                    if ($elem.text() === "Cancel") {
                        Acme.dialog.closeWindow();
                    } else if ($elem.text() === "Okay") {
                        Acme.dialog.closeWindow();

                        // State can be provided by client external to 'show' call
                        if (data === undefined && that.state) {
                            data = that.state;
                        // If data is also provided we merge the two
                        } else if (that.state) {
                            var keys = Object.keys(that.state)
                            for (var k=0; k<keys.length;k++) {
                                data[keys[k]] = that.state[keys[k]];
                            }
                        }

                        if (self != undefined) {
                            if (data != undefined) {
                                var result = callback.call(self, data);
                                dfd.resolve(result);
                            } else {
                                var result = callback.call(self);
                                dfd.resolve(result);
                            }
                        } else {
                            var result = callback();
                            dfd.resolve(result);
                        }
                    }
                }
            });
            return dfd.promise();
        },
        closeWindow : function() {
            $('#dialog').closest('#wrapper').remove();
        }
    };

}(jQuery));


    


