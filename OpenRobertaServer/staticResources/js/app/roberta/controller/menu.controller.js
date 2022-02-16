define(["require", "exports", "message", "comm", "wrap", "robot.controller", "socket.controller", "user.controller", "notification.controller", "userGroup.controller", "guiState.controller", "program.controller", "multSim.controller", "progRun.controller", "configuration.controller", "import.controller", "tour.controller", "sourceCodeEditor.controller", "jquery", "blockly", "progTutorial.controller", "slick"], function (require, exports, MSG, COMM, WRAP, ROBOT_C, SOCKET_C, USER_C, NOTIFICATION_C, USERGROUP_C, GUISTATE_C, PROGRAM_C, MULT_SIM, RUN_C, CONFIGURATION_C, IMPORT_C, TOUR_C, SOURCECODE_C, $, Blockly, TUTORIAL_C) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    var n = 0;
    var QUERY_START = '?';
    var QUERY_DELIMITER = '&';
    var QUERY_ASSIGNMENT = '=';
    var LOAD_SYSTEM_CALL = 'loadSystem';
    var TUTORIAL = 'tutorial';
    var KIOSK = 'kiosk';
    function cleanUri() {
        var uri = window.location.toString();
        var clean_uri = uri.substring(0, uri.lastIndexOf('/'));
        window.history.replaceState({}, document.title, clean_uri);
    }
    // from https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js/21903119#21903119
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1), sURLVariables = sPageURL.split(QUERY_DELIMITER), sParameterName, i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split(QUERY_ASSIGNMENT);
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }
    function handleQuery() {
        // old style queries
        var target = decodeURI(document.location.hash).split('&&');
        if (target[0] === '#forgotPassword') {
            USER_C.showResetPassword(target[1]);
        }
        else if (target[0] === '#loadProgram' && target.length >= 4) {
            GUISTATE_C.setStartWithoutPopup();
            IMPORT_C.openProgramFromXML(target);
        }
        else if (target[0] === '#activateAccount') {
            USER_C.activateAccount(target[1]);
        }
        else if (target[0] === '#overview') {
            GUISTATE_C.setStartWithoutPopup();
            TOUR_C.start('overview');
        }
        else if (target[0] === '#gallery') {
            GUISTATE_C.setStartWithoutPopup();
            $('#tabGalleryList').clickWrap();
        }
        else if (target[0] === '#tutorial') {
            GUISTATE_C.setStartWithoutPopup();
            $('#tabTutorialList').clickWrap();
        }
        else if (target[0] === '#loadSystem' && target.length >= 2) {
            GUISTATE_C.setStartWithoutPopup();
            ROBOT_C.switchRobot(target[1], true);
        }
        // new style queries
        var loadSystem = getUrlParameter(LOAD_SYSTEM_CALL);
        if (loadSystem) {
            GUISTATE_C.setStartWithoutPopup();
            ROBOT_C.switchRobot(loadSystem, true);
        }
        var tutorial = getUrlParameter(TUTORIAL);
        if (tutorial) {
            if (tutorial === 'true' || tutorial === true) {
                GUISTATE_C.setStartWithoutPopup();
                $('#tabTutorialList').clickWrap();
            }
            else {
                var kiosk = getUrlParameter(KIOSK);
                if (kiosk && kiosk === 'true') {
                    GUISTATE_C.setKioskMode(true);
                }
                GUISTATE_C.setStartWithoutPopup();
                TUTORIAL_C.loadFromTutorial(tutorial);
            }
        }
    }
    function init() {
        initMenu();
        initMenuEvents();
        /**
         * Regularly ping the server to keep status information up-to-date
         */
        function pingServer() {
            setTimeout(function () {
                n += 1000;
                if (n >= GUISTATE_C.getPingTime() && GUISTATE_C.doPing()) {
                    COMM.ping(function (result) {
                        GUISTATE_C.setState(result);
                    });
                    n = 0;
                }
                pingServer();
            }, 1000);
        }
        pingServer();
        handleQuery();
        cleanUri();
        var firsttime = true;
        $('#show-startup-message').on('shown.bs.modal', function (e) {
            $(function () {
                if (firsttime) {
                    // *******************
                    // This is a draft to make other/more robots visible.
                    var autoplaySpeed = 2000;
                    var autoplayOn = true;
                    $('#popup-robot-main').on('init', function () {
                        $('#slick-container').mouseenter(function () {
                            autoplayOn = false;
                        });
                        $('#slick-container').mouseleave(function () {
                            autoplayOn = true;
                        });
                        window.setInterval(function () {
                            if (!autoplayOn)
                                return;
                            $('#popup-robot-main').slick('slickPrev');
                        }, autoplaySpeed);
                    });
                    // ******************
                    $('#popup-robot-main').slick({
                        centerMode: true,
                        dots: true,
                        infinite: true,
                        centerPadding: '60px',
                        slidesToShow: 3,
                        index: 2,
                        swipeToSlide: true,
                        setPosition: true,
                        prevArrow: "<button type='button' class='slick-prev slick-arrow typcn typcn-arrow-left-outline'></button>",
                        nextArrow: "<button type='button' class='slick-next slick-arrow typcn typcn-arrow-right-outline'></button>",
                        responsive: [
                            {
                                breakpoint: 992,
                                settings: {
                                    centerPadding: '5px',
                                    slidesToShow: 1,
                                    swipeToSlide: true,
                                    variableWidth: true,
                                },
                            },
                        ],
                    });
                    firsttime = false;
                }
                else {
                    $('#popup-robot-main').slick('refresh');
                }
            });
        });
    }
    exports.init = init;
    function initMenu() {
        // fill dropdown menu robot
        $('#startupVersion').text(GUISTATE_C.getServerVersion());
        var robots = GUISTATE_C.getRobots();
        var proto = $('.robotType');
        var length = Object.keys(robots).length;
        for (var i = 0; i < length; i++) {
            if (robots[i].name == 'sim') {
                proto.attr('data-type', GUISTATE_C.getDefaultRobot());
                i++;
            }
            var clone = proto.clone();
            var robotName = robots[i].name;
            var robotGroup = robots[i].group;
            clone.find('.typcn').addClass('typcn-' + robotGroup);
            clone.find('.typcn').html(robots[i].realName);
            clone.find('.typcn').attr('id', 'menu-' + robotName);
            clone.attr('data-type', robotName);
            clone.addClass(robotName);
            $('#navigation-robot>.anchor').before(clone);
        }
        proto.remove();
        // fill start popup
        proto = $('#popup-sim');
        var groupsDict = {};
        var addPair = function (key, value) {
            if (typeof groupsDict[key] != 'undefined') {
                groupsDict[key].push(value);
            }
            else {
                groupsDict[key] = [value];
            }
        };
        var giveValue = function (key) {
            return groupsDict[key];
        };
        /**
         * This method either changes or removes the info link for further
         * information to the buttons in the carousel/group member view
         */
        var addInfoLink = function (clone, robotName) {
            var robotInfoDE = GUISTATE_C.getRobotInfoDE(robotName);
            var robotInfoEN = GUISTATE_C.getRobotInfoEN(robotName);
            if (robotInfoDE !== '#' || robotInfoEN !== '#') {
                var $de = clone.find('a');
                var $en = $de.clone();
                if (robotInfoDE === '#') {
                    robotInfoDE = robotInfoEN;
                }
                if (robotInfoEN === '#') {
                    robotInfoEN = robotInfoDE;
                }
                $de.attr({
                    onclick: 'window.open("' + robotInfoDE + '");return false;',
                    class: 'DE',
                });
                $en.attr({
                    onclick: 'window.open("' + robotInfoEN + '");return false;',
                    class: 'EN',
                });
                $en.appendTo(clone);
            }
            else {
                clone.find('a').remove();
            }
            return clone;
        };
        for (var i = 0; i < length; i++) {
            if (robots[i].name == 'sim') {
                i++;
                // TODO check this hardcoded Open Roberta Sim again (maybe some day there is a better choice for us)
                proto.attr('data-type', GUISTATE_C.getDefaultRobot());
            }
            addPair(robots[i].group, robots[i].name);
        }
        for (var key in groupsDict) {
            if (groupsDict.hasOwnProperty(key)) {
                if (groupsDict[key].length == 1 || key === 'calliope') {
                    //this means that a robot has no subgroup
                    var robotName = key; // robot name is the same as robot group
                    var clone = proto.clone().prop('id', 'menu-' + robotName);
                    clone.find('span:eq( 0 )').removeClass('typcn-open');
                    clone.find('span:eq( 0 )').addClass('typcn-' + robotName);
                    if (key === 'calliope') {
                        robotName = 'calliope2017NoBlue';
                    }
                    clone.find('span:eq( 1 )').html(GUISTATE_C.getMenuRobotRealName(robotName));
                    clone.attr('data-type', robotName);
                    addInfoLink(clone, robotName);
                    if (!GUISTATE_C.getIsRobotBeta(robotName)) {
                        clone.find('img.img-beta').css('visibility', 'hidden');
                    }
                    $('#popup-robot-main').append(clone);
                }
                else {
                    // till the next for loop we create groups for robots
                    var robotGroup = key;
                    var clone = proto.clone().prop('id', 'menu-' + robotGroup);
                    clone.attr('data-type', robotGroup);
                    if (robotGroup == 'arduino') {
                        clone.find('span:eq( 1 )').html('Nepo4Arduino');
                    }
                    else {
                        clone.find('span:eq( 1 )').html(robotGroup.charAt(0).toUpperCase() + robotGroup.slice(1)); // we have no real name for group
                    }
                    clone.find('span:eq( 0 )').removeClass('typcn-open');
                    clone.find('span:eq( 0 )').addClass('typcn-' + robotGroup); // so we just capitalize the first letter + add typicon
                    clone.find('img.img-beta').css('visibility', 'hidden'); // groups do not have 'beta' labels
                    addInfoLink(clone, robotGroup); // this will just kill the link tag, because no description for group
                    clone.attr('data-group', true);
                    $('#popup-robot-main').append(clone);
                    for (var i = 0; i < groupsDict[key].length; i++) {
                        // and here we put robots in subgroups
                        var robotName = groupsDict[key][i];
                        var clone = proto.clone().prop('id', 'menu-' + robotName);
                        clone.addClass('hidden');
                        clone.addClass('robotSubGroup');
                        clone.addClass(robotGroup);
                        if (!GUISTATE_C.getIsRobotBeta(robotName)) {
                            clone.find('img.img-beta').css('visibility', 'hidden');
                        }
                        addInfoLink(clone, robotName);
                        clone.attr('data-type', robotName);
                        clone.find('span:eq( 0 )').removeClass('typcn-open');
                        clone.find('span:eq( 0 )').addClass('img-' + robotName); // there are no typicons for robots
                        clone.find('span:eq( 1 )').html(GUISTATE_C.getMenuRobotRealName(robotName)); // instead we use images
                        clone.attr('data-type', robotName);
                        $('#popup-robot-subgroup').append(clone);
                    }
                }
            }
        }
        proto.find('.img-beta').css('visibility', 'hidden');
        proto.find('a[href]').css('visibility', 'hidden');
        $('#show-startup-message>.modal-body').append('<input type="button" class="btn backButton hidden" data-dismiss="modal" lkey="Blockly.Msg.POPUP_CANCEL"></input>');
        if (GUISTATE_C.getLanguage() === 'de') {
            $('.popup-robot .EN').css('display', 'none');
            $('.popup-robot .DE').css('display', 'inline');
        }
        else {
            $('.popup-robot .DE').css('display', 'none');
            $('.popup-robot .EN').css('display', 'inline');
        }
        GUISTATE_C.setInitialState();
    }
    /**
     * Initialize the navigation bar in the head of the page
     */
    function initMenuEvents() {
        // TODO check if this prevents iPads and iPhones to only react on double clicks
        if (!navigator.userAgent.match(/iPad/i) && !navigator.userAgent.match(/iPhone/i)) {
            $('[rel="tooltip"]').not('.rightMenuButton').tooltip({
                container: 'body',
                placement: 'right',
            });
            $('[rel="tooltip"].rightMenuButton').tooltip({
                container: 'body',
                placement: 'left',
            });
        }
        // prevent Safari 10. from zooming
        document.addEventListener('gesturestart', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
        $('.modal').onWrap('shown.bs.modal', function () {
            $(this).find('[autofocus]').focus();
        });
        $('#navbarCollapse').collapse({
            toggle: false,
        });
        $('#navbarCollapse').on('click', '.dropdown-menu a,.visible-xs', function (event) {
            $('#navbarCollapse').collapse('hide');
        });
        // for gallery
        $('#head-navigation-gallery').on('click', 'a,.visible-xs', function (event) {
            $('#navbarCollapse').collapse('hide');
        });
        if (GUISTATE_C.isPublicServerVersion()) {
            var feedbackButton = '<div href="#" id="feedbackButton" class="rightMenuButton" rel="tooltip" data-original-title="" title="">' +
                '<span id="" class="feedbackButton typcn typcn-feedback"></span>' +
                '</div>';
            $('#rightMenuDiv').append(feedbackButton);
            window.onmessage = function (msg) {
                if (msg.data === 'closeFeedback') {
                    $('#feedbackIframe').oneWrap('load', function () {
                        setTimeout(function () {
                            $('#feedbackIframe').attr('src', 'about:blank');
                            $('#feedbackModal').modal('hide');
                        }, 1000);
                    });
                }
                else if (msg.data.indexOf('feedbackHeight') >= 0) {
                    var height = msg.data.split(':')[1] || 400;
                    $('#feedbackIframe').height(height);
                }
            };
            $('#feedbackButton').on('click', '', function (event) {
                $('#feedbackModal').on('show.bs.modal', function () {
                    if (GUISTATE_C.getLanguage().toLowerCase() === 'de') {
                        $('#feedbackIframe').attr('src', 'https://www.roberta-home.de/lab/feedback/');
                    }
                    else {
                        $('#feedbackIframe').attr('src', 'https://www.roberta-home.de/en/lab/feedback/');
                    }
                });
                $('#feedbackModal').modal({ show: true });
            });
        }
        // EDIT Menu  --- don't use onWrap here, because the export xml target must be enabled always
        $('#head-navigation-program-edit').on('click', '.dropdown-menu li:not(.disabled) a', function (event) {
            var fn = function (event) {
                var targetId = event.target.id ||
                    (event.target.children[0] && event.target.children[0].id) ||
                    (event.target.previousSibling && event.target.previousSibling.id);
                switch (targetId) {
                    case 'menuRunProg':
                        RUN_C.runOnBrick();
                        break;
                    case 'menuRunSim':
                        $('#simButton').clickWrap();
                        break;
                    case 'menuCheckProg':
                        PROGRAM_C.checkProgram();
                        break;
                    case 'menuNewProg':
                        PROGRAM_C.newProgram();
                        break;
                    case 'menuListProg':
                        $('#tabProgList').data('type', 'userProgram');
                        $('#tabProgList').clickWrap();
                        break;
                    case 'menuListExamples':
                        $('#tabProgList').data('type', 'exampleProgram');
                        $('#tabProgList').clickWrap();
                        break;
                    case 'menuSaveProg':
                        PROGRAM_C.saveToServer();
                        break;
                    case 'menuSaveAsProg':
                        PROGRAM_C.showSaveAsModal();
                        break;
                    case 'menuShowCode':
                        $('#codeButton').clickWrap();
                        break;
                    case 'menuSourceCodeEditor':
                        SOURCECODE_C.clickSourceCodeEditor();
                        break;
                    case 'menuImportProg':
                        IMPORT_C.importXml();
                        break;
                    case 'menuExportProg':
                        PROGRAM_C.exportXml();
                        break;
                    case 'menuExportAllProgs':
                        PROGRAM_C.exportAllXml();
                        break;
                    case 'menuLinkProg':
                        PROGRAM_C.linkProgram();
                        break;
                    case 'menuToolboxBeginner':
                        $('.levelTabs a[href="#beginner"]').tabWrapShow();
                        break;
                    case 'menuToolboxExpert':
                        $('.levelTabs a[href="#expert"]').tabWrapShow();
                        break;
                    case 'menuRunMulipleSim':
                        MULT_SIM.showListProg();
                        break;
                    case 'menuDefaultFirmware':
                        RUN_C.reset2DefaultFirmware();
                        break;
                    default:
                        break;
                }
            };
            WRAP.wrapUI(fn, 'edit menu click')(event);
        });
        // CONF Menu
        $('#head-navigation-configuration-edit').onWrap('click', '.dropdown-menu li:not(.disabled) a', function (event) {
            $('.modal').modal('hide'); // close all opened popups
            switch (event.target.id) {
                case 'menuCheckConfig':
                    MSG.displayMessage('MESSAGE_NOT_AVAILABLE', 'POPUP', '');
                    break;
                case 'menuNewConfig':
                    CONFIGURATION_C.newConfiguration();
                    break;
                case 'menuListConfig':
                    $('#tabConfList').clickWrap();
                    break;
                case 'menuSaveConfig':
                    CONFIGURATION_C.saveToServer();
                    break;
                case 'menuSaveAsConfig':
                    CONFIGURATION_C.showSaveAsModal();
                    break;
                default:
                    break;
            }
        }, 'configuration edit clicked');
        // ROBOT Menu
        $('#head-navigation-robot').onWrap('click', '.dropdown-menu li:not(.disabled) a', function (event) {
            $('.modal').modal('hide');
            var choosenRobotType = event.target.parentElement.dataset.type;
            //TODO: change from ardu to botnroll and mbot with friends
            //I guess it is changed now, check downstairs at menuConnect
            if (choosenRobotType) {
                ROBOT_C.switchRobot(choosenRobotType);
            }
            else {
                var domId = event.target.id;
                if (domId === 'menuConnect') {
                    //console.log(GUISTATE_C.getIsAgent());
                    //console.log(GUISTATE_C.getConnection());
                    if (GUISTATE_C.getConnection() == 'arduinoAgent' ||
                        (GUISTATE_C.getConnection() == 'arduinoAgentOrToken' && GUISTATE_C.getIsAgent() == true)) {
                        var ports = SOCKET_C.getPortList();
                        var robots = SOCKET_C.getRobotList();
                        $('#singleModalListInput').empty();
                        var i_1 = 0;
                        ports.forEach(function (port) {
                            $('#singleModalListInput').append('<option value="' + port + '" selected>' + robots[i_1] + ' ' + port + '</option>');
                            i_1++;
                        });
                        ROBOT_C.showListModal();
                    }
                    else if (GUISTATE_C.getConnection() == 'webview') {
                        ROBOT_C.showScanModal();
                    }
                    else {
                        $('#buttonCancelFirmwareUpdate').css('display', 'inline');
                        $('#buttonCancelFirmwareUpdateAndRun').css('display', 'none');
                        ROBOT_C.showSetTokenModal();
                    }
                }
                else if (domId === 'menuRobotInfo') {
                    ROBOT_C.showRobotInfo();
                }
                else if (domId === 'menuWlan') {
                    ROBOT_C.showWlanForm();
                }
            }
        }, 'robot clicked');
        $('#head-navigation-help').onWrap('click', '.dropdown-menu li:not(.disabled) a', function (event) {
            $('.modal').modal('hide'); // close all opened popups
            var domId = event.target.id;
            if (domId === 'menuShowStart') {
                // Submenu 'Help'
                $('#show-startup-message').modal('show');
            }
            else if (domId === 'menuAbout') {
                // Submenu 'Help'
                $('#version').text(GUISTATE_C.getServerVersion());
                $('#show-about').modal('show');
            }
            else if (domId === 'menuLogging') {
                // Submenu 'Help'
                $('#tabLogList').clickWrap();
            }
        }, 'help clicked');
        $('#head-navigation-user').onWrap('click', '.dropdown-menu li:not(.disabled) a', function (event) {
            $('.modal').modal('hide'); // close all opened popups
            switch (event.target.id) {
                case 'menuLogin':
                    USER_C.showLoginForm();
                    break;
                case 'menuUserGroupLogin':
                    USER_C.showUserGroupLoginForm();
                    break;
                case 'menuLogout':
                    USER_C.logout();
                    break;
                case 'menuGroupPanel':
                    USERGROUP_C.showPanel();
                    break;
                case 'menuChangeUser':
                    USER_C.showUserDataForm();
                    break;
                case 'menuDeleteUser':
                    USER_C.showDeleteUserModal();
                    break;
                case 'menuStateInfo':
                    USER_C.showUserInfo();
                    break;
                case 'menuNotification':
                    NOTIFICATION_C.showNotificationModal();
                    break;
                default:
                    break;
            }
            return false;
        }, 'user clicked');
        $('#head-navigation-gallery').onWrap('click', function (event) {
            $('#tabGalleryList').clickWrap();
            return false;
        }, 'gallery clicked');
        $('#head-navigation-tutorial').onWrap('click', function (event) {
            $('#tabTutorialList').clickWrap();
            return false;
        }, 'tutorial clicked');
        $('#menuTabProgram').onWrap('click', '', function (event) {
            if ($('#tabSimulation').hasClass('tabClicked')) {
                $('.scroller-left').clickWrap();
            }
            $('.scroller-left').clickWrap();
            $('#tabProgram').clickWrap();
        }, 'tabProgram clicked');
        $('#menuTabConfiguration').onWrap('click', '', function (event) {
            if ($('#tabProgram').hasClass('tabClicked')) {
                $('.scroller-right').clickWrap();
            }
            else if ($('#tabConfiguration').hasClass('tabClicked')) {
                $('.scroller-right').clickWrap();
            }
            $('#tabConfiguration').clickWrap();
        }, 'tabConfiguration clicked');
        // Close submenu on mouseleave
        $('.navbar-fixed-top').on('mouseleave', function (event) {
            $('.navbar-fixed-top .dropdown').removeClass('open');
        });
        $('#img-nepo').onWrap('click', function () {
            $('#show-startup-message').modal('show');
        }, 'logo was clicked');
        $('.menuGeneral').onWrap('click', function (event) {
            window.open('https://jira.iais.fraunhofer.de/wiki/display/ORInfo');
        }, 'head navigation menu item general clicked');
        $('.menuFaq').onWrap('click', function (event) {
            window.open('https://jira.iais.fraunhofer.de/wiki/display/ORInfo/FAQ');
        }, 'head navigation menu item faq clicked');
        $('.shortcut').onWrap('click', function (event) {
            window.open('https://jira.iais.fraunhofer.de/wiki/display/ORInfo/FAQ');
        }, 'head navigation menu item faq (shortcut) clicked');
        $('.menuAboutProject').onWrap('click', function (event) {
            if (GUISTATE_C.getLanguage() == 'de') {
                window.open('https://www.roberta-home.de/index.php?id=135');
            }
            else {
                window.open('https://www.roberta-home.de/index.php?id=135&L=1');
            }
        }, 'head navigation menu item about clicked');
        $('#startPopupBack').on('click', function (event) {
            $('#popup-robot-main').removeClass('hidden', 1000);
            $('.popup-robot.robotSubGroup').addClass('hidden', 1000);
            $('.robotSpecial').removeClass('robotSpecial');
            $('#startPopupBack').addClass('hidden');
            $('#popup-robot-main').slick('refresh');
        });
        var mousex = 0;
        var mousey = 0;
        $('.popup-robot').on('mousedown', function (event) {
            mousex = event.clientX;
            mousey = event.clientY;
        });
        $('.popup-robot').onWrap('click', function (event) {
            if (Math.abs(event.clientX - mousex) >= 3 || Math.abs(event.clientY - mousey) >= 3) {
                return;
            }
            event.preventDefault();
            $('#startPopupBack').clickWrap();
            var choosenRobotType = event.target.dataset.type || event.currentTarget.dataset.type;
            var choosenRobotGroup = event.target.dataset.group || event.currentTarget.dataset.group;
            if (event.target.className.indexOf('info') >= 0) {
                var win = window.open(GUISTATE_C.getRobots()[choosenRobotType].info, '_blank');
            }
            else {
                if (choosenRobotType) {
                    if (choosenRobotGroup) {
                        $('#popup-robot-main').addClass('hidden');
                        $('.popup-robot.' + choosenRobotType).removeClass('hidden');
                        $('.popup-robot.' + choosenRobotType).addClass('robotSpecial');
                        $('#startPopupBack').removeClass('hidden');
                        return;
                    }
                    else {
                        if ($('#checkbox_id').is(':checked')) {
                            cleanUri(); // removes # which may potentially be added by other operations
                            var uri = window.location.toString();
                            uri += QUERY_START + LOAD_SYSTEM_CALL + QUERY_ASSIGNMENT + choosenRobotType;
                            window.history.replaceState({}, document.title, uri);
                            $('#show-message').oneWrap('hidden.bs.modal', function (e) {
                                e.preventDefault();
                                cleanUri();
                                ROBOT_C.switchRobot(choosenRobotType, true);
                            });
                            MSG.displayMessage('POPUP_CREATE_BOOKMARK', 'POPUP', '');
                        }
                        else {
                            ROBOT_C.switchRobot(choosenRobotType, true);
                        }
                    }
                }
                $('#show-startup-message').modal('hide');
            }
        }, 'robot choosen in start popup');
        $('#moreReleases').onWrap('click', function (event) {
            $('#oldReleases').show({
                start: function () {
                    $('#moreReleases').addClass('hidden');
                },
            });
        }, 'show more releases clicked');
        $('#takeATour').onWrap('click', function (event) {
            if (GUISTATE_C.getView() !== 'tabProgram') {
                $('#tabProgram').clickWrap();
            }
            if (GUISTATE_C.getRobotGroup() !== 'ev3') {
                ROBOT_C.switchRobot('ev3lejosv1', true);
            }
            if (GUISTATE_C.getProgramToolboxLevel() !== 'beginner') {
                $('#beginner').clickWrap();
            }
            PROGRAM_C.newProgram(true);
            TOUR_C.start('welcome');
        }, 'take a tour clicked');
        $('#goToWiki').onWrap('click', function (event) {
            event.preventDefault();
            window.open('https://jira.iais.fraunhofer.de/wiki/display/ORInfo', '_blank');
            event.stopPropagation();
            $('#show-startup-message').modal('show');
        }, 'go to wiki clicked');
        // init popup events
        $('.cancelPopup').onWrap('click', function () {
            $('.ui-dialog-titlebar-close').clickWrap();
        }, 'cancel popup clicked');
        $('#about-join').onWrap('click', function () {
            $('#show-about').modal('hide');
        }, 'hide show about clicked');
        $(window).on('beforeunload', function (e) {
            return Blockly.Msg.POPUP_BEFOREUNLOAD;
            // the following code doesn't work anymore, TODO check for a better solution.
            //            if (!GUISTATE_C.isProgramSaved || !GUISTATE_C.isConfigurationSaved) {
            //                if (GUISTATE_C.isUserLoggedIn()) {
            //                    // Maybe a Firefox-Problem?                alert(Blockly.Msg['POPUP_BEFOREUNLOAD_LOGGEDIN']);
            //                    return Blockly.Msg.POPUP_BEFOREUNLOAD_LOGGEDIN;
            //                } else {
            //                    // Maybe a Firefox-Problem?                alert(Blockly.Msg['POPUP_BEFOREUNLOAD']);
            //                    return Blockly.Msg.POPUP_BEFOREUNLOAD;
            //                }
            //            }
        });
        // help Bootstrap to calculate the correct size for the collapse element when the screen height is smaller than the elements height.
        $('#navbarCollapse').on('shown.bs.collapse', function () {
            var newHeight = Math.min($(this).height(), Math.max($('#blockly').height(), $('#brickly').height()));
            $(this).css('height', newHeight);
        });
        $(document).onWrap('keydown', function (e) {
            if (GUISTATE_C.getView() != 'tabProgram') {
                return;
            }
            //Overriding the Ctrl + 1 for importing sourcecode
            if ((e.metaKey || e.ctrlKey) && e.which == 49) {
                e.preventDefault();
                IMPORT_C.importSourceCodeToCompile();
                return false;
            }
            //Overriding the Ctrl + 2 for creating a debug block
            if ((e.metaKey || e.ctrlKey) && e.which == 50) {
                e.preventDefault();
                var debug = GUISTATE_C.getBlocklyWorkspace().newBlock('robActions_debug');
                debug.initSvg();
                debug.render();
                debug.setInTask(false);
                return false;
            }
            //Overriding the Ctrl + 3 for creating a assertion + compare block
            if ((e.metaKey || e.ctrlKey) && e.which == 51) {
                e.preventDefault();
                var assert = GUISTATE_C.getBlocklyWorkspace().newBlock('robActions_assert');
                assert.initSvg();
                assert.setInTask(false);
                assert.render();
                var logComp = GUISTATE_C.getBlocklyWorkspace().newBlock('logic_compare');
                logComp.initSvg();
                logComp.setMovable(false);
                logComp.setInTask(false);
                logComp.setDeletable(false);
                logComp.render();
                var parentConnection = assert.getInput('OUT').connection;
                var childConnection = logComp.outputConnection;
                parentConnection.connect(childConnection);
                return false;
            }
            //Overriding the Ctrl + 4 for creating evaluate-expression block
            if ((e.metaKey || e.ctrlKey) && e.which == 52) {
                e.preventDefault();
                var expr = GUISTATE_C.getBlocklyWorkspace().newBlock('robActions_eval_expr');
                expr.initSvg();
                expr.render();
                expr.setInTask(false);
                return false;
            }
            //Overriding the Ctrl + 5 for creating nnStep block
            if ((e.metaKey || e.ctrlKey) && e.which == 53) {
                e.preventDefault();
                var expr = GUISTATE_C.getBlocklyWorkspace().newBlock('robActions_nnstep');
                expr.initSvg();
                expr.render();
                expr.setInTask(false);
                return false;
            }
            //Overriding the Ctrl + S for saving the program in the database on the server
            if ((e.metaKey || e.ctrlKey) && e.which == 83) {
                e.preventDefault();
                if (GUISTATE_C.isUserLoggedIn()) {
                    if (GUISTATE_C.getProgramName() === 'NEPOprog' || e.shiftKey) {
                        PROGRAM_C.showSaveAsModal();
                    }
                    else if (!GUISTATE_C.isProgramSaved()) {
                        PROGRAM_C.saveToServer();
                    }
                }
                else {
                    MSG.displayMessage('ORA_PROGRAM_GET_ONE_ERROR_NOT_LOGGED_IN', 'POPUP', '');
                }
            }
            //Overriding the Ctrl + R for running the program
            if ((e.metaKey || e.ctrlKey) && e.which == 82) {
                e.preventDefault();
                if (GUISTATE_C.isRunEnabled()) {
                    RUN_C.runOnBrick();
                }
            }
            //Overriding the Ctrl + M for viewing all programs
            if ((e.metaKey || e.ctrlKey) && e.which == 77) {
                e.preventDefault();
                if (GUISTATE_C.isUserLoggedIn()) {
                    $('#tabProgList').data('type', 'userProgram');
                    $('#tabProgList').clickWrap();
                }
                else {
                    MSG.displayMessage('ORA_PROGRAM_GET_ONE_ERROR_NOT_LOGGED_IN', 'POPUP', '');
                }
            }
            //Overriding the Ctrl + I for importing NEPO Xml
            if ((e.metaKey || e.ctrlKey) && e.which == 73) {
                e.preventDefault();
                IMPORT_C.importXml();
                return false;
            }
            //Overriding the Ctrl + E for exporting the NEPO code
            if ((e.metaKey || e.ctrlKey) && e.which == 69) {
                e.preventDefault();
                PROGRAM_C.exportXml();
                return false;
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvbWVudS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQTRCQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFVixJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUM7SUFDeEIsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDO0lBQzVCLElBQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0lBQzdCLElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLElBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUM1QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7SUFFdEIsU0FBUyxRQUFRO1FBQ2IsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELHVJQUF1STtJQUN2SSxTQUFTLGVBQWUsQ0FBQyxNQUFNO1FBQzNCLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFDOUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQy9DLGNBQWMsRUFDZCxDQUFDLENBQUM7UUFFTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFF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