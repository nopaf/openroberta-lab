define(["require", "exports", "message", "log", "jquery", "blockly", "jquery-validate", "bootstrap"], function (require, exports, MSG, LOG, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeLinks = exports.annotateBlocks = exports.clearAnnotations = exports.clearTabAlert = exports.alertTab = exports.isLocalStorageAvailable = exports.countBlocks = exports.getHashFrom = exports.download = exports.getBasename = exports.sgn = exports.roundUltraSound = exports.round = exports.response = exports.showMsgOnTop = exports.showSingleListModal = exports.showSingleModal = exports.setFocusOnElement = exports.checkVisibility = exports.calcDataTableHeight = exports.formatResultLog = exports.parseDate = exports.formatDate = exports.setObjectProperty = exports.getPropertyFromObject = exports.isEmpty = exports.clone = exports.base64decode = void 0;
    var ANIMATION_DURATION = 750;
    var ratioWorkspace = 1;
    /**
     * Decode base64 string to array of bytes
     *
     * @param b64string
     *            A base64 encoded string
     */
    function base64decode(b64string) {
        var byteCharacters = atob(b64string);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Uint8Array(byteNumbers);
    }
    exports.base64decode = base64decode;
    function clone(obj) {
        var copy;
        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj)
            return obj;
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr))
                    copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
    exports.clone = clone;
    function isEmpty(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
    exports.isEmpty = isEmpty;
    function getPropertyFromObject(obj, prop, arrayIndex) {
        //property not found
        if (typeof obj === 'undefined')
            return false;
        //index of next property split
        var _index = prop.indexOf('.');
        //property split found; recursive call
        if (_index > -1) {
            //get object at property (before split), pass on remainder
            return getPropertyFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1), arrayIndex);
        }
        //no split; get property
        if (arrayIndex != undefined) {
            return obj[prop][arrayIndex];
        }
        return obj[prop];
    }
    exports.getPropertyFromObject = getPropertyFromObject;
    function setObjectProperty(obj, prop, value, arrayIndex) {
        //property not found
        if (typeof obj === 'undefined')
            return false;
        //index of next property split
        var _index = prop.indexOf('.');
        //property split found; recursive call
        if (_index > -1) {
            //get object at property (before split), pass on remainder
            return setObjectProperty(obj[prop.substring(0, _index)], prop.substr(_index + 1), value, arrayIndex);
        }
        //no split; get property
        if (arrayIndex != undefined) {
            return (obj[prop][arrayIndex] = value);
        }
        obj[prop] = value;
    }
    exports.setObjectProperty = setObjectProperty;
    /**
     * Format date
     *
     * @param {date}
     *            date from server to be formatted
     */
    function formatDate(dateLong) {
        if (dateLong) {
            var date = new Date(dateLong);
            var datestring = ('0' + date.getDate()).slice(-2) +
                '.' +
                ('0' + (date.getMonth() + 1)).slice(-2) +
                '.' +
                date.getFullYear() +
                ', ' +
                ('0' + date.getHours()).slice(-2) +
                ':' +
                ('0' + date.getMinutes()).slice(-2);
            return datestring;
        }
        else {
            return '';
        }
    }
    exports.formatDate = formatDate;
    /**
     * Convert date into numeric value
     *
     * @param {d}
     *            date in the form 'dd.mm.yyyy, hh:mm:ss'
     */
    function parseDate(d) {
        if (d) {
            var dayPart = d.split(', ')[0];
            var timePart = d.split(', ')[1];
            var day = dayPart.split('.')[0];
            var month = dayPart.split('.')[1] - 1;
            var year = dayPart.split('.')[2];
            var hour = timePart.split(':')[0];
            var minute = timePart.split(':')[1];
            var second = timePart.split(':')[2];
            var mseconds = timePart.split('.')[1];
            var date = new Date(year, month, day, hour, minute, second, mseconds);
            return date.getTime();
        }
        return 0;
    }
    exports.parseDate = parseDate;
    /**
     * Format result of server call for logging
     *
     * @param {result}
     *            Result-object from server call
     */
    function formatResultLog(result) {
        var str = '{';
        var comma = false;
        for (var key in result) {
            if (comma) {
                str += ',';
            }
            else {
                comma = true;
            }
            str += '"' + key + '":';
            if (result.hasOwnProperty(key)) {
                // The output of items is limited to the first 100 characters
                if (result[key].length > 100) {
                    str += '"' + JSON.stringify(result[key]).substring(1, 100) + ' ..."';
                }
                else {
                    str += JSON.stringify(result[key]);
                }
            }
        }
        str += '}';
        return str;
    }
    exports.formatResultLog = formatResultLog;
    /**
     * Calculate height of data table
     */
    function calcDataTableHeight() {
        return Math.round($(window).height() - 100);
    }
    exports.calcDataTableHeight = calcDataTableHeight;
    function checkVisibility() {
        var stateKey, eventKey, keys = {
            hidden: 'visibilitychange',
            webkitHidden: 'webkitvisibilitychange',
            mozHidden: 'mozvisibilitychange',
            msHidden: 'msvisibilitychange',
        };
        for (stateKey in keys) {
            if (stateKey in document) {
                eventKey = keys[stateKey];
                break;
            }
        }
        return function (c) {
            if (c) {
                document.addEventListener(eventKey, c);
            }
            return !document[stateKey];
        };
    }
    exports.checkVisibility = checkVisibility;
    function setFocusOnElement($elem) {
        setTimeout(function () {
            if ($elem.is(':visible') == true) {
                $elem.focus();
            }
        }, 800);
    }
    exports.setFocusOnElement = setFocusOnElement;
    function showSingleModal(customize, onSubmit, onHidden, validator) {
        customize();
        $('#single-modal-form').onWrap('submit', function (e) {
            e.preventDefault();
            onSubmit();
        });
        $('#single-modal').onWrap('hidden.bs.modal', function () {
            $('#single-modal-form').off('submit');
            $('#singleModalInput').val('');
            $('#single-modal-form').validate().resetForm();
            onHidden();
        });
        $('#single-modal-form').removeData('validator');
        $('#single-modal-form').validate(validator);
        setFocusOnElement($('#singleModalInput'));
        $('#single-modal').modal('show');
    }
    exports.showSingleModal = showSingleModal;
    function showSingleListModal(customize, onSubmit, onHidden, validator) {
        $('#single-modal-list-form').onWrap('submit', function (e) {
            e.preventDefault();
            onSubmit();
        });
        $('#single-modal-list').onWrap('hidden.bs.modal', function () {
            $('#single-modal-list-form').unbind('submit');
            onHidden();
        });
        setFocusOnElement($('#singleModalListInput'));
        $('#single-modal-list').modal('show');
    }
    exports.showSingleListModal = showSingleListModal;
    /**
     * Helper to show the information on top of the share modal.
     *
     */
    function showMsgOnTop(msg) {
        $('#show-message').find('button').removeAttr('data-dismiss');
        $('#show-message')
            .find('button')
            .oneWrap('click', function (e) {
            $('#show-message').modal('hide');
            $('#show-message').find('button').attr('data-dismiss', 'modal');
        });
        MSG.displayInformation({
            rc: 'not ok',
        }, '', msg);
    }
    exports.showMsgOnTop = showMsgOnTop;
    /**
     * Handle result of server call
     *
     * @param {result}
     *            Result-object from server call
     */
    function response(result) {
        LOG.info('result from server: ' + formatResultLog(result));
        if (result.rc != 'ok') {
            MSG.displayMessage(result.message, 'POPUP', '');
        }
    }
    exports.response = response;
    /**
     * Rounds a number to required decimal
     *
     * @param value
     *            {Number} - to be rounded
     * @param decimals
     *            {Number} - number of decimals after rounding
     * @return {Number} rounded number
     *
     */
    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    exports.round = round;
    /**
     * Rounds a number to required decimal and clips value to the range [0, 255]
     * (Range of UltraSound sensor)
     *
     * @param value
     *            {Number} - to be rounded
     * @param decimals
     *            {Number} - number of decimals after rounding
     * @return {Number} rounded and clipped number
     *
     */
    function roundUltraSound(value, decimals) {
        var ultraReading = round(value, decimals);
        if (ultraReading > 255) {
            ultraReading = 255;
        }
        return ultraReading;
    }
    exports.roundUltraSound = roundUltraSound;
    /**
     * Get the sign of the number.
     *
     * @param x
     *            {Number} -
     * @return {Number} - 1 if it is positive number o/w return -1
     */
    function sgn(x) {
        return (x > 0) - (x < 0);
    }
    exports.sgn = sgn;
    /**
     * Returns the basename (i.e. "hello" in "C:/folder/hello.txt")
     *
     * @param path
     *            {String} - path
     */
    function getBasename(path) {
        var base = new String(path).substring(path.lastIndexOf('/') + 1);
        if (base.lastIndexOf('.') != -1) {
            base = base.substring(0, base.lastIndexOf('.'));
        }
        return base;
    }
    exports.getBasename = getBasename;
    function destroyClickedElement(event) {
        document.body.removeChild(event.target);
    }
    function download(fileName, content) {
        if ('Blob' in window && navigator.userAgent.toLowerCase().match(/iPad|iPhone|Android/i) == null) {
            var contentAsBlob = new Blob([content], {
                type: 'application/octet-stream',
            });
            if ('msSaveOrOpenBlob' in navigator) {
                navigator.msSaveOrOpenBlob(contentAsBlob, fileName);
            }
            else {
                var downloadLink = document.createElement('a');
                downloadLink.download = fileName;
                downloadLink.innerHTML = 'Download File';
                downloadLink.href = window.URL.createObjectURL(contentAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
            }
        }
        else {
            var downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/' + fileName.substring(fileName.indexOf('.') + 1) + ';charset=utf-8,' + encodeURIComponent(content));
            downloadLink.setAttribute('download', fileName);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.click();
        }
    }
    exports.download = download;
    function getHashFrom(string) {
        var hash = 0;
        for (var i = 0; i < string.length; i++) {
            hash = (hash << 5) - hash + string.charCodeAt(i++);
        }
        return hash < 0 ? hash * -1 + 0xffffffff : hash;
    }
    exports.getHashFrom = getHashFrom;
    function countBlocks(xmlString) {
        var counter = 0;
        var pos = 0;
        while (true) {
            pos = xmlString.indexOf('<block', pos);
            if (pos != -1) {
                counter++;
                pos += 6;
            }
            else {
                break;
            }
        }
        return counter - 1;
    }
    exports.countBlocks = countBlocks;
    function isLocalStorageAvailable() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        }
        catch (e) {
            return false;
        }
    }
    exports.isLocalStorageAvailable = isLocalStorageAvailable;
    function alertTab(tabIdentifier) {
        clearTabAlert(tabIdentifier);
        $('#' + tabIdentifier).width(); // trigger a reflow to sync animations
        $('#' + tabIdentifier).prepend('<span class="typcn typcn-warning-outline"></span>'); // add alert typicon
        $('#' + tabIdentifier).addClass('blinking');
    }
    exports.alertTab = alertTab;
    function clearTabAlert(tabIdentifier) {
        $('#' + tabIdentifier)
            .children()
            .remove('.typcn'); // remove alert typicon
        $('#' + tabIdentifier).removeClass('blinking');
    }
    exports.clearTabAlert = clearTabAlert;
    var __entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
    };
    String.prototype.escapeHTML = function () {
        return String(this).replace(/[&<>"'\/]/g, function (s) {
            return __entityMap[s];
        });
    };
    $.fn.draggable = function (opt) {
        opt = $.extend({
            handle: '',
            cursor: 'move',
            draggableClass: 'draggable',
            activeHandleClass: 'active-handle',
        }, opt);
        var $selected = null;
        var $elements = opt.handle === '' ? this : this.find(opt.handle);
        $elements
            .css('cursor', opt.cursor)
            .on('mousedown touchstart', function (e) {
            var pageX = e.pageX || e.originalEvent.touches[0].pageX;
            var pageY = e.pageY || e.originalEvent.touches[0].pageY;
            if (opt.handle === '') {
                $selected = $(this);
                $selected.addClass(opt.draggableClass);
            }
            else {
                $selected = $(this).parent();
                $selected.addClass(opt.draggableClass).find(opt.handle).addClass(opt.activeHandleClass);
            }
            var drg_h = $selected.outerHeight(), drg_w = $selected.outerWidth(), pos_y = $selected.offset().top + drg_h - pageY, pos_x = $selected.offset().left + drg_w - pageX;
            $(document)
                .on('mousemove touchmove', function (e) {
                var pageX = e.pageX || e.originalEvent.touches[0].pageX;
                var pageY = e.pageY || e.originalEvent.touches[0].pageY;
                // special case movable slider between workspace and right divs
                if (opt.axis == 'x') {
                    var left = pageX + pos_x - drg_w;
                    var left = Math.min(left, $('#main-section').width() - 80);
                    var left = Math.max(left, 42);
                    $selected.offset({
                        top: 0,
                        left: left - 4,
                    });
                    $('#blockly').width(left + 3);
                    $('.rightMenuButton').css({
                        right: $(window).width() - left,
                    });
                    $('.fromRight').css({
                        width: $(window).width() - $('#blockly').width(),
                    });
                    ratioWorkspace = $('#blockly').outerWidth() / $('#main-section').outerWidth();
                    $(window).resize();
                }
                else {
                    $selected.offset({
                        top: pageY + pos_y - drg_h,
                        left: pageX + pos_x - drg_w,
                    });
                }
                $selected.css({
                    right: 'auto',
                });
            })
                .on('mouseup touchend', function () {
                $(this).off('mousemove touchmove'); // Unbind events from document
                if ($selected !== null) {
                    $selected.removeClass(opt.draggableClass);
                    $selected = null;
                }
            });
        })
            .on('mouseup touchend', function () {
            if ($selected) {
                if (opt.handle === '') {
                    $selected.removeClass(opt.draggableClass);
                }
                else {
                    $selected.removeClass(opt.draggableClass).find(opt.handle).removeClass(opt.activeHandleClass);
                }
            }
            $selected = null;
        });
        return this;
    };
    var originalAddClass = $.fn.addClass;
    $.fn.addClass = function () {
        var result = originalAddClass.apply(this, arguments);
        $(this).trigger('classChange');
        return result;
    };
    var originalRemoveClass = $.fn.removeClass;
    $.fn.removeClass = function () {
        var result = originalRemoveClass.apply(this, arguments);
        $(this).trigger('classChange');
        return result;
    };
    $.fn.closeRightView = function (opt_callBack) {
        if ($('.fromRight.rightActive').hasClass('shifting')) {
            return;
        }
        $('.fromRight.rightActive').addClass('shifting');
        Blockly.hideChaff();
        $('.blocklyToolboxDiv').css('display', 'inherit');
        var that = this; //$('#blockly')
        $('.fromRight.rightActive').animate({
            width: 0,
        }, {
            duration: ANIMATION_DURATION,
            start: function () {
                $('.modal').modal('hide');
                $('.rightMenuButton.rightActive').removeClass('rightActive');
            },
            step: function (now) {
                that.width($('#main-section').outerWidth() - now);
                $('.rightMenuButton').css('right', now);
                ratioWorkspace = $('#blockly').outerWidth() / $('#main-section').outerWidth();
                $(window).resize();
            },
            done: function () {
                that.width($('#main-section').outerWidth());
                $('.rightMenuButton').css('right', 0);
                ratioWorkspace = 1;
                $('.fromRight').width(0);
                that.removeClass('rightActive');
                $('.fromRight.rightActive').removeClass('rightActive');
                $('#sliderDiv').hide();
                $(window).resize();
                if (typeof opt_callBack == 'function') {
                    opt_callBack();
                }
            },
            always: function () {
                $('.fromRight.shifting').removeClass('shifting');
            },
        });
    };
    $.fn.openRightView = function (viewName, initialViewWidth, opt_callBack) {
        if ($('.fromRight.rightActive').hasClass('shifting')) {
            return;
        }
        Blockly.hideChaff();
        var width;
        var smallScreen;
        var buttonName = viewName;
        if (opt_callBack && typeof opt_callBack == 'string') {
            buttonName = opt_callBack;
        }
        if ($(window).width() < 768) {
            smallScreen = true;
            width = this.width() - 52;
        }
        else {
            smallScreen = false;
            width = this.width() * initialViewWidth;
        }
        if ($('#blockly').hasClass('rightActive')) {
            $('.fromRight.rightActive').removeClass('rightActive');
            $('.rightMenuButton.rightActive').removeClass('rightActive');
            $('#' + viewName + 'Div, #' + buttonName + 'Button').addClass('rightActive');
            $(window).resize();
            if (smallScreen) {
                $('.blocklyToolboxDiv').css('display', 'none');
            }
            if (typeof opt_callBack == 'function') {
                opt_callBack();
            }
            return;
        }
        this.addClass('rightActive');
        $('#' + viewName + 'Div').addClass('shifting');
        $('#' + viewName + 'Div, #' + buttonName + 'Button').addClass('rightActive');
        var that = this;
        $('.fromRight.rightActive').animate({
            width: width,
        }, {
            duration: ANIMATION_DURATION,
            step: function (now, tween) {
                that.width($('#main-section').outerWidth() - now);
                $('.rightMenuButton').css('right', now);
                ratioWorkspace = $('#blockly').outerWidth() / $('#main-section').outerWidth();
                $(window).resize();
            },
            done: function () {
                $('#sliderDiv').show();
                that.width($('#main-section').outerWidth() - $('.fromRight.rightActive').width());
                $('.rightMenuButton').css('right', $('.fromRight.rightActive').width());
                ratioWorkspace = $('#blockly').outerWidth() / $('#main-section').outerWidth();
                $(window).resize();
                if (smallScreen) {
                    $('.blocklyToolboxDiv').css('display', 'none');
                }
                $('#sliderDiv').css({
                    left: that.width() - 7,
                });
                if (typeof opt_callBack == 'function') {
                    opt_callBack();
                }
            },
            always: function () {
                $('#' + viewName + 'Div').removeClass('shifting');
            },
        });
    };
    $(window).resize(function () {
        var parentWidth = $('#main-section').outerWidth();
        var height = Math.max($('#blockly').outerHeight(), $('#brickly').outerHeight());
        var rightWidth = (1 - ratioWorkspace) * parentWidth;
        var leftWidth = ratioWorkspace * parentWidth;
        if (!$('.fromRight.rightActive.shifting').length > 0) {
            if ($('.fromRight.rightActive').length > 0) {
                $('.fromRight.rightActive').width(rightWidth);
                $('.rightMenuButton').css('right', rightWidth);
                $('#sliderDiv').css('left', leftWidth - 7);
            }
            $('#blockly').width(leftWidth);
        }
        else {
            leftWidth = $('#blockly').outerWidth();
        }
        if ($('#blocklyDiv')) {
            $('#blocklyDiv').width(leftWidth - 4);
            $('#blocklyDiv').height(height);
        }
        if ($('#bricklyDiv')) {
            $('#bricklyDiv').width(parentWidth);
            $('#bricklyDiv').height(height);
        }
        // here comes a fix for a strange browser behavior while zoom is not 100%. It is just in case (e.g. chrome 125% works fine, 110% not).
        // Seems that either the returned sizes from the browser sometimes include margins/borders and sometimes not or that the assigned sizes behave
        // different (with and without margins/borders).
        var diff = $('#main-section').outerWidth() - $('#blocklyDiv').outerWidth() - rightWidth;
        if (diff != 0) {
            $('#blocklyDiv').width(leftWidth - 4 + diff);
        }
        var workspace = Blockly.getMainWorkspace();
        if (workspace) {
            Blockly.svgResize(workspace);
        }
    });
    /**
     * Remove error and warning annotation from all blocks located in this
     * workspace. Usually this is done with a reload of all blocks, but here we
     * only want to remove the annotations.
     *
     * @param {workspacee}
     *            workspace
     */
    function clearAnnotations(workspace) {
        if (workspace && workspace instanceof Blockly.Workspace) {
            var allBlocks = workspace.getAllBlocks();
            for (var i = 0; i < allBlocks.length; i++) {
                var icons = allBlocks[i].getIcons();
                for (var k = 0; k < icons.length; k++) {
                    var block = icons[k].block_;
                    if (block.error) {
                        block.error.dispose();
                        block.render();
                    }
                    else if (block.warning) {
                        block.warning.dispose();
                        block.render();
                    }
                }
            }
        }
    }
    exports.clearAnnotations = clearAnnotations;
    /**
     * Annotate the visible configuration blocks with warnings and errors
     * generated server side.
     *
     * @param {object}
     *            confAnnos - {block id, {type of annotation, message key}}
     */
    function annotateBlocks(workspace, annotations) {
        for (var annoId in annotations) {
            var block = workspace.getBlockById(annoId);
            if (block) {
                var anno = annotations[annoId];
                for (var annoType in anno) {
                    var annoMsg = Blockly.Msg[anno[annoType]] || anno[annoType] || 'unknown error';
                    switch (annoType) {
                        case 'ERROR':
                            block.setErrorText(annoMsg);
                            block.error.setVisible(true);
                            break;
                        case 'WARNING':
                            block.setWarningText(annoMsg);
                            block.warning.setVisible(true);
                            break;
                        default:
                            console.warn('Unsupported annotation: ' + annoType);
                    }
                }
            }
        }
    }
    exports.annotateBlocks = annotateBlocks;
    function removeLinks($elem) {
        $elem
            .filter(function () {
            return $(this).attr('href') && ($(this).attr('href').indexOf('http') === 0 || $(this).attr('href').indexOf('javascript:linkTo') === 0);
        })
            .each(function () {
            $(this).removeAttr('href');
        });
    }
    exports.removeLinks = removeLinks;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9oZWxwZXIvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQSxJQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztJQUUvQixJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFDdkI7Ozs7O09BS0c7SUFDSCxTQUFTLFlBQVksQ0FBQyxTQUFTO1FBQzNCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxJQUFJLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakQ7UUFDRCxPQUFPLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUE4dEJHLG9DQUFZO0lBNXRCaEIsU0FBUyxLQUFLLENBQUMsR0FBRztRQUNkLElBQUksSUFBSSxDQUFDO1FBRVQsbURBQW1EO1FBQ25ELElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxRQUFRLElBQUksT0FBTyxHQUFHO1lBQUUsT0FBTyxHQUFHLENBQUM7UUFFdEQsY0FBYztRQUNkLElBQUksR0FBRyxZQUFZLElBQUksRUFBRTtZQUNyQixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxlQUFlO1FBQ2YsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO1lBQ3RCLElBQUks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