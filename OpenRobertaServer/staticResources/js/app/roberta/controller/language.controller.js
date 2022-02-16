define(["require", "exports", "log", "jquery", "guiState.controller", "program.controller", "configuration.controller", "user.controller", "notification.controller", "blockly"], function (require, exports, LOG, $, GUISTATE_C, PROGRAM_C, CONFIGURATION_C, USER_C, NOTIFICATION_C, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translate = exports.init = void 0;
    /**
     * Initialize language switching
     */
    function init() {
        var ready = new $.Deferred();
        var language;
        if (navigator.language.indexOf('de') > -1) {
            language = 'de';
        }
        else if (navigator.language.indexOf('fi') > -1) {
            language = 'fi';
        }
        else if (navigator.language.indexOf('da') > -1) {
            language = 'da';
        }
        else if (navigator.language.indexOf('es') > -1) {
            language = 'es';
        }
        else if (navigator.language.indexOf('fr') > -1) {
            language = 'fr';
        }
        else if (navigator.language.indexOf('it') > -1) {
            language = 'it';
        }
        else if (navigator.language.indexOf('ca') > -1) {
            language = 'ca';
        }
        else if (navigator.language.indexOf('pt') > -1) {
            language = 'pt';
        }
        else if (navigator.language.indexOf('pl') > -1) {
            language = 'pl';
        }
        else if (navigator.language.indexOf('ru') > -1) {
            language = 'ru';
        }
        else if (navigator.language.indexOf('be') > -1) {
            language = 'be';
        }
        else if (navigator.language.indexOf('cs') > -1) {
            language = 'cs';
        }
        else if (navigator.language.indexOf('tr') > -1) {
            language = 'tr';
        }
        else if (navigator.language.indexOf('nl') > -1) {
            language = 'nl';
        }
        else if (navigator.language.indexOf('sv') > -1) {
            language = 'sv';
        }
        else if (navigator.language.indexOf('zh-hans') > -1) {
            language = 'zh-hans';
        }
        else if (navigator.language.indexOf('zh-hant') > -1) {
            language = 'zh-hant';
        }
        else if (navigator.language.indexOf('ro') > -1) {
            language = 'ro';
        }
        else if (navigator.language.indexOf('eu') > -1) {
            language = 'eu';
        }
        else if (navigator.language.indexOf('uk') > -1) {
            language = 'uk';
        }
        else {
            language = 'en';
        }
        if (language === 'de') {
            $('.EN').css('display', 'none');
            $('.DE').css('display', 'inline');
            $('li>a.DE').css('display', 'block');
        }
        else {
            $('.DE').css('display', 'none');
            $('.EN').css('display', 'inline');
            $('li>a.EN').css('display', 'block');
        }
        $('#language li a[lang=' + language + ']')
            .parent()
            .addClass('disabled');
        var url = 'blockly/msg/js/' + language + '.js';
        getCachedScript(url).done(function (data) {
            translate();
            ready.resolve(language);
        });
        initEvents();
        return ready.promise(language);
    }
    exports.init = init;
    function initEvents() {
        $('#language').onWrap('click', 'li a', function () {
            LOG.info('language clicked');
            var language = $(this).attr('lang');
            switchLanguage(language);
        }),
            'switch language clicked';
    }
    function switchLanguage(language) {
        if (GUISTATE_C.getLanguage == language) {
            return;
        }
        var url = 'blockly/msg/js/' + language.toLowerCase() + '.js';
        getCachedScript(url).done(function (data) {
            translate();
            GUISTATE_C.setLanguage(language);
            PROGRAM_C.reloadView();
            CONFIGURATION_C.reloadView();
            USER_C.initValidationMessages();
            NOTIFICATION_C.reloadNotifications();
            var value = Blockly.Msg.MENU_START_BRICK;
            if (value.indexOf('$') >= 0) {
                value = value.replace('$', GUISTATE_C.getRobotRealName());
            }
            $('#menuRunProg').text(value);
            if (GUISTATE_C.getBlocklyWorkspace()) {
                GUISTATE_C.getBlocklyWorkspace().robControls.refreshTooltips(GUISTATE_C.getRobotRealName());
            }
        });
        LOG.info('language switched to ' + language);
    }
    /**
     * Translate the web page
     */
    function translate($domElement) {
        if (!$domElement || typeof $domElement !== 'object' || !$domElement.length) {
            $domElement = $(document.body);
        }
        $domElement.find('[lkey]').each(function (index) {
            var lkey = $(this).attr('lkey');
            var key = lkey.replace('Blockly.Msg.', '');
            var value = Blockly.Msg[key];
            if (value == undefined) {
                console.log('UNDEFINED    key : value = ' + key + ' : ' + value);
            }
            if (lkey === 'Blockly.Msg.SOURCE_CODE_EDITOR_PLACEHOLDER') {
                $('#sourceCodeEditorTextArea').attr('placeholder', value);
            }
            else if (lkey === 'Blockly.Msg.SOURCE_CODE_EDITOR_UPLOAD_TOOLTIP') {
                $('#uploadSourceCodeEditor').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.SOURCE_CODE_EDITOR_IMPORT_TOOLTIP') {
                $('#importSourceCodeEditor').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.SOURCE_CODE_EDITOR_BUILD_TOOLTIP') {
                $('#buildSourceCodeEditor').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.SOURCE_CODE_EDITOR_RUN_TOOLTIP') {
                $('#runSourceCodeEditor').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_EDIT_TOOLTIP') {
                $('#head-navi-tooltip-program').attr('data-original-title', value);
                $('#head-navi-tooltip-configuration').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_CODE_TOOLTIP') {
                $('#codeButton').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_SIM_TOOLTIP') {
                $('#simButton').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_SIM_DEBUG_TOOLTIP') {
                $('#simDebugButton').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_INFO_TOOLTIP') {
                $('#infoButton').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_HELP_TOOLTIP') {
                $('#helpButton').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_LEGAL_TOOLTIP') {
                $('#legalButton').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_ROBOT_TOOLTIP') {
                $('#head-navi-tooltip-robot').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_HELP_TOOLTIP') {
                $('#head-navi-tooltip-help').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_USER_TOOLTIP') {
                $('#head-navi-tooltip-user').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_GALLERY_TOOLTIP') {
                $('#head-navi-tooltip-gallery').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_LANGUAGE_TOOLTIP') {
                $('#head-navi-tooltip-language').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_USER_STATE_TOOLTIP') {
                $('#iconDisplayLogin').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_ROBOT_STATE_TOOLTIP') {
                $('#iconDisplayRobotState').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_START_TOOLTIP') {
                $('#simControl').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_STOP_TOOLTIP') {
                $('#simCancel').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_SCENE_TOOLTIP') {
                $('#simScene').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_ADD_COLOR_OBJECT_TOOLTIP') {
                $('#simCustomColorObject').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_ADD_OBSTACLE_TOOLTIP') {
                $('#simCustomObstacle').attr('data-original-title', value);
                $('#simAddObstacleRectangle').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_DELETE_ELEMENTS_TOOLTIP') {
                $('#simDeleteElements').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_CHANGE_COLOR_TOOLTIP') {
                $('#simChangeObjectColor').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_DELETE_OBJECT_TOOLTIP') {
                $('#simDeleteObject').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_CONFIG_EXPORT') {
                $('#simDownloadConfig').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_CONFIG_IMPORT') {
                $('#simUploadConfig').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.MENU_SIM_ROBOT_TOOLTIP') {
                $('#simRobot').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_SIM_VALUES_TOOLTIP') {
                $('#simValues').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_SIM_IMPORT_TOOLTIP') {
                $('#simImport').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_SIM_POSE_TOOLTIP') {
                $('#simResetPose').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_DEBUG_START_TOOLTIP') {
                $('#debugMode').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_DEBUG_STEP_BREAKPOINT_TOOLTIP') {
                $('#simControlBreakPoint').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_DEBUG_STEP_INTO_TOOLTIP') {
                $('#simControlStepInto').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_DEBUG_STEP_OVER_TOOLTIP') {
                $('#simControlStepOver').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_CODE_DOWNLOAD_TOOLTIP') {
                $('#codeDownload').attr('data-original-title', value);
                $('#downloadSourceCodeEditor').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_CODE_REFRESH_TOOLTIP') {
                $('#codeRefresh').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_TUTORIAL_TOOLTIP') {
                $('#head-navi-tooltip-tutorials').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.MENU_RIGHT_TUTORIAL_TOOLTIP') {
                $('#tutorialButton').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.BUTTON_EMPTY_LIST') {
                $('#logList>.bootstrap-table').find('button[name="refresh"]').attr('data-original-title', value);
            }
            else if (lkey === 'Blockly.Msg.LIST_BACK_TOOLTIP') {
                $('.bootstrap-table').find('.backList').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.PROGLIST_DELETE_ALL_TOOLTIP') {
                $('#deleteSomeProg').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.PROGLIST_DELETE_TOOLTIP') {
                $('#programNameTable').find('.delete').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.PROGLIST_SHARE_TOOLTIP') {
                $('#programNameTable').find('.share').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.PROGLIST_SHARE_WITH_GALLERY_TOOLTIP') {
                $('#programNameTable').find('.gallery').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.PROGLIST_LOAD_TOOLTIP') {
                $('#programNameTable').find('.load').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.CONFLIST_DELETE_ALL_TOOLTIP') {
                $('#deleteSomeConf').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.CONFLIST_DELETE_TOOLTIP') {
                $('#confNameTable').find('.delete').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.CONFLIST_LOAD_TOOLTIP') {
                $('#confNameTable').find('.load').attr('data-original-title', value);
            }
            else if (lkey == 'Blockly.Msg.OLDER_THEN_14' || lkey == 'Blockly.Msg.YOUNGER_THEN_14') {
                $(this).html(value);
            }
            else if ($(this).data('translationTargets')) {
                var attributeTargets = $(this).data('translationTargets').split(' ');
                for (var key in attributeTargets) {
                    if (attributeTargets[key] === 'text' || attributeTargets[key] === 'html') {
                        $(this)[attributeTargets[key]](value);
                    }
                    else {
                        $(this).attr(attributeTargets[key], value);
                    }
                }
            }
            else {
                $(this).html(value);
                $(this).attr('value', value);
            }
        });
    }
    exports.translate = translate;
    /**
     * $.getScript() will append a timestamped query parameter to the url to
     * prevent caching. The cache control should be handled using http-headers.
     * see https://api.jquery.com/jquery.getscript/#caching-requests
     */
    function getCachedScript(url, options) {
        // Allow user to set any option except for dataType, cache, and url
        options = $.extend(options || {}, {
            dataType: 'script',
            cache: true,
            url: url,
        });
        // Use $.ajax() since it is more flexible than $.getScript
        // Return the jqXHR object so we can chain callbacks
        return jQuery.ajax(options);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2UuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL2xhbmd1YWdlLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0E7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixJQUFJLFFBQVEsQ0FBQztRQUNiLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDdkMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDbkQsUUFBUSxHQUFHLFNBQVMsQ0FBQztTQUN4QjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDbkQsUUFBUSxHQUFHLFNBQVMsQ0FBQztTQUN4QjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjthQUFNO1lBQ0gsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNuQjtRQUNELElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNuQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN4QzthQUFNO1lBQ0gsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FB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