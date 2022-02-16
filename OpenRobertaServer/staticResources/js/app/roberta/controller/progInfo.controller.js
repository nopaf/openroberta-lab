define(["require", "exports", "guiState.controller", "blockly", "jquery", "jquery-validate", "jquery-hotkeys", "bootstrap-tagsinput", "bootstrap.wysiwyg"], function (require, exports, GUISTATE_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    var INITIAL_WIDTH = 0.3;
    var blocklyWorkspace;
    /**
     *
     */
    function init() {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        initView();
        initEvents();
    }
    exports.init = init;
    function initView() {
        $('#infoContent').wysiwyg();
        $('#infoTags').tagsinput('removeAll');
        $('#infoContent').attr('data-placeholder', Blockly.Msg.INFO_DOCUMENTATION_HINT || 'Document your program here ...');
        $('.bootstrap-tagsinput input').attr('placeholder', Blockly.Msg.INFO_TAGS || 'Tags');
    }
    function initEvents() {
        $('#infoButton').off('click touchend');
        $('#infoButton').onWrap('click touchend', function (event) {
            toggleInfo();
            return false;
        });
        $(window).on('resize', function (e) {
            if ($('#infoDiv').hasClass('rightActive')) {
                $('#infoContainer').css({
                    width: $('#infoDiv').outerWidth(),
                    height: $('#infoDiv').outerHeight() - $('.btn-toolbar.editor').outerHeight() - 57,
                });
            }
        });
        $('#infoContent, #infoTags').on('change', function () {
            // TODO: here should be an onWrap. But this change is called during a run of another wrapped callback
            blocklyWorkspace.description = $('#infoContent').html();
            blocklyWorkspace.tags = $('#infoTags').val();
            if (GUISTATE_C.isProgramSaved()) {
                GUISTATE_C.setProgramSaved(false);
            }
            if (typeof $('#infoContent').html() === 'string' && $('#infoContent').html().length) {
                $('#infoButton').addClass('notEmpty');
            }
            else {
                $('#infoButton').removeClass('notEmpty');
            }
        });
        // prevent to copy eg ms word formatting!
        $('[contenteditable]#infoContent').onWrap('paste', function (e) {
            e.preventDefault();
            var text = '';
            if (e.clipboardData || e.originalEvent.clipboardData) {
                text = (e.originalEvent || e).clipboardData.getData('text/plain');
            }
            else if (window.clipboardData) {
                text = window.clipboardData.getData('Text');
            }
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, text);
            }
            else {
                document.execCommand('paste', false, text);
            }
            $('#infoContent').trigger('change');
        });
    }
    function toggleInfo() {
        Blockly.hideChaff();
        if ($('#infoButton').hasClass('rightActive')) {
            $('#blockly').closeRightView();
        }
        else {
            $('#infoContent').html(blocklyWorkspace.description);
            $('.bootstrap-tagsinput input').attr('placeholder', Blockly.Msg.INFO_TAGS || 'Tags');
            $('#infoTags').tagsinput('add', blocklyWorkspace.tags);
            $('#blockly').openRightView('info', INITIAL_WIDTH);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ0luZm8uY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL3Byb2dJbmZvLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0lBQzFCLElBQUksZ0JBQWdCLENBQUM7SUFDckI7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNwRCxRQUFRLEVBQUUsQ0FBQztRQUNYLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFDUSxvQkFBSTtJQUViLFNBQVMsUUFBUTtRQUNiLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsSUFBSSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3BILENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVELFNBQVMsVUFBVTtRQUNmLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsS0FBSztZQUNyRCxVQUFVLEVBQUUsQ0FBQztZQUNiLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ0gs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