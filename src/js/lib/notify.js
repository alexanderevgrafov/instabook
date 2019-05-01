(function(plugin) {

    var component;

    if (jQuery) {
        component = plugin(jQuery);
    }

    if (typeof define == "function" && define.amd) {
        define("notify", function(){
            return component || plugin(jQuery);
        });
    }

})(function($){

    var containers = {},
        messages   = {},

        notify     =  function(options){

            if (arguments.length > 1 && arguments[0] === "close") {
                    messages[arguments[1]] && messages[arguments[1]].close(arguments[3]);
                    return;
            }

            if ($.type(options) === 'string') {
                options = { message: options };
            }

            if (arguments[1]) {
                options = $.extend(options, $.type(arguments[1]) === 'string' ? {status:arguments[1]} : arguments[1]);
            }

            return (new Message(options)).show();
        };

    var Message = function(options){

        var $this = this;

        this.options = $.extend({}, Message.defaults, options);

//        this.options.timeout = 0;

        this.uuid    = "ID"+(new Date().getTime())+"RAND"+(Math.ceil(Math.random() * 100000));

        this.element = $([
            '<div class="alert notify-message">',
            '<button type="button" class="close" aria-hidden="true">&times;</button>',
            '<div>' + this.options.message + '</div>',
            '</div>'
        ].join('')).data("notifyMessage", this);

        if(this.options.status == 'error') {
            this.options.status = 'danger';
        }

        this.element.addClass('alert-' + this.options.status);
        this.currentstatus = this.options.status;
        this.closeOnlyOnX = this.options.closeOnlyOnX;
        if(this.closeOnlyOnX === true)
            this.element.addClass("notify-default");

        messages[this.uuid] = this;

        if ( this.options.replace && messages[this.options.replace]) {
            messages[this.options.replace].close();
        }

        if(!containers[this.options.pos]) {
            containers[this.options.pos] = $('<div class="v-notify notify notify-'+this.options.pos+'"></div>').appendTo('body').on("click", ".notify-message", function(e){
                if(!$this.closeOnlyOnX || ($this.closeOnlyOnX && e.target && e.target.className == "close"))
                    $(this).data("notifyMessage").close();
            });
        }
    };

    $.extend(Message.prototype, {

        uuid: false,
        element: false,
        timout: false,
        currentstatus: "",

        show: function() {

            if (this.element.is(":visible")) return;

            var $this = this;

            containers[this.options.pos].css('zIndex', this.options.zIndex).show().prepend(this.element);

            var marginbottom = parseInt(this.element.css("margin-bottom"), 10),
                onShow = function(){

                    if ($this.options.timeout) {

                        var closefn = function(){ $this.close(); };

                        $this.timeout = setTimeout(closefn, $this.options.timeout);

                        $this.element.hover(
                            function() { clearTimeout($this.timeout); },
                            function() { $this.timeout = setTimeout(closefn, $this.options.timeout);  }
                        );
                    }

                };

            if ( this.options.showInstant ) {
                this.element.css({"margin-top": 0, "margin-bottom": marginbottom});
                onShow();
            } else {
                this.element.css({
                    "opacity": 0,
                    "margin-top": -1 * this.element.outerHeight(),
                    "margin-bottom": 0
                }).animate({"opacity": 1, "margin-top": 0, "margin-bottom": marginbottom}, onShow);
            }

            return this;
        },

        close: function(instantly) {

            var $this    = this,
                finalize = function(){
                    $this.element.remove();

                    if(!containers[$this.options.pos].children().length) {
                        containers[$this.options.pos].hide();
                    }

                    $this.options.onClose.apply($this, []);

                    delete messages[$this.uuid];
                };

            if(this.timeout) clearTimeout(this.timeout);

            if(instantly) {
                finalize();
            } else {
                this.element.animate({"opacity":0, "margin-top": -1* this.element.outerHeight(), "margin-bottom":0}, function(){
                    finalize();
                });
            }
        },

    });

    Message.defaults = {
        message: "",
        status: "default",
        timeout: 5000,
        pos: 'top-center',
        zIndex: 10400,
        showInstant: false,
        closeOnlyOnX: false,
        onClose: function() {}
    };

    return $.notify = notify
});