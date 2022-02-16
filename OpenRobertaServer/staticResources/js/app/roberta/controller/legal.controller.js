define(["require", "exports", "log", "guiState.controller", "blockly", "jquery", "jquery-validate"], function (require, exports, LOG, GUISTATE_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadLegalTexts = exports.initView = exports.init = void 0;
    var INITIAL_WIDTH = 0.5;
    /**
     * The blocklyWorkspace is used to
     */
    var blocklyWorkspace, $legalButton, $legalDiv, $legalHeader, storages = {}, links = {}, 
    /**
     * The fileStorage is used to store the loaded legal texts, so that even if the internet is lost and the legal texts
     * have to be loaded, the texts are available.
     *
     * fileStorage: {
     *     documentType: {
     *         languageKey: String fileContent
     *     }
     * }
     */
    fileStorage = {};
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
        $legalDiv = $('#legalDiv');
        $legalButton = $('#legalButton');
        $legalHeader = $legalDiv.children('#legalDivHeader');
        var imprintDocumentType = 'imprint_', $imprintStorage = $legalDiv.children('#legalDivImprint'), $imprintLink = $legalHeader.children('[data-href="#legalDivImprint"]'), privacyPolicyDocumentType = 'privacy_policy_', $privacyPolicyStorage = $legalDiv.children('#legalDivPrivacyPolicy'), $privacyPolicyLink = $legalHeader.children('[data-href="#legalDivPrivacyPolicy"]'), termsOfUseDocumentType = 'terms_of_use_', $termsOfUseStorage = $legalDiv.children('#legalDivTermsOfUse'), $termsOfUseLink = $legalHeader.children('[data-href="#legalDivTermsOfUse"]');
        storages[imprintDocumentType] = $imprintStorage;
        storages[privacyPolicyDocumentType] = $privacyPolicyStorage;
        storages[termsOfUseDocumentType] = $termsOfUseStorage;
        links[imprintDocumentType] = $imprintLink;
        links[privacyPolicyDocumentType] = $privacyPolicyLink;
        links[termsOfUseDocumentType] = $termsOfUseLink;
        loadLegalTexts();
    }
    exports.initView = initView;
    function initEvents() {
        var setScrollEventForDocumentType = function (documentType) {
            var $link = links[documentType], $storage = storages[documentType];
            if ($storage && $link) {
                $link.onWrap('click touchend', function (evt) {
                    evt.preventDefault();
                    $legalDiv.animate({
                        scrollTop: $storage.offset().top - 92,
                    }, 'slow');
                });
            }
        };
        $legalButton.off('click touchend');
        $legalButton.onWrap('click touchend', function (event) {
            event.preventDefault();
            toggleLegal();
        });
        for (documentType in links) {
            if (links.hasOwnProperty(documentType)) {
                setScrollEventForDocumentType(documentType);
            }
        }
    }
    function loadLegalTexts() {
        var language = GUISTATE_C.getLanguage().toLowerCase(), legalTextsMap = GUISTATE_C.getLegalTextsMap(), loadFile = function (documentType, language) {
            var $storage = storages[documentType], $link = links[documentType], content = legalTextsMap[documentType + language + '.html'] || legalTextsMap[documentType + 'en.html'] || legalTextsMap[documentType + 'de.html'];
            if ($storage) {
                $storage.children().remove();
                if (content) {
                    $storage.append($(content));
                    $link.show();
                }
                else {
                    $link.hide();
                }
            }
        };
        for (documentType in storages) {
            if (storages.hasOwnProperty(documentType)) {
                loadFile(documentType, language);
            }
        }
        if ($legalHeader.children().filter(function () {
            return $(this).css('display') !== 'none';
        }).length === 0) {
            $legalButton.hide();
        }
        else {
            $legalButton.show();
        }
    }
    exports.loadLegalTexts = loadLegalTexts;
    function toggleLegal() {
        Blockly.hideChaff();
        if ($('#legalButton').hasClass('rightActive')) {
            $('#blockly').closeRightView();
        }
        else {
            LOG.info('legal view opened');
            $legalDiv.animate({
                scrollTop: 0,
            }, 'fast');
            $('#blockly').openRightView('legal', INITIAL_WIDTH);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnYWwuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL2xlZ2FsLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0lBRTFCOztPQUVHO0lBQ0gsSUFBSSxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFNBQVMsRUFDVCxZQUFZLEVBQ1osUUFBUSxHQUFHLEVBQUUsRUFDYixLQUFLLEdBQUcsRUFBRTtJQUNWOzs7Ozs7Ozs7T0FTRztJQUNILFdBQVcsR0FBRyxFQUFFLENBQUM7SUFFckI7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNwRCxRQUFRLEVBQUUsQ0FBQztRQUNYLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUE4RlEsb0JBQUk7SUE1RmIsU0FBUyxRQUFRO1FBQ2IsU0FBUyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzQixZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pDLFlBQVksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFckQsSUFBSSxtQkFBbUIsR0FBRyxVQUFVLEVBQ2hDLGVBQWUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEVBQ3hELFlBQVksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxDQUFDLEVBQ3RFLHlCQUF5QixHQUFHLGlCQUFpQixFQUM3QyxxQkFBcUIsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLEVBQ3BFLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFDbEYsc0JBQXNCLEdB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