/*global _, jQuery, beforeEach, MM*/
MM.jsonStorage = function (storage) {
    'use strict';
    var self = {};
    self.setItem = function (key, value) {
        storage.setItem(key, JSON.stringify(value));
    };
    self.getItem = function (key) {
        try {
            return JSON.parse(storage.getItem(key));
        } catch (e) {
            return undefined;
        }
    };
    return self;
};
MM.Bookmark = function (mapRepository, maxSize, storage, storageKey) {
    'use strict';
	var capacity = maxSize,
        self = this,
        list = [];
    if (storage && storageKey) {
        list = storage.getItem(storageKey) || [];
    }
    mapRepository.addEventListener('Before Upload', function (key, idea) {
        self.store({
            mapId: key,
            title: idea.title
        });
    });
    self.store = function (bookmark) {
        if (!(bookmark.mapId && bookmark.title)) {
			throw new Error("Invalid bookmark");
		}
		var existing = _.find(list, function (b) {
			return b.title === bookmark.title;
        });
        if (existing) {
			existing.mapId = bookmark.mapId;
		} else {
            if (list.length >= capacity) { list.shift(); }
			list.push(_.clone(bookmark));
        }
        if (storage && storageKey) {
            storage.setItem(storageKey, list);
        }
    };
    self.list = function () {
        return _.clone(list).reverse();
    };
    self.links = function (titleLimit) {
        titleLimit = titleLimit || 30;
        return _.map(self.list(), function (element) {
            return {
                url: "/map/" + element.mapId,
                title: element.title.length > titleLimit ? element.title.substr(0, titleLimit) + "..." : element.title
            };
        });
    };
};
jQuery.fn.bookmarkWidget = function (list) {
	'use strict';
	return this.each(function () {
        var element = jQuery(this),
            template = element.find('.template');
        if (list.length) {
            element.empty();
            list.forEach(function (bookmark) {
                element.append(template.clone().show().find('a').attr('href', bookmark.url).text(bookmark.title).end());
            });
        }
    });
};