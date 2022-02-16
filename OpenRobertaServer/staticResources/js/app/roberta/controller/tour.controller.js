define(["require", "exports", "blockly", "jquery", "jquery-scrollto", "enjoyHint"], function (require, exports, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInstance = exports.start = void 0;
    var enjoyhint_instance;
    var touchEvent;
    function is_touch_device() {
        try {
            document.createEvent('TouchEvent');
            return 'click touchend';
        }
        catch (e) {
            return 'click';
        }
    }
    function start(tour) {
        enjoyhint_instance = new EnjoyHint({
            onSkip: function () {
                Blockly.mainWorkspace.clear();
                enjoyhint_instance = {};
                $('#tabProgram').clickWrap();
                if ($('.rightMenuButton.rightActive')) {
                    $('.rightMenuButton.rightActive').clickWrap();
                }
                $('#show-startup-message').modal('show');
            },
            onEnd: function () {
                Blockly.mainWorkspace.clear();
                enjoyhint_instance = {};
                $('#tabProgram').clickWrap();
                if ($('.rightMenuButton.rightActive')) {
                    $('.rightMenuButton.rightActive').clickWrap();
                }
                setTimeout(function () {
                    $('#show-startup-message').modal('show');
                }, 1000);
            },
        });
        var enjoyhint_script_steps = [{}];
        switch (tour) {
            case 'welcome':
                for (var i = 0, len = welcome.length; i < len; ++i) {
                    enjoyhint_script_steps[i] = jQuery.extend(true, {}, welcome[i]);
                }
                break;
            case 'overview':
                for (var i = 0, len = overview.length; i < len; ++i) {
                    enjoyhint_script_steps[i] = jQuery.extend(true, {}, overview[i]);
                }
                break;
            default:
                return;
        }
        // async translation
        var key, keyParts, translation;
        for (var i = 0; i < enjoyhint_script_steps.length; i++) {
            if (enjoyhint_script_steps[i].description) {
                key = enjoyhint_script_steps[i].description;
                keyParts = key.split('.');
                translation = window;
                for (var j = 0; j < keyParts.length && translation !== null; j++) {
                    translation = translation[keyParts[j]];
                }
                enjoyhint_script_steps[i].description = translation || enjoyhint_script_steps[i].description;
            }
            if (enjoyhint_script_steps[i].nextButton && enjoyhint_script_steps[i].nextButton.text) {
                key = enjoyhint_script_steps[i].nextButton.text;
                keyParts = key.split('.');
                translation = window;
                for (var j = 0; j < keyParts.length && translation !== null; j++) {
                    translation = translation[keyParts[j]];
                }
                enjoyhint_script_steps[i].nextButton.text = translation || enjoyhint_script_steps[i].nextButton.text;
            }
            if (enjoyhint_script_steps[i].skipButton && enjoyhint_script_steps[i].skipButton.text) {
                key = enjoyhint_script_steps[i].skipButton.text;
                keyParts = key.split('.');
                translation = window;
                for (var j = 0; j < keyParts.length && translation !== null; j++) {
                    translation = translation[keyParts[j]];
                }
                enjoyhint_script_steps[i].skipButton.text = translation || enjoyhint_script_steps[i].skipButton.text;
            }
        }
        enjoyhint_instance.set(enjoyhint_script_steps);
        enjoyhint_instance.run();
    }
    exports.start = start;
    function getInstance() {
        return enjoyhint_instance;
    }
    exports.getInstance = getInstance;
    var offsetLeft = $('#blockly').width() * -0.15;
    var offsetTop = $('#blockly').height() * -0.1;
    var welcome = [
        {
            event_type: 'next',
            selector: '.logo',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION01',
            top: 77,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event: 'click touchend',
            selector: '.blocklyTreeRow:eq(1)',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION10',
            showSkip: false,
        },
        {
            event: 'mousedown touchstart',
            selector: '.blocklyFlyout>g>g>g',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION12',
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '.blocklyBlockCanvas',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION12',
            bottom: -100,
            showSkip: false,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
        },
        {
            event_type: 'custom',
            event: 'startSim',
            selector: '#simButton',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION13',
            showSkip: false,
            onBeforeStart: function () {
                var blocks = Blockly.getMainWorkspace().getTopBlocks();
                if (!blocks[0].getNextBlock()) {
                    enjoyhint_instance.setCurrentStepBack();
                }
            },
        },
        {
            event: 'mousedown touchstart',
            timeout: 1000,
            selector: '#simControl',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION13a',
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '#simDiv',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION15',
            shape: 'circle',
            radius: $('#blockly').width() / 10 + $('#blockly').height() / 10,
            top: offsetTop,
            left: offsetLeft,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event: 'mousedown touchstart',
            selector: '#simButton',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION16',
            showSkip: false,
        },
    ];
    var overview = [
        {
            event_type: 'next',
            selector: '.logo',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION01',
            top: 77,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '#head-navigation',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION02',
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '#mainNavigationBar',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION03',
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event: 'click',
            selector: 'a#tabConfiguration',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION04',
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '#bricklyDiv .blocklyBlockCanvas',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION05',
            shape: 'circle',
            radius: 100,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
            onBeforeStart: function () {
                $('#tabConfiguration').clickWrap();
            },
        },
        {
            event: 'click',
            selector: 'a#tabProgram',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION06',
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '.blocklyTreeRoot',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION07',
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
            onBeforeStart: function () {
                $('#tabProgram').clickWrap();
            },
        },
        {
            event_type: 'next',
            selector: '.nav.nav-tabs.levelTabs',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION07a',
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            onBeforeStart: function () {
                Blockly.hideChaff(false);
            },
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '#blocklyDiv>svg>g>g:eq(1)',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION08',
            bottom: -100,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
            onBeforeStart: function () {
                $('#beginner').clickWrap();
            },
        },
        {
            event_type: 'next',
            selector: '.blocklyButtons:eq(1)',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION09',
            right: -50,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event: 'click touchend',
            selector: '.blocklyTreeRow:eq(1)',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION10',
            showSkip: false,
        },
        {
            event: 'mousedown touchstart',
            selector: '.blocklyFlyout>g>g>g',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION12',
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '.blocklyBlockCanvas',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION12',
            bottom: -100,
            showSkip: false,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
        },
        {
            event_type: 'custom',
            event: 'startSim',
            selector: '#simButton',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION13',
            showSkip: false,
            onBeforeStart: function () {
                var blocks = Blockly.getMainWorkspace().getTopBlocks();
                if (!blocks[0].getNextBlock()) {
                    enjoyhint_instance.setCurrentStepBack();
                }
            },
        },
        {
            event: 'mousedown touchstart',
            timeout: 1000,
            selector: '#simControl',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION13a',
            showSkip: false,
        },
        {
            event_type: 'next',
            selector: '#simDiv',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION15',
            shape: 'circle',
            radius: $('#blockly').width() / 10 + $('#blockly').height() / 10,
            top: offsetTop,
            left: offsetLeft,
            nextButton: {
                text: 'Blockly.Msg.TOUR1_DESCRIPTION00',
            },
            showSkip: false,
        },
        {
            event: 'mousedown touchstart',
            selector: '#simButton',
            description: 'Blockly.Msg.TOUR1_DESCRIPTION16',
            showSkip: false,
        },
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG91ci5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvdG91ci5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLElBQUksa0JBQWtCLENBQUM7SUFDdkIsSUFBSSxVQUFVLENBQUM7SUFFZixTQUFTLGVBQWU7UUFDcEIsSUFBSTtZQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkMsT0FBTyxnQkFBZ0IsQ0FBQztTQUMzQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxPQUFPLENBQUM7U0FDbEI7SUFDTCxDQUFDO0lBRUQsU0FBUyxLQUFLLENBQUMsSUFBSTtRQUNmLGtCQUFrQixHQUFHLElBQUksU0FBUyxDQUFDO1lBQy9CLE1BQU0sRUFBRTtnQkFDSixPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM5QixrQkFBa0IsR0FBRyxFQUFFLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLENBQUMsOEJBQThCLENBQUMsRUFBRTtvQkFDbkMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQ2pEO2dCQUNELENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzlCLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO29CQUNu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