/**
 * Rest calls to the server related to program operations (save, delete,
 * share...)
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resetProgram = exports.likeProgram = exports.checkProgramCompatibility = exports.compileP = exports.compileN = exports.runNative = exports.runInSim = exports.runOnBrick = exports.showSourceProgram = exports.refreshList = exports.loadProgramEntity = exports.loadProgramFromListing = exports.deleteProgramFromListing = exports.deleteShare = exports.shareProgramWithGallery = exports.shareProgram = exports.exportAllProgramsXml = exports.loadProgramFromXML = exports.saveProgramToServer = exports.saveAsProgramToServer = void 0;
    /**
     * Save as program with new name to the server.
     *
     * @param programName
     *            {String} - name of the program
     * @param timestamp
     *            {Number} - when the program is saved
     * @param xmlText
     *            {String} - that represents the program
     *
     */
    function saveAsProgramToServer(programName, ownerAccount, xmlProgramText, configName, xmlConfigText, timestamp, successFn) {
        COMM.json('/program/save', {
            cmd: 'saveAs',
            programName: programName,
            ownerAccount: ownerAccount,
            progXML: xmlProgramText,
            configName: configName,
            confXML: xmlConfigText,
            timestamp: timestamp,
        }, successFn, "save program to server with new name '" + programName + "'");
    }
    exports.saveAsProgramToServer = saveAsProgramToServer;
    /**
     * Save program to the server.
     *
     * @param programName
     *            {String} - name of the program
     * @param programShared
     *            {String} - list of users with whom this program is shared
     * @param timestamp
     *            {Number} - when the program is saved
     * @param xmlText
     *            {String} - that represents the program
     *
     *
     */
    function saveProgramToServer(programName, ownerAccount, xmlProgramText, configName, xmlConfigText, timestamp, successFn) {
        COMM.json('/program/save', {
            cmd: 'save',
            programName: programName,
            ownerAccount: ownerAccount,
            progXML: xmlProgramText,
            configName: configName,
            confXML: xmlConfigText,
            timestamp: timestamp,
        }, successFn, "save program '" + programName + "' to server");
    }
    exports.saveProgramToServer = saveProgramToServer;
    /**
     * Import program from XML
     *
     * @param programName
     *            {String} - name of the program
     * @param xmlText
     *            {String} - that represents the program
     */
    function loadProgramFromXML(programName, xmlText, successFn) {
        COMM.json('/program/import', {
            programName: programName,
            progXML: xmlText,
        }, successFn, "open program '" + programName + "' from XML");
    }
    exports.loadProgramFromXML = loadProgramFromXML;
    /**
     * Downloads the programs by the current User
     * if no user is logged in this does nothing
     */
    function exportAllProgramsXml() {
        COMM.download('/program/exportAllPrograms');
    }
    exports.exportAllProgramsXml = exportAllProgramsXml;
    /**
     * Share program with another user.
     *
     * @param programName
     *            {String} - name of the program that is shared
     * @param shareWith
     *            {String} - user with whom this program is shared
     * @param right
     *            {String} - administration rights of the user
     *
     */
    function shareProgram(programName, shareObj, successFn) {
        COMM.json('/program/share', {
            cmd: 'shareP',
            programName: programName,
            shareData: shareObj,
        }, successFn, "share program '" + programName + "' with '" + shareObj.label + "'(" + shareObj.type + ") having right '" + shareObj.right + "'");
    }
    exports.shareProgram = shareProgram;
    function shareProgramWithGallery(programName, successFn) {
        COMM.json('/program/share/create', {
            cmd: 'shareWithGallery',
            programName: programName,
        }, successFn, "share program '" + programName + "' with Gallery");
    }
    exports.shareProgramWithGallery = shareProgramWithGallery;
    /**
     * Delete the sharing from another user that was selected in program list.
     *
     * @param programName
     *            {String} - name of the program
     * @param owner
     *            {String} - owner of the program
     */
    function deleteShare(programName, owner, author, successFn) {
        COMM.json('/program/share/delete', {
            cmd: 'shareDelete',
            programName: programName,
            owner: owner,
            author: author,
        }, function (result) {
            successFn(result, programName);
        }, "delete share program '" + programName + "' owner: " + owner);
    }
    exports.deleteShare = deleteShare;
    /**
     * Delete the program that was selected in program list.
     *
     * @param programName
     *            {String} - name of the program
     *
     */
    function deleteProgramFromListing(programName, author, successFn) {
        COMM.json('/program/delete', {
            programName: programName,
            author: author,
        }, function (result) {
            successFn(result, programName);
        }, "delete program '" + programName + "'");
    }
    exports.deleteProgramFromListing = deleteProgramFromListing;
    /**
     * Load the program that was selected in program list
     *
     * @param programName
     *            {String} - name of the program
     * @param ownerName
     *            {String} - name of the owner of the program
     *
     */
    function loadProgramFromListing(programName, ownerName, author, successFn) {
        COMM.json('/program/listing', {
            programName: programName,
            owner: ownerName,
            author: author,
        }, successFn, "load program '" + programName + "' owned by '" + ownerName + "'");
    }
    exports.loadProgramFromListing = loadProgramFromListing;
    /**
     * Load the program that to share with the gallery.
     *
     * @param programName
     *            {String} - name of the program
     * @param ownerName
     *            {String} - name of the owner of the program
     *
     */
    function loadProgramEntity(programName, author, ownerName, successFn) {
        COMM.json('/program/entity', {
            programName: programName,
            owner: ownerName,
            author: author,
        }, successFn, "load programEntity '" + programName + "' owned by '" + ownerName + "'");
    }
    exports.loadProgramEntity = loadProgramEntity;
    /**
     * Refresh program list
     */
    function refreshList(successFn) {
        COMM.json('/program/listing/names', {}, successFn, 'refresh program list');
    }
    exports.refreshList = refreshList;
    /**
     * Show source code of program.
     *
     * @param programName
     *            {String} - name of the program
     * @param configName
     *            {String } - name of the robot configuration
     * @param xmlTextProgram
     *            {String} - XML representation of the program
     * @param xmlTextConfig
     *            {String} - XML representation of the robot configuration
     * @param SSID
     *            {String} - WLAN SSID for WiFi enabled robots
     * @param password
     *            {String} - WLAN password for WiFi enabled robots
     */
    function showSourceProgram(programName, configName, xmlTextProgram, xmlTextConfig, SSID, password, language, successFn) {
        COMM.json('/projectWorkflow/source', {
            programName: programName,
            configurationName: configName,
            progXML: xmlTextProgram,
            confXML: xmlTextConfig,
            SSID: SSID,
            password: password,
            language: language,
        }, successFn, "show source code of program '" + programName + "'");
    }
    exports.showSourceProgram = showSourceProgram;
    /**
     * Run program
     *
     * @param programName
     *            {String} - name of the program
     * @param configName
     *            {String } - name of the robot configuration
     * @param xmlTextProgram
     *            {String} - XML representation of the program
     * @param xmlTextConfig
     *            {String} - XML representation of the robot configuration
     * @param SSID
     *            {String} - WLAN SSID for WiFi enabled robots
     * @param password
     *            {String} - WLAN password for WiFi enabled robots
     */
    function runOnBrick(programName, configName, xmlTextProgram, xmlTextConfig, SSID, password, language, successFn) {
        COMM.json('/projectWorkflow/run', {
            programName: programName,
            configurationName: configName,
            progXML: xmlTextProgram,
            confXML: xmlTextConfig,
            SSID: SSID,
            password: password,
            language: language,
        }, successFn, "run program '" + programName + "' with configuration '" + configName + "'");
    }
    exports.runOnBrick = runOnBrick;
    /**
     * Run program
     *
     * @param programName
     *            {String} - name of the program
     * @param configName
     *            {String } - name of the robot configuration
     * @param xmlTextProgram
     *            {String} - XML representation of the program
     * @param xmlTextConfig
     *            {String} - XML representation of the robot configuration
     */
    function runInSim(programName, configName, xmlTextProgram, xmlTextConfig, language, successFn) {
        COMM.json('/projectWorkflow/sourceSimulation', {
            programName: programName,
            configurationName: configName,
            progXML: xmlTextProgram,
            confXML: xmlTextConfig,
            language: language,
        }, successFn, "run program '" + programName + "' with configuration '" + configName + "'");
    }
    exports.runInSim = runInSim;
    /**
     * Run program from the source code editor
     *
     * @param programName
     *            {String} - name of the program
     * @param programText
     *            {String} - source code of the program
     */
    function runNative(programName, programText, language, successFn) {
        COMM.json('/projectWorkflow/runNative', {
            programName: programName,
            progXML: programText,
            language: language,
        }, successFn, "run program '" + programName + "'");
    }
    exports.runNative = runNative;
    /**
     * Compile geenrated source code
     *
     * @param programName
     *            {String} - name of the program
     * @param programText
     *            {String} - source code of the program
     *
     */
    function compileN(programName, programText, language, successFn) {
        COMM.json('/projectWorkflow/compileNative', {
            programName: programName,
            progXML: programText,
            language: language,
        }, successFn, "compile program '" + programName + "'");
    }
    exports.compileN = compileN;
    /**
     * Compile NEPO source code
     *
     * @param programName
     *            {String} - name of the program
     * @param programText
     *            {String} - source code of the program
     *
     */
    function compileP(programName, programText, language, successFn) {
        COMM.json('/projectWorkflow/compileProgram', {
            cmd: 'compileP',
            programName: programName,
            progXML: programText,
            language: language,
        }, successFn, "compile program '" + programName + "'");
    }
    exports.compileP = compileP;
    /**
     * Check program
     *
     * @param programName
     *            {String} - name of the program
     * @param configName
     *            {String } - name of the robot configuration
     * @param xmlTextProgram
     *            {String} - XML representation of the program
     * @param xmlTextConfig
     *            {String} - XML representation of the robot configuration
     */
    function checkProgramCompatibility(programName, configName, xmlTextProgram, xmlTextConfig, successFn) {
        COMM.json('/program', {
            cmd: 'checkP',
            programName: programName,
            configuration: configName,
            progXML: xmlTextProgram,
            confXML: xmlTextConfig,
        }, successFn, "check program '" + programName + "' with configuration '" + configName + "'");
    }
    exports.checkProgramCompatibility = checkProgramCompatibility;
    /**
     * Like or dislike a program from the gallery
     *
     * @param programName
     *            {String} - name of the program from the gallery
     *
     */
    function likeProgram(like, programName, author, robotName, successFn) {
        COMM.json('/program/like', {
            programName: programName,
            robotName: robotName,
            author: author,
            like: like,
        }, successFn, "like program '" + programName + "': '" + like + "'");
    }
    exports.likeProgram = likeProgram;
    function resetProgram(successFn) {
        COMM.json('/projectWorkflow/reset', {}, successFn, 'reset');
    }
    exports.resetProgram = resetProgram;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9tb2RlbHMvcHJvZ3JhbS5tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRzs7OztJQUlIOzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFTLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVM7UUFDckgsSUFBSSxDQUFDLElBQUksQ0FDTCxlQUFlLEVBQ2Y7WUFDSSxHQUFHLEVBQUUsUUFBUTtZQUNiLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFlBQVksRUFBRSxZQUFZO1lBQzFCLE9BQU8sRUFBRSxjQUFjO1lBQ3ZCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLEVBQ0QsU0FBUyxFQUNULHdDQUF3QyxHQUFHLFdBQVcsR0FBRyxHQUFHLENBQy9ELENBQUM7SUFDTixDQUFDO0lBc1pHLHNEQUFxQjtJQXBaekI7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNILFNBQVMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUztRQUNuSCxJQUFJLENBQUMsSUFBSSxDQUNMLGVBQWUsRUFDZjtZQUNJLEdBQUcsRUFBRSxNQUFNO1lBQ1gsV0FBVyxFQUFFLFdBQVc7WUFDeEIsWUFBWSxFQUFFLFlBQVk7WUFDMUIsT0FBTyxFQUFFLGNBQWM7WUFDdkIsVUFBVSxFQUFFLFVBQVU7WUFDdEIsT0FBTyxFQUFFLGFBQWE7WUFDdEIsU0FBUyxFQUFFLFNBQVM7U0FDdkIsRUFDRCxTQUFTLEVBQ1QsZ0JBQWdCLEdBQUcsV0FBVyxHQUFHLGFBQWEsQ0FDakQsQ0FB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