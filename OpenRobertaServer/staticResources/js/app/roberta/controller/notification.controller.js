/*
-------------------------------------------------------------------------

This a typescript source file stored in openroberta-lab/TypeScriptSources
It gets compiled to openroberta-lab/OpenRobertaServer/staticResources/js

DO NOT EDIT THIS IN openroberta-lab/OpenRobertaServer/staticResources/js !

-------------------------------------------------------------------------
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "guiState.model", "guiState.controller", "notification.model", "comm", "jquery"], function (require, exports, guiStateModel, guiStateController, notificationModel, comm, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showNotificationModal = exports.reloadNotifications = exports.init = void 0;
    var fadingDuration = 400;
    var notificationElement = $('#releaseInfo');
    var notificationElementTitle = notificationElement.children('#releaseInfoTitle');
    var notificationElementDescription = notificationElement.children('#releaseInfoContent');
    var $notificationForm = $('#notificationForm');
    var $notificationFileUpload = $('#notificationFileUpload');
    var $notificationFileDownload = $('#notificationFileDownload');
    var defaultElementMarkerTime = 5 * 60 * 1000;
    var defaultPopupTime = 20 * 1000;
    var defaultStartScreenTime = undefined;
    var activeNotifications = [];
    function loadAndInitNotifications() {
        notificationModel.getNotifications(function (result) {
            activeNotifications = initNotifications(result.notifications);
        });
    }
    function init() {
        initNotificationModal();
        loadAndInitNotifications();
        comm.onNotificationsAvailableCallback(reloadNotifications);
    }
    exports.init = init;
    function reloadNotifications() {
        removeNotifications();
        loadAndInitNotifications();
    }
    exports.reloadNotifications = reloadNotifications;
    /*----------- NOTIFICATION MODAL -----------*/
    function showNotificationModal() {
        notificationModel.getNotifications(function (result) {
            setFileDownloadContent(result.notifications);
            $('#modal-notifications').modal('show');
        });
    }
    exports.showNotificationModal = showNotificationModal;
    function showAlertInNotificationModal(context, content, time) {
        time = time || 6 * 1000;
        var $alert = $('#notification-modal-alert');
        $alert
            .html(content)
            .removeClass()
            .addClass('alert')
            .addClass('alert-' + context)
            .slideDown()
            .delay(time)
            .slideUp();
    }
    function initNotificationModal() {
        $notificationForm.onWrap('submit', function (e) {
            e.preventDefault();
            readFileInputField(function (fileContent) {
                notificationModel.postNotifications(fileContent, function (restResponse) {
                    if (restResponse.rc === 'ok' && restResponse.message === 'ORA_NOTIFICATION_SUCCESS') {
                        $notificationForm.trigger('reset');
                        showAlertInNotificationModal('success', 'The notifications were transmitted successfully');
                        setFileDownloadContent(JSON.parse(fileContent));
                    }
                    else {
                        var errorCode = restResponse.cause;
                        var exceptionMessage = restResponse.parameters && restResponse.parameters.MESSAGE ? ':' + restResponse.parameters.MESSAGE : '';
                        var content = errorCode + exceptionMessage;
                        showAlertInNotificationModal('danger', content, 60 * 1000);
                    }
                });
            });
        });
    }
    function readFileInputField(readyFn) {
        var uploadedFiles = $notificationFileUpload.prop('files');
        if (uploadedFiles.length > 0) {
            readFile(uploadedFiles[0], readyFn);
        }
    }
    function readFile(file, readyFn) {
        var fileReader = new FileReader();
        fileReader.onload = function () { return readyFn(fileReader.result); };
        fileReader.readAsText(file);
    }
    function setFileDownloadContent(jsonContent) {
        var data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonContent, null, '\t'));
        $notificationFileDownload.attr('href', 'data:' + data);
    }
    /*----------- NOTIFICATION HANDLING -----------*/
    function removeNotifications() {
        activeNotifications.forEach(function (notification) {
            notification.removeTriggers();
            notification.hideNotification();
        });
        activeNotifications = [];
    }
    function initNotifications(notificationSpecifications) {
        return notificationSpecifications.map(function (specification) { return new NotificationProcessor(specification); });
    }
    var EventHandler = /** @class */ (function () {
        function EventHandler(selector, event, fn) {
            this.selector = selector;
            this.event = event;
            this.fn = fn;
            this.$element = $(selector);
            this.elementIsPresent = this.$element.length;
        }
        EventHandler.prototype.addTriggers = function () {
            if (this.elementIsPresent) {
                // Use direct event handler if element is present
                this.$element.on(this.event, this.fn);
            }
            else {
                // Use delegate event handler if element is not yet present
                $(document).on(this.event, this.selector, this.fn);
            }
        };
        EventHandler.prototype.removeTriggers = function () {
            if (this.elementIsPresent) {
                this.$element.off(this.event, this.fn);
            }
            else {
                $(document).off(this.event, this.selector, this.fn);
            }
        };
        return EventHandler;
    }());
    var NotificationProcessor = /** @class */ (function () {
        function NotificationProcessor(specification) {
            this.activeEventHandler = [];
            this.notificationHandlers = [];
            this.specification = specification;
            this.setupNotificationHandlers();
            this.addTriggers();
        }
        NotificationProcessor.prototype.setupNotificationHandlers = function () {
            var _this = this;
            this.specification.handlers.forEach(function (handlerSpecification) {
                if (handlerSpecification.popupNotification) {
                    var popup = new PopupNotificationState(handlerSpecification.popupNotification);
                    _this.notificationHandlers.push(popup);
                }
                if (handlerSpecification.elementMarker) {
                    var elementMarker = new ElementMarkerState(handlerSpecification.elementMarker);
                    _this.notificationHandlers.push(elementMarker);
                }
                if (handlerSpecification.startScreen) {
                    var startScreen = new StartScreenNotificationState(handlerSpecification.startScreen);
                    _this.notificationHandlers.push(startScreen);
                }
            });
        };
        NotificationProcessor.prototype.showNotification = function () {
            if (this.specification.once) {
                this.removeTriggers();
            }
            this.notificationHandlers.forEach(function (notification) { return notification.show(); });
        };
        NotificationProcessor.prototype.hideNotification = function () {
            this.notificationHandlers.forEach(function (notification) { return notification.hide(); });
        };
        NotificationProcessor.prototype.evaluateConditionsAndShowNotification = function (specificCondition) {
            var _a = this.specification, generalConditions = _a.condition, ignoreDate = _a.ignoreDate;
            if (NotificationProcessor.evaluateCondition(specificCondition, ignoreDate) && NotificationProcessor.evaluateCondition(generalConditions, ignoreDate)) {
                this.showNotification();
            }
        };
        NotificationProcessor.evaluateCondition = function (conditions, ignoreDate) {
            if (conditions === undefined) {
                return true;
            }
            return conditions.every(function (condition) {
                if (condition.guiModel) {
                    var anyOf = condition.anyOf, equals = condition.equals, notEquals = condition.notEquals;
                    var element_1 = guiStateModel.gui[condition.guiModel];
                    if (anyOf && Array.isArray(anyOf)) {
                        return anyOf.some(function (each) { return element_1 === each; });
                    }
                    if (equals) {
                        return element_1 === equals;
                    }
                    if (notEquals) {
                        if (!Array.isArray(notEquals)) {
                            return element_1 !== notEquals;
                        }
                        return notEquals.every(function (each) { return element_1 !== each; });
                    }
                }
                var selector = parseSelector(condition);
                if (condition.hasClass && selector) {
                    return $(selector).hasClass(condition.hasClass);
                }
                if (!ignoreDate) {
                    if (condition.endTime) {
                        var endTimeDate = parseDateStringWithTimezone(condition.endTime);
                        var now = new Date();
                        return endTimeDate >= now;
                    }
                    if (condition.startTime) {
                        var startTimeDate = parseDateStringWithTimezone(condition.startTime);
                        var now = new Date();
                        return startTimeDate <= now;
                    }
                }
                return true;
            });
        };
        NotificationProcessor.prototype.addEventHandler = function (selector, event, fn) {
            var eventHandler = new EventHandler(selector, event, fn);
            eventHandler.addTriggers();
            this.activeEventHandler.push(eventHandler);
        };
        NotificationProcessor.prototype.addTriggers = function () {
            var _this = this;
            if (!this.specification.triggers || this.specification.triggers > 0) {
                // Directly run notification if conditions are met
                this.evaluateConditionsAndShowNotification();
                return;
            }
            this.specification.triggers.forEach(function (trigger) {
                var event = trigger.event, addClass = trigger.addClass, removeClass = trigger.removeClass, conditions = trigger.conditions;
                var selector = parseSelector(trigger);
                if (!selector)
                    return;
                // "Normal" event listeners
                if (event) {
                    _this.addEventHandler(selector, event, function () {
                        _this.evaluateConditionsAndShowNotification(conditions);
                    });
                }
                // Class changed event listeners
                if (addClass || removeClass) {
                    _this.addEventHandler(selector, 'classChange', function () {
                        if (addClass && $(selector).hasClass(addClass)) {
                            _this.evaluateConditionsAndShowNotification(conditions);
                        }
                        if (removeClass && !$(selector).hasClass(removeClass)) {
                            _this.evaluateConditionsAndShowNotification(conditions);
                        }
                    });
                }
            });
        };
        NotificationProcessor.prototype.removeTriggers = function () {
            this.activeEventHandler.forEach(function (eventHandler) { return eventHandler.removeTriggers(); });
            this.activeEventHandler = [];
        };
        return NotificationProcessor;
    }());
    var NotificationState = /** @class */ (function () {
        function NotificationState(time) {
            this.active = false;
            this.time = time;
        }
        NotificationState.prototype.clearTimerIfExists = function () {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        };
        NotificationState.prototype.setOrResetTimer = function () {
            var _this = this;
            if (this.time) {
                this.clearTimerIfExists();
                this.timer = setTimeout(function () { return _this.hide(); }, this.time);
            }
        };
        NotificationState.prototype.show = function () {
            this.setOrResetTimer();
            if (!this.active) {
                this.showAction();
                this.active = true;
            }
        };
        NotificationState.prototype.hide = function () {
            if (this.active) {
                this.clearTimerIfExists();
                this.hideAction();
                this.active = false;
            }
        };
        return NotificationState;
    }());
    var PopupNotificationState = /** @class */ (function (_super) {
        __extends(PopupNotificationState, _super);
        function PopupNotificationState(popupNotification) {
            var _this = _super.call(this, popupNotification.time || defaultPopupTime) || this;
            _this._title = parseLocalized(popupNotification.title);
            _this._content = parseLocalized(popupNotification.content);
            return _this;
        }
        PopupNotificationState.prototype.hideAction = function () {
            if (notificationElementTitle.html() === this._title && notificationElementDescription.html() === this._content) {
                notificationElement.fadeOut(fadingDuration);
            }
        };
        PopupNotificationState.prototype.showAction = function () {
            notificationElementTitle.html(this._title);
            notificationElementDescription.html(this._content);
            notificationElement.fadeIn(fadingDuration);
        };
        return PopupNotificationState;
    }(NotificationState));
    var ElementMarkerState = /** @class */ (function (_super) {
        __extends(ElementMarkerState, _super);
        function ElementMarkerState(elementMarker) {
            var _this = _super.call(this, elementMarker.time || defaultElementMarkerTime) || this;
            _this._content = parseLocalized(elementMarker.content);
            _this.$element = $(parseSelector(elementMarker));
            _this.$badge = $("<span class='badge badge-primary' style='display:none;'>" + _this._content + '</span>');
            return _this;
        }
        ElementMarkerState.prototype.hideAction = function () {
            if (this.$element.length) {
                this.$badge.fadeOut(fadingDuration).queue(function () {
                    $(this).remove();
                });
            }
        };
        ElementMarkerState.prototype.showAction = function () {
            if (this.$element.length) {
                this.$badge.appendTo(this.$element).fadeIn(fadingDuration);
            }
        };
        return ElementMarkerState;
    }(NotificationState));
    var StartScreenNotificationState = /** @class */ (function (_super) {
        __extends(StartScreenNotificationState, _super);
        function StartScreenNotificationState(startScreen) {
            var _this = _super.call(this, startScreen.time || defaultStartScreenTime) || this;
            _this.$startupMessage = $('#startup-message-statustext');
            _this.content = parseLocalized(startScreen.content);
            _this.$element = $('<h4 style="display: none">' + _this.content + '</h4>');
            return _this;
        }
        StartScreenNotificationState.prototype.showAction = function () {
            this.$element.appendTo(this.$startupMessage).slideDown(fadingDuration);
        };
        StartScreenNotificationState.prototype.hideAction = function () {
            this.$element.slideUp(fadingDuration).queue(function () {
                $(this).remove();
            });
        };
        return StartScreenNotificationState;
    }(NotificationState));
    function parseSelector(element) {
        if (element.htmlId) {
            return '#' + element.htmlId;
        }
        if (element.htmlSelector) {
            return element.htmlSelector;
        }
        return undefined;
    }
    function parseLocalized(object) {
        var localizedDescription = object[guiStateController.getLanguage()];
        return localizedDescription || object['en'];
    }
    /**
     * Parse date from a datestring
     * The parameter must match the format "YYYY-MM-DD HH:mm"
     * This automatically adds the German Timezone (+0200)
     * @param str datestring
     */
    function parseDateStringWithTimezone(str) {
        return new Date(str + ' +0200');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci9ub3RpZmljYXRpb24uY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0VBU0U7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBUUYsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0lBRTNCLElBQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRTlDLElBQU0sd0JBQXdCLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDbkYsSUFBTSw4QkFBOEIsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMzRixJQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRWpELElBQU0sdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDN0QsSUFBTSx5QkFBeUIsR0FBRyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNqRSxJQUFNLHdCQUF3QixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBRS9DLElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQUNuQyxJQUFNLHNCQUFzQixHQUFHLFNBQVMsQ0FBQztJQUV6QyxJQUFJLG1CQUFtQixHQUE0QixFQUFFLENBQUM7SUFFdEQsU0FBUyx3QkFBd0I7UUFDN0IsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsVUFBQyxNQUFNO1lBQ3RDLG1CQUFtQixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxTQUFnQixJQUFJO1FB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