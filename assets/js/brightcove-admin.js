(function($){
/**
     * Media model for Media CPT
     */
var MediaModel = Backbone.Model.extend({
    /**
         * Copied largely from WP Attachment sync function
         * Triggered when attachment details change
         * Overrides Backbone.Model.sync
         *
         * @param {string} method
         * @param {wp.media.model.Media} model
         * @param {Object} [options={}]
         *
         * @returns {Promise}
         */
    sync: function(a, b, c) {
        var d = null;
        // If the attachment does not yet have an `id`, return an instantly
        // rejected promise. Otherwise, all of our requests will fail.
        if (// Set the accountHash to the wpbc.preload.accounts[*] where the account_id
        // matches this media objects account_id.
        _.find(wpbc.preload.accounts, function(a, b) {
            return a.account_id === this.get("account_id") ? (d = b, !0) : void 0;
        }, this), _.isUndefined(this.id)) return $.Deferred().rejectWith(this).promise();
        // Overload the `read` request so Media.fetch() functions correctly.
        if ("read" === a) return c = c || {}, c.context = this, c.data = _.extend(c.data || {}, {
            action: "bc_media_fetch",
            id: this.id
        }), wp.media.ajax(c);
        if ("update" === a) {
            c = c || {}, c.context = this, // Set the action and ID.
            c.data = _.extend(c.data || {}, {
                account: d,
                action: "bc_media_update",
                description: this.get("description"),
                long_description: this.get("long_description"),
                name: this.get("name"),
                nonce: wpbc.preload.nonce,
                tags: this.get("tags"),
                type: this.get("mediaType"),
                width: this.get("width"),
                height: this.get("height")
            });
            var e = this.get("video_ids");
            return e ? (c.data.playlist_id = this.id, c.data.playlist_videos = e, c.data.type = "playlists") : c.data.video_id = this.id, 
            c.success = this.successFunction, c.error = this.failFunction, wpbc.broadcast.trigger("spinner:on"), 
            wp.media.ajax(c);
        }
        return "delete" === a ? (c = c || {}, c.data = _.extend(c.data || {}, {
            account: d,
            action: "bc_media_delete",
            id: this.get("id"),
            nonce: wpbc.preload.nonce,
            type: this.get("mediaType")
        }), wp.media.ajax(c).done(function(a) {
            this.destroyed = !0, wpbc.broadcast.trigger("delete:successful", a), "videos" !== this.get("mediaType") && _.isUndefined(this.get("video_ids")) ? wpbc.preload.playlists = void 0 : wpbc.preload.videos = void 0, 
            wpbc.responses = {};
        }).fail(function(a) {
            this.destroyed = !1, wpbc.broadcast.trigger("videoEdit:message", a, "error"), wpbc.broadcast.trigger("spinner:off");
        })) : Backbone.Model.prototype.sync.apply(this, arguments);
    },
    /**
         * Convert date strings into Date objects.
         *
         * @param {Object} resp The raw response object, typically returned by fetch()
         * @returns {Object} The modified response object, which is the attributes hash
         *    to be set on the model.
         */
    parse: function(a) {
        return a ? (a.date = new Date(a.date), a.modified = new Date(a.modified), a) : a;
    },
    getAccountName: function() {
        var a = (this.get("account_id"), _.findWhere(wpbc.preload.accounts, {
            account_id: this.get("account_id")
        }));
        return void 0 === a ? "unavailable" : a.account_name;
    },
    getReadableDuration: function() {
        var a = this.get("duration");
        if (a) {
            a = Number(a / 1e3);
            var b = Math.floor(a / 3600), c = Math.floor(a % 3600 / 60), d = Math.floor(a % 3600 % 60);
            return (b > 0 ? b + ":" + (10 > c ? "0" : "") : "") + c + ":" + (10 > d ? "0" : "") + d;
        }
        return a;
    },
    getReadableDate: function(a) {
        var b = this.get(a);
        if (b) {
            var c = new Date(b), d = c.getHours(), e = c.getMinutes(), f = c.getFullYear(), g = c.getMonth() + 1, h = c.getDate(), i = d >= 12 ? "pm" : "am";
            d %= 12, d = d ? d : 12, e = 10 > e ? "0" + e : e;
            var j = f + "/" + g + "/" + h + " - " + d + ":" + e + " " + i;
            return j;
        }
        return b;
    },
    successFunction: function(a) {
        if (wpbc.broadcast.trigger("videoEdit:message", a, "success"), wpbc.broadcast.trigger("spinner:off"), 
        _.isArray(this.get("video_ids")) && wpbc.preload && wpbc.preload.playlists) {
            var b = this.get("id");
            _.each(wpbc.preload.playlists, function(a, c) {
                a.id === b && (wpbc.preload.playlists[c] = this.toJSON());
            }, this);
        }
        wpbc.responses = {}, "videos" !== this.get("mediaType") && _.isUndefined(this.get("video_ids")) ? wpbc.preload.playlists = void 0 : wpbc.preload.videos = void 0;
    },
    failFunction: function(a) {
        wpbc.broadcast.trigger("videoEdit:message", a, "error"), wpbc.broadcast.trigger("spinner:off");
    }
}), MediaCollection = Backbone.Collection.extend({
    model: MediaModel,
    /**
         * @param {Array} [models=[]] Array of models used to populate the collection.
         * @param {Object} [options={}]
         */
    initialize: function(a, b) {
        b = b || {}, b.activeAccount && (this.activeAccount = b.activeAccount), this.additionalRequest = !1, 
        this.pageNumber = this.pageNumber || 1, this.mediaType || "existingPlaylists" !== this.mediaCollectionViewType && "libraryPlaylists" !== this.mediaCollectionViewType || (this.mediaType = "videos"), 
        this.mediaCollectionViewType = b.mediaCollectionViewType || "grid", b.excludeVideoIds && "libraryPlaylists" === b.mediaCollectionViewType && (this.excludeVideoIds = b.excludeVideoIds), 
        b.videoIds && !a ? (this.mediaType = "videos", this.videoIds = b.videoIds, this.fetch()) : "playlists" !== b.mediaType && (this.mediaType = "videos", 
        this.fetch()), this.mediaType = b.mediaType, "videos" === this.mediaType && this.listenTo(wpbc.broadcast, "uploader:uploadedFileDetails", function(a) {
            this.add(a, {
                at: 0
            });
        }), this.activeAccount = b.activeAccount || "all", this.searchTerm = b.searchTerm || "", 
        this.dates = b.dates || "all", this.tag = b.tag || "", this.listenTo(wpbc.broadcast, "change:activeAccount", function(a) {
            this.activeAccount = a, this.fetch();
        }), this.listenTo(wpbc.broadcast, "change:searchTerm", function(a) {
            this.searchTerm = a, this.fetch();
        }), this.listenTo(wpbc.broadcast, "change:tag", function(a) {
            "all" === a && (a = ""), this.tag = a, this.fetch();
        }), this.listenTo(wpbc.broadcast, "change:date", function(a) {
            this.date = a, this.fetch();
        }), this.listenTo(wpbc.broadcast, "tabChange", function(a) {
            if (this.killPendingRequests(), a.mediaType !== this.mediaType) {
                this.mediaType = a.mediaType;
                for (var b, c = wpbc.preload[this.mediaType]; b = this.first(); ) this.remove(b);
                void 0 !== c ? this.add(c) : this.fetch();
            }
        });
    },
    killPendingRequests: function() {
        // Kill all pending requests
        _.each(wpbc.requests, function(a) {
            a.abort();
        }), wpbc.requests = [];
    },
    checksum: function(a) {
        _.isString(a) || (a = _.isFunction(a.toJSON) ? a.toJSON() : JSON.stringify(a));
        for (var b = 305419896, c = 0; c < a.length; c++) b += a.charCodeAt(c) * (c + 1);
        return b;
    },
    /**
         * Overrides Backbone.Collection.sync
         *
         * @param {String} method
         * @param {Backbone.Model} model
         * @param {Object} [options={}]
         * @returns {Promise}
         */
    sync: function(a, b, c) {
        var d, e;
        // Overload the read method so Media.fetch() functions correctly.
        if ("read" === a) {
            c = c || {}, c.data = _.extend(c.data || {}, {
                action: "bc_media_query",
                account: this.activeAccount,
                dates: this.date,
                posts_per_page: 100,
                page_number: this.pageNumber,
                nonce: wpbc.preload.nonce,
                search: this.searchTerm,
                tags: this.tag,
                tagName: wpbc.preload.tags[this.tag],
                type: this.mediaType || "videos"
            });
            var f = _.pick(c.data, "account", "dates", "posts_per_page", "search", "tags", "type");
            // Determine if we're infinite scrolling or not.
            this.additionalRequest = _.isEqual(f, wpbc.previousRequest), this.additionalRequest || (c.data.page_number = 1), 
            /* Prevent reloading on the playlist edit as the playlist videos are one request and library videos another */
            "existingPlaylists" !== this.mediaCollectionViewType && (wpbc.previousRequest = f), 
            this.videoIds && (c.data.videoIds = this.videoIds.length ? this.videoIds : "none"), 
            c.data.query = d, _.contains([ "libraryPlaylists", "existingPlaylists" ], this.mediaCollectionViewType) || this.killPendingRequests();
            var g = this.checksum(c.data);
            if (!_.isUndefined(wpbc.responses[g])) return this.parse({
                data: wpbc.responses[g]
            }, "cached"), !0;
            var h = $.ajax({
                type: "POST",
                url: wp.ajax.settings.url,
                context: this,
                data: c.data
            }).done(function(a, b, c) {
                this.parse(a, b, c, g);
            }).fail(this.fetchFail);
            return wpbc.requests.push(h), wpbc.broadcast.trigger("spinner:on"), h;
        }
        /**
                 * Call wp.media.model.MediaCollection.sync or Backbone.sync
                 */
        return e = MediaCollection.prototype.sync ? MediaCollection.prototype : Backbone, 
        e.sync.apply(this, arguments);
    },
    fetchFail: function() {
        this.pageNumber > 1 && this.pageNumber--, wpbc.broadcast.trigger("fetch:finished"), 
        "abort" === status;
    },
    /**
         * A custom AJAX-response parser.
         *
         * See trac ticket #24753
         *
         * @param {Object|Array} resp The raw response Object/Array.
         * @param {Object} xhr
         * @returns {Array} The array of model attributes to be added to the collection
         */
    parse: function(a, b, c, d) {
        if (wpbc.broadcast.trigger("fetch:finished"), wpbc.broadcast.trigger("spinner:off"), 
        !_.contains([ "success", "cached" ], b)) return !1;
        var e = a.data;
        if ("success" === b && (wpbc.responses[d] = e), !1 === e) return !1;
        _.isArray(e) || (e = [ e ]), /**
             * In playlist video search, we remove the videos that already exist in the playlist.
             */
        _.isArray(this.excludeVideoIds) && _.each(this.excludeVideoIds, function(a) {
            e = _.without(e, _.findWhere(e, {
                id: a
            }));
        });
        var f = _.map(e, function(a) {
            var b, c, d;
            return a instanceof Backbone.Model ? (b = a.get("id"), a = a.attributes) : b = a.id, 
            c = this.findWhere({
                id: b
            }), c ? (d = c.parse(a), _.isEqual(c.attributes, d) || c.set(d)) : c = this.add(a), 
            c.set("viewType", this.mediaCollectionViewType), c;
        }, this);
        this.additionalRequest ? this.add(f) : this.set(f);
    }
}), BrightcoveMediaManagerModel = Backbone.Model.extend({
    defaults: {
        view: "grid",
        date: "all",
        tags: "all",
        type: null,
        // enum[playlist, video]
        preload: !0,
        search: "",
        account: "all"
    },
    initialize: function(a) {
        _.defaults(a, this.defaults);
        var b = new MediaCollection([], {
            mediaType: a.mediaType
        });
        b.reset(), /* Prevent empty element from living in our collection */
        a.preload && a.preload.length && b.add(a.preload), a.preload = !!a.preload, // Whether or not a preload var was present.
        this.set("media-collection-view", new MediaCollectionView({
            collection: b
        })), this.set("options", a);
    }
}), BrightcoveModalModel = Backbone.Model.extend({
    getMediaManagerSettings: function() {
        var a = this.get("tab"), b = {
            upload: {
                accounts: "all",
                date: "all",
                embedType: "modal",
                mediaType: "videos",
                mode: "uploader",
                preload: !0,
                search: "",
                tags: "all",
                viewType: "grid"
            },
            videos: {
                accounts: "all",
                date: "all",
                embedType: "modal",
                mediaType: "videos",
                mode: "manager",
                preload: !0,
                search: "",
                tags: "all",
                viewType: "grid"
            },
            playlists: {
                accounts: "all",
                date: "all",
                embedType: "modal",
                mediaType: "playlists",
                mode: "manager",
                preload: !0,
                search: "",
                tags: "all",
                viewType: "grid"
            }
        };
        return void 0 !== b[a] ? b[a] : !1;
    }
}), UploadModelCollection = Backbone.Collection.extend({
    initialize: function(a) {
        this.listenTo(wpbc.broadcast, "uploader:queuedFilesAdded", this.queuedFilesAdded);
    },
    queuedFilesAdded: function(a) {
        _.each(a, function(a) {
            this.add(new UploadModel(a));
        }, this);
    }
}), UploadModel = Backbone.Model.extend({
    initialize: function(a) {},
    humanReadableSize: function() {
        var a = this.get("size");
        if (0 === a) return "0 Byte";
        var b = 1e3, c = [ "Bytes", "KB", "MB", "GB" ], d = Math.floor(Math.log(a) / Math.log(b));
        return (a / Math.pow(b, d)).toPrecision(3) + " " + c[d];
    }
}), BrightcoveView = wp.Backbone.View.extend({
    subviews: null,
    registerSubview: function(a) {
        this.subviews = this.subviews || [], this.subviews.push(a);
    },
    remove: function() {
        _.invoke(this.subviews, "remove"), wp.Backbone.View.prototype.remove.call(this);
    },
    insertShortcode: function() {
        if (this.model) {
            var a = this.model.get("id").replace(/\D/g, ""), b = this.model.get("account_id").replace(/\D/g, ""), c = this.model.get("width"), d = this.model.get("height"), e = "";
            e = "videos" === this.mediaType ? '[bc_video video_id="' + a + '" account_id="' + b + '" player_id="default" width="' + c + '" height="' + d + '"]' : '[bc_playlist playlist_id="' + a + '" account_id="' + b + '" width="' + c + '" height="' + d + '"]', 
            window.send_to_editor(e), wpbc.broadcast.trigger("close:modal");
        }
    }
}), ToolbarView = BrightcoveView.extend({
    tagName: "div",
    className: "media-toolbar wp-filter",
    template: wp.template("brightcove-media-toolbar"),
    events: {
        "click .view-list": "toggleList",
        "click .view-grid": "toggleGrid",
        "change .brightcove-media-source": "sourceChanged",
        "change .brightcove-media-dates": "datesChanged",
        "change .brightcove-media-tags": "tagsChanged",
        "change .brightcove-empty-playlists": "emptyPlaylistsChanged",
        "keyup .search": "searchHandler"
    },
    render: function() {
        var a = this.model.get("mediaType"), b = {
            accounts: wpbc.preload.accounts,
            dates: {},
            mediaType: a,
            tags: wpbc.preload.tags
        }, c = wpbc.preload.dates, d = this.model.get("date");
        /* @todo: find out if this is working */
        void 0 !== c && void 0 !== c[a] && void 0 !== c[a][d] && (b.dates = c[a][d]), this.$el.html(this.template(b));
        var e = this.$el.find(".spinner");
        this.listenTo(wpbc.broadcast, "spinner:on", function() {
            e.addClass("is-active").removeClass("hidden");
        }), this.listenTo(wpbc.broadcast, "spinner:off", function() {
            e.removeClass("is-active").addClass("hidden");
        });
    },
    // List view Selected
    toggleList: function() {
        this.trigger("viewType", "list"), this.$el.find(".view-list").addClass("current"), 
        this.$el.find(".view-grid").removeClass("current");
    },
    // Grid view Selected
    toggleGrid: function() {
        this.trigger("viewType", "grid"), this.$el.find(".view-grid").addClass("current"), 
        this.$el.find(".view-list").removeClass("current");
    },
    // Brightcove source changed
    sourceChanged: function(a) {
        wpbc.broadcast.trigger("change:activeAccount", a.target.value);
    },
    datesChanged: function(a) {
        wpbc.broadcast.trigger("change:date", a.target.value);
    },
    tagsChanged: function(a) {
        wpbc.broadcast.trigger("change:tag", a.target.value);
    },
    emptyPlaylistsChanged: function(a) {
        var b = $(a.target).prop("checked");
        wpbc.broadcast.trigger("change:emptyPlaylists", b);
    },
    searchHandler: function(a) {
        // Enter / Carriage Return
        13 === a.keyCode && (this.model.set("search", a.target.value), wpbc.broadcast.trigger("change:searchTerm", a.target.value));
    }
}), UploadVideoManagerView = BrightcoveView.extend({
    className: "brightcove-file-uploader",
    events: {
        "click .brightcove-start-upload": "triggerUpload"
    },
    initialize: function(a) {
        /**
             * If you're looking for the Plupload instance, you're in the wrong place, check the UploadWindowView
             */
        this.collection = new UploadModelCollection(), a && (this.options = a, this.successMessage = a.successMessage || this.successMessage), 
        this.uploadWindow = new UploadWindowView(), this.listenTo(this.collection, "add", this.fileAdded), 
        this.listenTo(wpbc.broadcast, "pendingUpload:selectedItem", this.selectedItem), 
        this.listenTo(wpbc.broadcast, "uploader:prepareUpload", this.prepareUpload), this.listenTo(wpbc.broadcast, "uploader:successMessage", this.successMessage), 
        this.listenTo(wpbc.broadcast, "uploader:errorMessage", this.errorMessage), this.listenTo(wpbc.broadcast, "uploader:clear", this.resetUploads);
    },
    resetUploads: function() {
        for (;model = this.collection.first(); ) this.collection.remove(model);
    },
    errorMessage: function(a) {
        this.message(a, "error");
    },
    successMessage: function(a) {
        this.message(a, "success");
    },
    message: function(a, b) {
        var c = this.$el.find(".brightcove-messages"), d = "brightcove-message ";
        "success" === b ? d += "notice updated" : "error" === b && (d += "error");
        var e = $('<div class="wrap"><div class="' + d + '"><p>' + a + "</p></div></div>");
        c.append(e), e.fadeOut(6e3, function() {
            $(this).remove();
        });
    },
    prepareUpload: function() {
        wpbc.uploads = wpbc.uploads || {}, this.collection.each(function(a) {
            wpbc.uploads[a.get("id")] = {
                account: a.get("account"),
                name: a.get("fileName"),
                tags: a.get("tags")
            };
        }), wpbc.broadcast.trigger("uploader:startUpload");
    },
    fileAdded: function(a, b) {
        // Start upload triggers progress bars under every video.
        // Need to re-render when one model is added
        1 === this.collection.length && this.render();
        var c = new UploadView({
            model: a
        });
        c.render(), c.$el.appendTo(this.$el.find(".brightcove-pending-uploads"));
    },
    triggerUpload: function() {
        wpbc.broadcast.trigger("uploader:prepareUpload");
    },
    selectedItem: function(a) {
        this.uploadDetails = new UploadDetailsView({
            model: a
        }), this.uploadDetails.render(), this.$el.find(".brightcove-pending-upload-details").remove(), 
        this.uploadDetails.$el.appendTo(this.$el.find(".brightcove-upload-queued-files"));
    },
    render: function(a) {
        this.collection.length ? this.template = wp.template("brightcove-uploader-queued-files") : (this.template = wp.template("brightcove-uploader-inline"), 
        this.uploadWindow.render(), this.uploadWindow.$el.appendTo($("body"))), this.$el.html(this.template(a)), 
        this.collection.length ? this.$el.find(".brightcove-start-upload").show() : this.$el.find(".brightcove-start-upload").hide();
    }
}), BrightcoveMediaManagerView = BrightcoveView.extend({
    tagName: "div",
    className: "brightcove-media",
    events: {},
    scrollHandler: function() {
        wpbc.broadcast.trigger("scroll:mediaGrid");
    },
    initialize: function(a) {
        var b = wp.media.isTouchDevice ? 300 : 200;
        this.scrollHandler = _.chain(this.scrollHandler).bind(this).throttle(b).value(), 
        this.options = a, this.mode = a.mode || "manager", a.preload = this.options.preload ? wpbc.preload[this.options.mediaType] : !1, 
        this.model = new BrightcoveMediaManagerModel(a), /* Search and dropdowns */
        this.toolbar = new ToolbarView({
            model: this.model
        }), /* Uploader View */
        this.uploader = new UploadVideoManagerView(), this.model.set("accounts", wpbc.preload.accounts), 
        // All accounts.
        this.model.set("activeAccount", a.account), // Active account ID / All
        this.listenTo(this.toolbar, "viewType", function(a) {
            this.model.set("view", a);
        }), this.listenTo(wpbc.broadcast, "videoEdit:message", this.message), this.listenTo(wpbc.broadcast, "permanent:message", this.permanentMessage), 
        this.listenTo(wpbc.broadcast, "remove:permanentMessage", function() {
            wpbc.permanentMessage && wpbc.permanentMessage.remove(), this.$el.find(".brightcove-message").addClass("hidden");
        }), // We only care when a change occurs
        this.listenTo(this.model, "change:view", function(a, b) {
            this.model.get("media-collection-view").setViewType(b);
        }), this.listenTo(this.model, "change:mode", function(a, b) {
            "uploader" !== b && wpbc.broadcast.trigger("uploader:clear");
        }), this.listenTo(wpbc.broadcast, "backButton", function(a) {
            this.model.set("mode", "manager"), this.render();
        }), this.listenTo(wpbc.broadcast, "change:emptyPlaylists", function(a) {
            var b = this.model.get("media-collection-view");
            this.model.set("mode", "manager"), _.each(b.collection.models, function(b) {
                "undefined" != typeof b.get("video_ids") && 1 <= b.get("video_ids").length && b && b.view && b.view.$el || (a ? b.view.$el.hide() : b.view.$el.show());
            });
        }), this.listenTo(wpbc.broadcast, "delete:successful", function(a) {
            this.startGridView(), this.message(a, "success");
        }), this.listenTo(wpbc.broadcast, "change:activeAccount", function(a) {
            this.clearPreview(), this.model.set("activeAccount", a), this.model.set("mode", "manager"), 
            this.render();
        }), this.listenTo(wpbc.broadcast, "change:tag", function(a) {
            this.clearPreview(), this.model.set("tag", a);
        }), this.listenTo(wpbc.broadcast, "change:date", function(a) {
            this.clearPreview(), this.model.set("date", a);
        }), this.listenTo(wpbc.broadcast, "upload:video", function() {
            this.showUploader();
        }), this.listenTo(this.model, "change:search", function(a, b) {
            this.model.get("search");
        }), this.listenTo(wpbc.broadcast, "start:gridview", function() {
            _.invoke(this.subviews, "remove"), this.detailsView = null, // Prevent selected view from not being toggleable when we hit the back button on edit
            this.startGridView();
        }), this.listenTo(wpbc.broadcast, "tabChange", function(a) {
            this.model.set(a), this.detailsView instanceof MediaDetailsView && (this.detailsView.remove(), 
            this.detailsView = void 0), this.render();
        }), this.listenTo(wpbc.broadcast, "edit:media", function(a) {
            var b = this.model.get("mediaType");
            if ("videos" === b) {
                // We just hit the edit button with the edit window already open.
                if ("editVideo" === this.model.get("mode")) return !0;
                this.editView = new VideoEditView({
                    model: a
                }), this.registerSubview(this.editView), this.model.set("mode", "editVideo"), this.render();
            } else {
                // We just hit the edit button with the edit window already open.
                if ("editPlaylist" === this.model.get("mode")) return !0;
                this.editView = new PlaylistEditView({
                    model: a
                }), this.registerSubview(this.editView), this.model.set("mode", "editPlaylist"), 
                this.render();
            }
        }), this.listenTo(wpbc.broadcast, "preview:media", function(a) {
            var b = this.model.get("mediaType");
            if ("videos" === b) {
                // We just hit the preview button with the preview window already open.
                if ("previewVideo" === this.model.get("mode")) return !0;
                this.previewView = new VideoPreviewView({
                    model: a
                }), this.registerSubview(this.previewView), this.model.set("mode", "previewVideo"), 
                this.render();
            } else /**
					 * @todo: playlist preview view
					 */
            this.model.set("mode", "editPlaylist");
        }), this.listenTo(wpbc.broadcast, "change:searchTerm", function(a) {
            this.clearPreview();
        }), this.listenTo(wpbc.broadcast, "view:toggled", function(a) {
            /* If user selects same thumbnail they want to hide the details view */
            this.detailsView && this.detailsView.model === a.model ? (this.detailsView.$el.toggle(), 
            a.$el.toggleClass("highlighted"), this.model.get("media-collection-view").$el.toggleClass("menu-visible"), 
            wpbc.broadcast.trigger("toggle:insertButton")) : (this.clearPreview(), this.detailsView = new MediaDetailsView({
                model: a.model,
                el: $(".brightcove.media-frame-menu"),
                mediaType: this.model.get("mediaType")
            }), this.registerSubview(this.detailsView), this.detailsView.render(), this.detailsView.$el.toggle(!0), 
            // Always show new view
            this.model.get("media-collection-view").$el.addClass("menu-visible"), a.$el.addClass("highlighted"), 
            wpbc.broadcast.trigger("toggle:insertButton", "enabled"));
        });
    },
    /**
		 * Clear the preview view and remove highlighted class from previous selected video.
		 */
    clearPreview: function() {
        this.detailsView instanceof MediaDetailsView && this.detailsView.remove(), this.model.get("media-collection-view").$el.find(".highlighted").removeClass("highlighted");
    },
    startGridView: function() {
        this.model.set("mode", "manager"), this.render();
    },
    message: function(a, b, c) {
        var d = this.$el.find(".brightcove-message");
        "success" === b ? (d.addClass("updated"), d.removeClass("error")) : "error" === b && (d.addClass("error"), 
        d.removeClass("updated"));
        var e = $("<p>" + a + "</p>");
        d.append(e), d.removeClass("hidden"), c ? (wpbc.permanentMessage && wpbc.permanentMessage.remove(), 
        wpbc.permanentMessage = e) : e.fadeOut(6e3, function() {
            $(this).remove(), d.addClass("hidden");
        });
    },
    showUploader: function() {
        "manager" === this.model.get("mode") ? this.model.set("mode", "uploader") : this.model.set("mode", "manager"), 
        this.render();
    },
    permanentMessage: function(a) {
        this.message(a, "error", !0);
    },
    render: function() {
        var a, b = this.model.get("options"), c = this.model.get("mode");
        if (// Nuke all registered subviews
        _.invoke(this.subviews, "remove"), "uploader" === c) this.template = wp.template("brightcove-uploader-container"), 
        this.$el.empty(), this.$el.html(this.template(b)), this.uploader.render(), this.uploader.delegateEvents(), 
        this.uploader.$el.appendTo($(".brightcove-uploader")); else if ("manager" === c) {
            this.template = wp.template("brightcove-media"), this.$el.html(this.template(b)), 
            this.toolbar.render(), this.toolbar.delegateEvents(), this.toolbar.$el.show(), this.toolbar.$el.appendTo(this.$el.find(".media-frame-router"));
            // Add the Media views to the media manager
            var d = this.model.get("media-collection-view");
            d.render(), d.delegateEvents();
            var e = this.$el.find(".media-frame-content");
            e.on("scroll", this.scrollHandler), d.$el.appendTo(e), wpbc.initialSync && (wpbc.broadcast.trigger("remove:permanentMessage"), 
            wpbc.broadcast.trigger("permanent:message", wpbc.preload.messages.ongoingSync));
        } else "editVideo" === c ? (this.toolbar.$el.hide(), a = this.$el.find(".media-frame-content"), 
        a.empty(), this.editView.render(), this.editView.delegateEvents(), this.editView.$el.appendTo(a), 
        this.$el.find(".brightcove.media-frame-content").addClass("edit-view")) : "editPlaylist" === c ? (this.toolbar.$el.hide(), 
        a = this.$el, a.empty(), a.html('<div class="playlist-edit-container"></div>'), 
        a = a.find(".playlist-edit-container"), this.editView.render(), this.editView.delegateEvents(), 
        this.editView.$el.appendTo(a), a.addClass("playlist")) : "previewVideo" === c && (this.toolbar.$el.hide(), 
        a = this.$el.find(".media-frame-content"), a.empty(), this.previewView.render(), 
        this.detailsView.render({
            detailsMode: "preview"
        }), this.previewView.delegateEvents(), this.previewView.$el.appendTo(a), this.$el.find(".brightcove.media-frame-toolbar").hide(), 
        brightcove.createExperiences());
        return "editPlaylist" !== c && this.$el.find(".media-frame-content").removeClass("playlist"), 
        this;
    }
}), BrightcoveModalView = BrightcoveView.extend({
    tagName: "div",
    className: "media-modal brightcove",
    template: wp.template("brightcove-media-modal"),
    events: {
        "click .brightcove.media-menu-item": "changeTab",
        "click .brightcove.media-button-insert": "insertIntoPost",
        "click .brightcove.media-modal-close": "closeModal"
    },
    initialize: function(a) {
        this.model = new BrightcoveModalModel({
            tab: a.tab
        }), this.brightcoveMediaManager = new BrightcoveMediaManagerView(this.model.getMediaManagerSettings()), 
        this.registerSubview(this.brightcoveMediaManager), this.listenTo(wpbc.broadcast, "toggle:insertButton", function(a) {
            this.toggleInsertButton(a);
        }), this.listenTo(wpbc.broadcast, "close:modal", this.closeModal);
    },
    insertIntoPost: function() {
        // Media Details will trigger the insertion since it's always active and contains
        // the model we're inserting
        wpbc.broadcast.trigger("insert:shortcode");
    },
    toggleInsertButton: function(a) {
        var b = this.$el.find(".brightcove.media-button");
        "enabled" === a ? b.removeAttr("disabled") : "disabled" === a ? b.attr("disabled", "disabled") : void 0 !== b.attr("disabled") ? b.removeAttr("disabled") : b.attr("disabled", "disabled");
    },
    changeTab: function(a) {
        if (!$(a.target).hasClass("active")) {
            $(a.target).addClass("active");
            var b = _.without(a.target.classList, "media-menu-item", "brightcove")[0], c = [ "videos", "upload", "playlists" ];
            _.each(_.without(c, b), function(a) {
                $(".brightcove.media-menu-item." + a).removeClass("active");
            }), _.contains(c, b) && (this.model.set("tab", b), wpbc.broadcast.trigger("spinner:off"), 
            wpbc.broadcast.trigger("tabChange", this.model.getMediaManagerSettings()));
        }
    },
    closeModal: function() {
        this.$el.hide();
    },
    message: function(a) {
        this.$el.find(".brightcove-message");
    },
    render: function(a) {
        this.$el.html(this.template(a)), this.brightcoveMediaManager.render(), this.brightcoveMediaManager.$el.appendTo(this.$el.find(".media-frame-content"));
    }
}), MediaDetailsView = BrightcoveView.extend({
    tagName: "div",
    className: "media-details",
    attributes: function() {
        return {
            tabIndex: 0,
            role: "checkbox",
            "aria-label": this.model.get("title"),
            "aria-checked": !1,
            "data-id": this.model.get("id")
        };
    },
    events: {
        "click .brightcove.edit.button": "triggerEditMedia",
        "click .brightcove.preview.button": "triggerPreviewMedia",
        "click .brightcove.back.button": "backButton"
    },
    triggerEditMedia: function(a) {
        a.preventDefault(), wpbc.broadcast.trigger("edit:media", this.model);
    },
    triggerPreviewMedia: function(a) {
        a.preventDefault(), wpbc.broadcast.trigger("preview:media", this.model);
    },
    backButton: function(a) {
        wpbc.broadcast.trigger("backButton", this.mediaType);
    },
    initialize: function(a) {
        a = a || {}, this.type = a.type ? a.type : "grid", this.mediaType = a.mediaType, 
        this.listenTo(wpbc.broadcast, "insert:shortcode", this.insertShortcode), this.listenTo(this.model, "change", this.render);
    },
    /**
         * @returns {wp.media.view.Media} Returns itself to allow chaining
         */
    render: function(a) {
        return a = _.extend({}, a, this.model.toJSON()), a.duration = this.model.getReadableDuration(), 
        a.updated_at_readable = this.model.getReadableDate("updated_at"), a.created_at_readable = this.model.getReadableDate("created_at"), 
        a.account_name = this.model.getAccountName(), this.template = wp.template("brightcove-media-item-details-" + this.mediaType), 
        this.$el.html(this.template(a)), this.delegateEvents(), this;
    },
    /* Prevent this.remove() from removing the container element for the details view */
    remove: function() {
        return this.undelegateEvents(), this.$el.empty(), this.stopListening(), this;
    }
}), MediaView = BrightcoveView.extend({
    tagName: "li",
    className: "attachment brightcove",
    attributes: function() {
        return {
            tabIndex: 0,
            role: "checkbox",
            "aria-label": this.model.get("title"),
            "aria-checked": !1,
            "data-id": this.model.get("id")
        };
    },
    events: {
        "click .attachment-preview": "toggleDetailView",
        "click .video-move-up": "videoMoveUp",
        "click .video-move-down": "videoMoveDown",
        "click .trash": "removeVideoFromPlaylist",
        "click .add-to-playlist": "videoAdd",
        "click .edit": "triggerEditMedia",
        "click .preview": "triggerPreviewMedia"
    },
    triggerEditMedia: function(a) {
        a.preventDefault(), wpbc.broadcast.trigger("edit:media", this.model);
    },
    triggerPreviewMedia: function(a) {
        a.preventDefault(), wpbc.broadcast.trigger("preview:media", this.model);
    },
    buttons: {},
    initialize: function(a) {
        a = a || {}, this.type = a.type ? a.type : "grid", this.listenTo(this.model, "change:view", function(a, b) {
            this.type !== b && (this.type = b, this.render());
        }), this.render();
    },
    render: function() {
        var a = this.model.toJSON();
        return a.duration = this.model.getReadableDuration(), a.updated_at_readable = this.model.getReadableDate("updated_at"), 
        a.account_name = this.model.getAccountName(), "existingPlaylists" === a.viewType ? this.template = wp.template("brightcove-playlist-edit-video-in-playlist") : "libraryPlaylists" === a.viewType ? this.template = wp.template("brightcove-playlist-edit-video-in-library") : this.template = wp.template("brightcove-media-item-" + this.type), 
        a.buttons = this.buttons, this.$el.html(this.template(a)), this.$el.toggleClass("uploading", a.uploading), 
        this;
    },
    toggleDetailView: function() {
        wpbc.broadcast.trigger("view:toggled", this);
    },
    videoMoveUp: function() {
        wpbc.broadcast.trigger("playlist:moveUp", this);
    },
    videoMoveDown: function() {
        wpbc.broadcast.trigger("playlist:moveDown", this);
    },
    videoAdd: function() {
        wpbc.broadcast.trigger("playlist:add", this);
    },
    removeVideoFromPlaylist: function() {
        wpbc.broadcast.trigger("playlist:remove", this);
    }
}), PlaylistEditVideoView = BrightcoveView.extend({
    tagName: "div",
    className: "",
    template: wp.template("brightcove-playlist-edit"),
    events: {
        "click .brightcove.button.save-sync": "saveSync",
        "click .brightcove.back": "back"
    },
    render: function(a) {
        a = this.model.toJSON(), this.$el.html(this.template(a));
    }
}), PlaylistEditView = BrightcoveView.extend({
    tagName: "div",
    className: "playlist-edit brightcove attachment-details",
    template: wp.template("brightcove-playlist-edit"),
    events: {
        "click .brightcove.button.save-sync": "saveSync",
        "click .brightcove.back": "back",
        "change .brightcove-name": "updatedName"
    },
    deleteVideo: function(a) {
        a.preventDefault(), this.model.set("mediaType", "videos"), this.model.destroy();
    },
    updatedName: function(a) {
        var b = this.model.get("name");
        b !== a.target.value && (this.model.set("name", a.target.value), this.model.save());
    },
    back: function(a) {
        a.preventDefault(), wpbc.broadcast.trigger("start:gridview");
    },
    saveSync: function(a) {
        a.preventDefault(), this.model.set("name", this.$el.find(".brightcove-name").val()), 
        this.model.set("description", this.$el.find(".brightcove-description").val()), this.model.set("long_description", this.$el.find(".brightcove-long-description").val()), 
        this.model.set("tags", this.$el.find(".brightcove-tags").val()), this.model.set("mediaType", "videos"), 
        this.model.save();
    },
    initialize: function() {
        this.listenTo(wpbc.broadcast, "tabChange", function() {
            _.invoke(this.subviews, "remove");
        }), wpbc.broadcast.trigger("spinner:off");
    },
    render: function(a) {
        a = this.model.toJSON(), this.$el.html(this.template(a)), this.spinner = this.$el.find(".spinner");
        this.$el.find(".existing-videos");
        /*
            1. Create a media collection here to fetch each of the videos in options.video_ids.
             */
        a.video_ids && (this.killPendingRequests(), this.playlistVideosView = new MediaCollectionView({
            el: this.$el.find(".existing-videos"),
            videoIds: a.video_ids,
            activeAccount: this.model.get("account_id"),
            mediaCollectionViewType: "existingPlaylists",
            mediaType: "playlists"
        }), this.libraryVideosView = new MediaCollectionView({
            el: this.$el.find(".library-videos"),
            excludeVideoIds: a.video_ids,
            activeAccount: this.model.get("account_id"),
            mediaCollectionViewType: "libraryPlaylists",
            mediaType: "playlists"
        }), this.registerSubview(this.playlistVideosView), this.registerSubview(this.libraryVideosView), 
        this.listenTo(wpbc.broadcast, "playlist:changed", _.throttle(this.playlistChanged, 300)), 
        this.listenTo(wpbc.broadcast, "insert:shortcode", this.insertShortcode)), this.listenTo(wpbc.broadcast, "spinner:on", function() {
            this.spinner.addClass("is-active").removeClass("hidden");
        }), this.listenTo(wpbc.broadcast, "spinner:off", function() {
            this.spinner.removeClass("is-active").addClass("hidden");
        });
    },
    playlistChanged: function(a) {
        this.killPendingRequests(), this.model.set("video_ids", a), this.model.save();
    },
    killPendingRequests: function() {
        // Kill all pending requests
        _.each(wpbc.requests, function(a) {
            a.abort();
        }), wpbc.requests = [];
    }
}), BrightcoveUploadDetails = BrightcoveView.extend({
    className: "brightcove-pending-upload-details attachment-details",
    tagName: "div",
    template: wp.template("brightcove-pending-upload-details"),
    events: {
        "keyup .brightcove-name": "nameChanged",
        "keyup .brightcove-tags": "tagsChanged",
        "change .brightcove-media-source": "accountChanged"
    },
    initialize: function(a) {
        this.listenTo(wpbc.broadcast, "pendingUpload:hideDetails", this.hide), this.listenTo(wpbc.broadcast, "uploader:fileUploaded", function(a) {
            a.id === this.model.get("id") && (this.model.set("uploaded", !0), this.render());
        }), this.model.set("ingestSuccess", !0), this.model.set("uploadSuccess", !0);
    },
    nameChanged: function(a) {
        this.model.set("fileName", a.target.value);
    },
    tagsChanged: function(a) {
        this.model.set("tags", a.target.value);
    },
    accountChanged: function(a) {
        this.model.set("account", a.target.value);
    },
    hide: function() {
        this.$el.hide();
    },
    render: function(a) {
        a = a || {}, a.fileName = this.model.get("fileName"), a.tags = this.model.get("tags"), 
        a.size = this.model.humanReadableSize(), a.accounts = this.model.get("accounts"), 
        a.account = this.model.get("account"), a.uploaded = this.model.get("uploaded"), 
        this.$el.html(this.template(a));
    }
});

UploadWindowView = BrightcoveView.extend({
    className: "uploader-window",
    template: wp.template("brightcove-uploader-window"),
    initialize: function(a) {
        _.bindAll(this, "uploaderFilesAdded"), this.listenTo(wpbc.broadcast, "uploader:queuedFilesAdded", this.hide), 
        this.listenTo(wpbc.broadcast, "uploader:startUpload", this.uploaderStartUpload), 
        this.listenTo(wpbc.broadcast, "uploader:clear", this.resetUploads);
    },
    render: function(a) {
        this.$el.html(this.template(a)), _.defer(_.bind(this.afterRender, this));
    },
    resetUploads: function() {
        this.uploader && this.uploader.files && (this.uploader.files = []);
    },
    afterRender: function() {
        this.uploader = new plupload.Uploader(_.defaults(this.options, wpbc.preload.plupload)), 
        // Uploader has neither .on nor .listenTo
        this.uploader.added = this.uploaderFilesAdded, this.uploader.progress = this.uploaderUploadProgress, 
        this.uploader.bind("FilesAdded", this.uploaderFilesAdded), this.uploader.bind("UploadProgress", this.uploaderUploadProgress), 
        this.uploader.bind("BeforeUpload", this.uploaderBeforeUpload), this.uploader.bind("FileUploaded", this.uploaderFileUploaded), 
        this.uploader.bind("init", this.uploaderAfterInit), this.uploader.init(), $("html").on("dragenter", _.bind(this.show, this));
        /* the following dropzone function code is taken from the wp.Uploader code */
        var a = wpbc.preload.plupload.drop_element.replace(/[^a-zA-Z0-9-]+/g, ""), b = $("#" + a);
        b.on("dropzone:leave", _.bind(this.hide, this));
    },
    uploaderAfterInit: function(a) {
        var b, c, d, e = wpbc.preload.plupload.drop_element.replace(/[^a-zA-Z0-9-]+/g, ""), f = $("#" + e);
        // Generate drag/drop helper classes.
        if (d = a.features.dragdrop, f) {
            if (f.toggleClass("supports-drag-drop", !!d), !d) return f.unbind(".wp-uploader");
            // 'dragenter' doesn't fire correctly, simulate it with a limited 'dragover'.
            f.bind("dragover.wp-uploader", function() {
                b && clearTimeout(b), c || (f.trigger("dropzone:enter").addClass("drag-over"), c = !0);
            }), f.bind("dragleave.wp-uploader, drop.wp-uploader", function() {
                // Using an instant timer prevents the drag-over class from
                // being quickly removed and re-added when elements inside the
                // dropzone are repositioned.
                //
                // @see https://core.trac.wordpress.org/ticket/21705
                b = setTimeout(function() {
                    c = !1, f.trigger("dropzone:leave").removeClass("drag-over");
                }, 0);
            });
        }
    },
    show: function() {
        var a = this.$el.show();
        // Ensure that the animation is triggered by waiting until
        // the transparent element is painted into the DOM.
        _.defer(function() {
            a.css({
                opacity: 1
            });
        });
    },
    hide: function() {
        var a = this.$el.css({
            opacity: 0
        });
        wp.media.transition(a).done(function() {
            // Transition end events are subject to race conditions.
            // Make sure that the value is set as intended.
            "0" === a.css("opacity") && a.hide();
        }), // https://core.trac.wordpress.org/ticket/27341
        _.delay(function() {
            "0" === a.css("opacity") && a.is(":visible") && a.hide();
        }, 500);
    },
    uploaderFilesAdded: function(a, b) {
        wpbc.broadcast.trigger("uploader:queuedFilesAdded", b);
    },
    uploaderStartUpload: function() {
        this.uploader.start();
    },
    uploaderUploadProgress: function(a, b) {
        wpbc.broadcast.trigger("uploader:uploadProgress", b);
    },
    uploaderBeforeUpload: function(a, b) {
        a.settings.multipart_params = _.defaults(wpbc.uploads[b.id], wpbc.preload.plupload.multipart_params, {
            nonce: wpbc.preload.nonce
        });
    },
    uploaderFileUploaded: function(a, b, c) {
        var d = JSON.parse(c.response);
        wpbc.broadcast.trigger("uploader:fileUploaded", b), "success" === d.data.upload && "success" === d.data.ingest ? (d.data.videoDetails && (// Add newly uploaded file to preload list.
        wpbc.broadcast.trigger("uploader:uploadedFileDetails", d.data.videoDetails), wpbc.preload.videos.unshift(d.data.videoDetails)), 
        wpbc.broadcast.trigger("uploader:successfulUploadIngest", b)) : (b.percent = 0, 
        b.status = plupload.UPLOADING, a.state = plupload.STARTED, a.trigger("StateChanged"), 
        wpbc.broadcast.trigger("uploader:failedUploadIngest", b));
    }
});

var UploadView = BrightcoveView.extend({
    className: "brightcove-pending-upload",
    tagName: "tr",
    template: wp.template("brightcove-pending-upload"),
    events: {
        click: "toggleRow"
    },
    initialize: function() {
        this.listenTo(wpbc.broadcast, "pendingUpload:selectedRow", this.otherToggledRow), 
        this.listenTo(wpbc.broadcast, "uploader:uploadProgress", this.uploadProgress), this.listenTo(wpbc.broadcast, "uploader:getParams", this.getParams), 
        this.listenTo(wpbc.broadcast, "uploader:successfulUploadIngest", this.successfulUploadIngest), 
        this.listenTo(wpbc.broadcast, "uploader:failedUploadIngest", this.failedUploadIngest);
        var a = {
            fileName: this.model.get("name"),
            tags: "",
            accounts: wpbc.preload.accounts,
            // All accounts.
            account: wpbc.preload.defaultAccount,
            ingestSuccess: !1,
            uploadSuccess: !1,
            uploaded: !1
        };
        this.model.set(a), this.listenTo(this.model, "change:fileName", this.render), this.listenTo(this.model, "change:account", this.render);
    },
    render: function(a) {
        a = a || {}, a.fileName = this.model.get("fileName"), a.size = this.model.humanReadableSize();
        var b = this.model.get("account");
        a.accountName = wpbc.preload.accounts[b].account_name, a.percent = this.model.get("percent"), 
        a.activeUpload = this.model.get("activeUpload"), a.ingestSuccess = this.model.get("ingestSuccess"), 
        a.uploadSuccess = this.model.get("uploadSuccess"), this.$el.html(this.template(a)), 
        this.model.get("selected") && this.$el.addClass("selected"), this.model.get("ingestSuccess") && this.$el.addClass("ingest-success"), 
        this.model.get("uploadSuccess") && this.$el.addClass("upload-success");
    },
    getParams: function(a) {
        wpbc.broadcast.trigger("uploader:params", "abcde");
    },
    failedUploadIngest: function(a) {
        // Make sure we're acting on the right file.
        a.id === this.model.get("id") && (wpbc.broadcast.trigger("uploader:errorMessage", wpbc.preload.messages.unableToUpload.replace("%%s%%", this.model.get("fileName"))), 
        this.render());
    },
    successfulUploadIngest: function(a) {
        // Make sure we're acting on the right file.
        a.id === this.model.get("id") && (wpbc.broadcast.trigger("uploader:successMessage", wpbc.preload.messages.successUpload.replace("%%s%%", this.model.get("fileName"))), 
        this.render());
    },
    /**
         * Render if we're the active upload.
         * Re-render if we thought we were but we no longer are.
         * @param file Fired from UploadProgress on plUpload
         */
    uploadProgress: function(a) {
        // Make sure we're acting on the right file.
        a.id === this.model.get("id") ? (this.model.set("activeUpload", !0), this.model.set("percent", a.percent), 
        this.render()) : this.model.get("activeUpload") && (this.model.unset("activeUpload"), 
        this.render());
    },
    toggleRow: function(a) {
        this.$el.toggleClass("selected"), this.$el.hasClass("selected") ? (this.model.set("selected", !0), 
        wpbc.broadcast.trigger("pendingUpload:selectedRow", this.cid)) : wpbc.broadcast.trigger("pendingUpload:hideDetails", this.cid);
    },
    otherToggledRow: function(a) {
        // Ignore broadcast from self
        a !== this.cid ? (this.$el.removeClass("selected"), this.model.unset("selected")) : wpbc.broadcast.trigger("pendingUpload:selectedItem", this.model);
    }
}), VideoEditView = BrightcoveView.extend({
    tagName: "div",
    className: "video-edit brightcove attachment-details",
    template: wp.template("brightcove-video-edit"),
    events: {
        "click .brightcove.button.save-sync": "saveSync",
        "click .brightcove.delete": "deleteVideo",
        "click .brightcove.button.back": "back"
    },
    back: function(a) {
        a.preventDefault(), wpbc.broadcast.trigger("start:gridview");
    },
    deleteVideo: function() {
        confirm(wpbc.preload.messages.confirmDelete) && (wpbc.broadcast.trigger("spinner:on"), 
        this.model.set("mediaType", "videos"), this.model.destroy());
    },
    saveSync: function() {
        wpbc.broadcast.trigger("spinner:on"), this.model.set("name", this.$el.find(".brightcove-name").val()), 
        this.model.set("description", this.$el.find(".brightcove-description").val()), this.model.set("long_description", this.$el.find(".brightcove-long-description").val()), 
        this.model.set("tags", this.$el.find(".brightcove-tags").val()), this.model.set("height", this.$el.find(".brightcove-height").val()), 
        this.model.set("width", this.$el.find(".brightcove-width").val()), this.model.set("mediaType", "videos"), 
        this.model.save();
    },
    render: function(a) {
        this.listenTo(wpbc.broadcast, "insert:shortcode", this.insertShortcode), a = this.model.toJSON(), 
        this.$el.html(this.template(a));
        var b = this.$el.find(".spinner");
        this.listenTo(wpbc.broadcast, "spinner:on", function() {
            b.addClass("is-active").removeClass("hidden");
        }), this.listenTo(wpbc.broadcast, "spinner:off", function() {
            b.removeClass("is-active").addClass("hidden");
        });
    }
}), VideoPreviewView = BrightcoveView.extend({
    tagName: "div",
    className: "video-preview brightcove",
    template: wp.template("brightcove-video-preview"),
    render: function(a) {
        a = a || {}, a.id = this.model.get("id"), a.account_id = this.model.get("account_id"), 
        this.$el.html(this.template(a)), this.listenTo(wpbc.broadcast, "insert:shortcode", this.insertShortcode);
    }
}), MediaCollectionView = BrightcoveView.extend({
    tagName: "ul",
    className: "brightcove-media attachments",
    attributes: {
        tabIndex: -1
    },
    events: {
        /* scroll fired on playlist edits, but for media grids it's handled by firing 'scroll:mediaGrid' in brightcove-media-manager */
        scroll: "scrollHandler"
    },
    loadMoreMediaItems: function() {
        this.fetchingResults = !0, this.collection.fetch();
    },
    scrollHandler: function() {
        // We don't fetch for videos in an existing playlist
        if ("existingPlaylists" !== this.collection.mediaCollectionViewType) {
            var a = 200;
            // How many px from bottom until we fetch the next page.
            !this.fetchingResults && this.el.scrollTop + this.el.clientHeight + a > this.el.scrollHeight && (this.collection.pageNumber += 1, 
            this.loadMoreMediaItems());
        }
    },
    initialize: function(a) {
        this.fetchingResults = !1, this.listenTo(wpbc.broadcast, "fetch:finished", function() {
            this.fetchingResults = !1;
        });
        var b = wp.media.isTouchDevice ? 300 : 200;
        this.scrollHandler = _.chain(this.scrollHandler).bind(this).throttle(b).value(), 
        this.listenTo(wpbc.broadcast, "scroll:mediaGrid", this.scrollHandler), a = a || {}, 
        this.el.id = _.uniqueId("__attachments-view-"), !this.collection && a.videoIds ? (this.collection = new MediaCollection(null, {
            videoIds: a.videoIds,
            activeAccount: a.activeAccount,
            mediaCollectionViewType: a.mediaCollectionViewType
        }), this.listenTo(wpbc.broadcast, "playlist:moveUp", this.videoMoveUp), this.listenTo(wpbc.broadcast, "playlist:moveDown", this.videoMoveDown), 
        this.listenTo(wpbc.broadcast, "playlist:remove", this.videoRemove), this.listenTo(wpbc.broadcast, "playlist:add", this.videoAdd)) : this.collection || "libraryPlaylists" !== a.mediaCollectionViewType || (this.collection = new MediaCollection(null, {
            excludeVideoIds: a.excludeVideoIds,
            activeAccount: a.activeAccount,
            mediaCollectionViewType: a.mediaCollectionViewType
        }), this.listenTo(wpbc.broadcast, "playlist:remove", this.videoRemove), this.listenTo(wpbc.broadcast, "playlist:add", this.videoAdd)), 
        _.defaults(this.options, {
            refreshSensitivity: wp.media.isTouchDevice ? 300 : 200,
            refreshThreshold: 3,
            VideoView: wp.media.view.Video,
            sortable: !1,
            resize: !0,
            idealColumnWidth: 202
        }), this._viewsByCid = {}, this.resizeEvent = "resize.media-modal-columns", this.listenTo(this.collection, "add", function(a) {
            this.views.add(this.createMediaView(a), {
                at: this.collection.indexOf(a)
            });
        }, this), this.listenTo(this.collection, "remove", function(a) {
            a && (a.view ? a.view.remove() : a.cid && this._viewsByCid[a.cid] && this._viewsByCid[a.cid].remove());
        }, this), this.listenTo(this.collection, "reset", this.render), this.scroll = _.chain(this.scroll).bind(this).throttle(this.options.refreshSensitivity).value(), 
        this.options.scrollElement = this.options.scrollElement || this.el, $(this.options.scrollElement).on("scroll", this.scroll), 
        _.bindAll(this, "setColumns"), this.options.resize && (this.on("ready", this.bindEvents), 
        _.defer(this.setColumns, this));
    },
    render: function() {
        this.$el.empty(), this.collection.each(function(a) {
            a.view = new MediaView({
                model: a
            }), this.registerSubview(a.view), a.view.render(), a.view.delegateEvents(), a.view.$el.appendTo(this.$el);
        }, this);
    },
    setViewType: function(a) {
        this.collection.each(function(b) {
            b.set("view", a);
        }, this);
    },
    bindEvents: function() {
        this.$window.off(this.resizeEvent).on(this.resizeEvent, _.debounce(this.setColumns, 50));
    },
    setColumns: function() {
        var a = this.columns, b = this.$el.width();
        b && (this.columns = Math.min(Math.round(b / this.options.idealColumnWidth), 12) || 1, 
        a && a === this.columns || this.$el.closest(".media-frame-content").attr("data-columns", this.columns));
    },
    /**
         * @param {wp.media.model.Video} attachment
         * @returns {wp.media.View}
         */
    createMediaView: function(a) {
        a.set("viewType", this.collection.mediaCollectionViewType);
        var b = new MediaView({
            controller: this.controller,
            model: a,
            collection: this.collection,
            selection: this.options.selection
        });
        return this.registerSubview(b), this._viewsByCid[a.cid] = b, b;
    },
    prepare: function() {
        // Create all of the Video views, and replace
        // the list in a single DOM operation.
        this.collection.length ? this.views.set(this.collection.map(this.createMediaView, this)) : (this.views.unset(), 
        this.collection.more().done(this.scroll));
    },
    ready: function() {
        // Trigger the scroll event to check if we're within the
        // threshold to query for additional attachments.
        this.scroll();
    },
    scroll: function() {
        var a, b = this, c = this.options.scrollElement, d = c.scrollTop;
        // The scroll event occurs on the document, but the element
        // that should be checked is the document body.
        c === document && (c = document.body, d = $(document).scrollTop()), "function" === this.collection.hasMore && $(c).is(":visible") && this.collection.hasMore() && (a = this.views.parent.toolbar, 
        c.scrollHeight - (d + c.clientHeight) < c.clientHeight / 3 && a.get("spinner").show(), 
        c.scrollHeight < d + c.clientHeight * this.options.refreshThreshold && this.collection.more().done(function() {
            b.scroll(), a.get("spinner").hide();
        }));
    },
    videoMoveUp: function(a) {
        var b = a.model, c = this.collection.indexOf(b);
        c > 0 && (this.collection.remove(b, {
            silent: !0
        }), // silence this to stop excess event triggers
        this.collection.add(b, {
            at: c - 1
        })), this.render(), this.playlistChanged();
    },
    videoMoveDown: function(a) {
        var b = a.model, c = this.collection.indexOf(b);
        c < this.collection.models.length && (this.collection.remove(b, {
            silent: !0
        }), // silence this to stop excess event triggers
        this.collection.add(b, {
            at: c + 1
        })), this.render(), this.playlistChanged();
    },
    videoRemove: function(a) {
        var b = a.model;
        -1 === this.collection.indexOf(b) ? // this is the library model
        this.collection.add(b) : (// this is the playlist collection
        this.collection.remove(b, {
            silent: !0
        }), // silence this to stop excess event triggers
        this.playlistChanged()), this.render();
    },
    videoAdd: function(a) {
        /**
             * Video add is heard by two collections, the one containing the videos for the playlists
             * and the one containing the videos that we can add to them.
             * We handle the add by adding from the collection where it doesn't exist (the playlist) and removing
             * where it does (the library).
             */
        var b = a.model;
        -1 === this.collection.indexOf(b) ? (// this is the playlist collection
        this.collection.add(b), this.playlistChanged()) : (// this is the library model
        this.collection.remove(b, {
            silent: !0
        }), this.render());
    },
    playlistChanged: function() {
        var a = [];
        this.collection.each(function(b) {
            a.push(b.id);
        }), this.videoIds = a, // var syncPlaylist = _.throttle(_.bind(this.syncPlaylist, this), 2000);
        this.syncPlaylist();
    },
    syncPlaylist: function() {
        wpbc.broadcast.trigger("playlist:changed", this.videoIds);
    }
}), App = {
    renderMediaManager: function(a) {
        var b = $(".brightcove-media-" + a);
        document.getElementById("content_ifr");
        if (b.length) {
            var c = new BrightcoveMediaManagerView({
                el: b,
                date: "all",
                embedType: "page",
                preload: !0,
                mode: "manager",
                search: "",
                accounts: "all",
                tags: "all",
                mediaType: a,
                viewType: "grid"
            });
            c.render();
        }
    },
    load: function() {
        wpbc.requests = [], wpbc.responses = {}, wpbc.broadcast = _.extend({}, Backbone.Events), 
        // pubSub object
        wpbc.selfSync = function() {
            $.get(ajaxurl, {
                action: "bc_initial_sync"
            }, function(a) {
                a.success ? wpbc.broadcast.trigger("remove:permanentMessage") : // At most every ten seconds.
                _.delay(wpbc.selfSync, 1e4);
            });
        }, /* If we have to finish our inital sync, then lets help it along*/
        wpbc.initialSync && wpbc.selfSync(), /* Wait until the window is loaded and the anchor element exists in the DOM */
        $(window).load(this.loaded), /* If we're on the videos/playlists pages, sometimes the $(window).load has already fired
			we test for this and fire up the app anyway.
			 */
        window.location.href.indexOf("page-brightcove") && _.delay(_.bind(function() {
            wpbc.triggerModal || this.loaded();
        }, this), 100);
    },
    loaded: function() {
        var a = $(".brightcove-modal");
        wpbc.triggerModal = function() {
            wpbc.modal ? wpbc.modal.$el.show() : (wpbc.modal = new BrightcoveModalView({
                el: a,
                tab: "videos"
            }), wpbc.modal.render());
        };
        // Load the appropriate media type manager into the container element,
        // We only support loading one per page.
        _.each([ "videos", "playlists" ], function(a) {
            App.renderMediaManager(a);
        }), $(".account-toggle-button").on("click", function(a) {
            a.preventDefault(), $(this).hide(), $(".brightcove-account-row.hidden").show();
        }), $(".brightcove-add-new-video").on("click", function(a) {
            a.preventDefault(), wpbc.broadcast.trigger("upload:video");
        }), $(".brightcove-add-media").on("click", function() {
            wpbc.triggerModal();
        }), $(document).keyup(function(a) {
            27 === a.keyCode && // Close modal on ESCAPE if it's open.
            wpbc.broadcast.trigger("close:modal");
        }), $("a.brightcove-action-delete-source").on("click", function(a) {
            var b = $(this).data("alert-message");
            return confirm(b) ? void 0 : !1;
        });
    }
};

$(document).ready(function() {
    App.load();
});
})(jQuery);