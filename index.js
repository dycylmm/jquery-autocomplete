/**
 * jQuery-autocomplete
 * version: 1.0.0
 */
;(function ($, window, document, undefined) {
    var _log = function (msg) {
        console.log('[autoComplete] ' + msg)
    }
    var _warn = function (msg) {
        console.warn('[autoComplete] ' + msg)
    }
    var _debounce = function (idle, action) {
        let timer;
        return function () {
            let ctx = this
            let args = arguments
            clearTimeout(timer)
            timer = setTimeout(function () {
                action.apply(ctx, args)
            }, idle)
        }
    }
    var _getStyle = function (element, att) {
        if (window.getComputedStyle) {
            //优先使用W3C规范
            return window.getComputedStyle(element)[att]
        } else {
            //针对IE9以下兼容
            return element.currentStyle[att]
        }
    }
    var _getScrollElement = function (el) {
        var currentNode = el
        while (currentNode && currentNode.tagName !== 'HTML' &&
            currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
            let overflowY = _getStyle(currentNode, 'overflowY')
            if (overflowY === 'scroll' || overflowY === 'auto') {
                return currentNode
            }
            currentNode = currentNode.parentNode
        }
        return window
    }

    var $body = $('body')
    var $doc = $(document)

    var autoComplete = function (selector, opt) {
        if (!selector) {
            _warn('非法的选择器')
            return false
        }
        this.$el = $(selector)
        this.$container = null
        this.$items = null
        this.selectedIndex = -1
        this.opt = $.extend({
            containerClass: 'autocomplete-container',
            itemClass: 'autocomplete-item',
            selectedItemClass: 'selected',
            sameHeight: true,
            debounce: 200,
            onInput: null,
            onSelect: null,
            onEnter: null
        }, opt)
    }
    autoComplete.prototype.init = function () {
        this.addItemEvent()
        this.addInputEvent()
    }
    autoComplete.prototype.addInputEvent = function () {
        var that = this
        this.$el.on({
            'focus': function () {
                that.showContainer($(this))
                that.emitInput()
            },
            'blur': function () {
                setTimeout(function () {
                    that.hideContainer()
                }, 150)
            },
            'input propertychange': _debounce(that.opt.debounce, function () {
                if (that.$container.css('display') === 'none') {
                    that.showContainer($(this))
                }
                that.emitInput()
            }),
            'keydown': function (e) {
                that.handKeyDown(e || event)
            }
        })
    }
    autoComplete.prototype.addItemEvent = function () {
        var that = this
        $doc.on('mouseenter', '.' + this.opt.containerClass + ' .' + this.opt.itemClass, function () {
            $(this).addClass(that.opt.selectedItemClass).siblings().removeClass(that.opt.selectedItemClass)
        })
        $doc.on('mouseleave', '.' + this.opt.containerClass + ' .' + this.opt.itemClass, function () {
            $(this).removeClass(that.opt.selectedItemClass)
        })
        $doc.on('click', '.' + this.opt.containerClass + ' .' + this.opt.itemClass, function () {
            that.selectedIndex = $(this).index()
            that.emitSelect()
        })
    }
    autoComplete.prototype.handKeyDown = function (e) {
        var code = +e.keyCode
        if (code === 38 || code === 40 || code === 13) {
            e.preventDefault()
        }
        switch (code) {
            case 38:
                this.handUpDown('up')
                break
            case 40:
                this.handUpDown('down')
                break
            case 13:
                this.handEnter()
                break
        }
    }
    autoComplete.prototype.handUpDown = function (type) {
        if (!this.$items) {
            return false
        }
        var max = this.$items.length
        if (type === 'up') {
            this.selectedIndex--
        } else {
            this.selectedIndex++
        }
        if (this.selectedIndex < 0) {
            this.selectedIndex = max - 1
        }
        if (this.selectedIndex > max - 1) {
            this.selectedIndex = 0
        }
        this.$items.removeClass(this.opt.selectedItemClass)
        this.$items.eq(this.selectedIndex).addClass(this.opt.selectedItemClass)

        this.$container.scrollTop(this.calcScrollTop())
        this.emitSelect()
    }
    autoComplete.prototype.calcScrollTop = function () {
        var h = 0
        if (this.opt.sameHeight) {
            h = this.$items.eq(0).outerHeight() * (this.selectedIndex + 1)
        } else {
            for (let i = 0; i <= this.selectedIndex; i++) {
                h += this.$items.eq(i).outerHeight()
            }
        }
        var scrollParent = _getScrollElement(this.$items.eq(0)[0])
        var scrollTop = h - $(scrollParent).outerHeight()
        scrollTop = scrollTop > 0 ? scrollTop : 0
        return scrollTop
    }
    autoComplete.prototype.handEnter = function (type) {
        this.hideContainer()
        this.emitSelect()
        this.opt.onEnter(this.$el.val())
    }
    autoComplete.prototype.emitInput = function () {
        var that = this
        if (typeof that.opt.onInput === 'function') {
            that.opt.onInput(that.$el.val(), function (html) {
                that.render(html)
            })
        }
    }
    autoComplete.prototype.emitSelect = function () {
        if (this.selectedIndex >= 0 && typeof this.opt.onSelect === 'function') {
            var that = this
            this.opt.onSelect(this.selectedIndex, function (v) {
                that.$el.val(v)
            })
        }
    }
    autoComplete.prototype.showContainer = function ($input) {
        if (this.$container) {
            this.$container.show()
        } else {
            this.$container = $('<div class="' + this.opt.containerClass + '"></div>');
        }
        var offset = $input.offset()
        this.$container.css({
            position: 'absolute',
            float: 'left',
            left: offset.left,
            top: offset.top + $input.outerHeight()
        })
        $body.append(this.$container)
    }
    autoComplete.prototype.hideContainer = function () {
        this.$container.hide()
    }
    autoComplete.prototype.render = function (html) {
        this.selectedIndex = -1
        this.$container.html(html)
        this.$items = this.$container.find('.' + this.opt.itemClass)
    }

    $.fn.autoComplete = function (opt) {
        opt = opt || {}
        var instance = new autoComplete(this, opt)
        instance.init()
        return this
    }
    $.autoComplete = autoComplete
})(jQuery, window, document);
