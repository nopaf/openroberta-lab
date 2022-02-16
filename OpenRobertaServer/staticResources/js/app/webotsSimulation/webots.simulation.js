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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "jquery", "guiState.controller"], function (require, exports, $, guiStateController) {
    var MODE = 'x3d';
    var BROADCAST = false;
    var StreamingViewer = /** @class */ (function () {
        function StreamingViewer(element, webots) {
            this.element = element;
            this.webots = webots;
        }
        StreamingViewer.prototype.connect = function (url, mobileDevice, readyCallback, disconnectCallback) {
            var _this = this;
            if (!this.view) {
                this.view = new this.webots.View(this.element, mobileDevice);
            }
            this.view.broadcast = BROADCAST;
            this.view.setTimeout(-1); // Disable timeout
            this.disconnectCallback = disconnectCallback;
            this.readyCallback = readyCallback;
            this.view.open(url, MODE);
            this.view.onquit = function () { return _this.disconnect(); };
            this.view.onready = function () {
                window.onresize = _this.view.onresize;
                _this.readyCallback();
            };
        };
        StreamingViewer.prototype.disconnect = function () {
            window.onresize = undefined;
            this.view.close();
            this.element.innerHTML = null;
            if (this.view.mode === 'mjpeg') {
                this.view.multimediaClient = undefined;
            }
            this.disconnectCallback();
        };
        StreamingViewer.prototype.hideToolbar = function () {
            var toolbar = this.getToolbar();
            if (toolbar) {
                if (toolbar.style.display !== 'none') {
                    toolbar.style.display = 'none';
                    $('#view3d').height('100%');
                    window.dispatchEvent(new Event('resize'));
                }
            }
        };
        StreamingViewer.prototype.showToolbar = function () {
            var toolbar = this.getToolbar();
            if (toolbar) {
                if (toolbar.style.display !== 'block')
                    toolbar.style.display = 'block';
                $('#view3d').height('calc(100% - 48px)');
                window.dispatchEvent(new Event('resize'));
            }
        };
        StreamingViewer.prototype.showQuit = function (enable) {
            this.webots.showQuit = enable;
        };
        StreamingViewer.prototype.showRevert = function (enable) {
            this.webots.showRevert = enable;
        };
        StreamingViewer.prototype.showRun = function (enable) {
            this.webots.showRun = enable;
        };
        StreamingViewer.prototype.sendMessage = function (message) {
            if (typeof this.view !== 'undefined' && this.view.stream.socket.readyState === 1)
                this.view.stream.socket.send(message);
        };
        StreamingViewer.prototype.getToolbar = function () {
            return this.element.querySelector('#toolBar');
        };
        return StreamingViewer;
    }());
    var WebotsSimulation = /** @class */ (function (_super) {
        __extends(WebotsSimulation, _super);
        function WebotsSimulation(element, webots) {
            var _this = _super.call(this, element, webots) || this;
            _this.connected = false;
            _this.volume = 0.5;
            return _this;
        }
        WebotsSimulation.prototype.uploadController = function (sourceCode) {
            var message = {
                name: 'supervisor',
                message: 'upload:' + sourceCode,
            };
            _super.prototype.sendMessage.call(this, 'robot:' + JSON.stringify(message));
        };
        WebotsSimulation.prototype.start = function (url, sourceCode) {
            var _this = this;
            this.sourceCode = sourceCode;
            if (this.connected) {
                return;
            }
            _super.prototype.connect.call(this, url, false, function () {
                _this.connected = true;
            }, function () {
                _this.connected = false;
            });
            _super.prototype.hideToolbar.call(this);
            this.initSpeechSynthesis();
            this.initSpeechRecognition();
            $('#webotsProgress').height('120px');
            var that = this;
            this.view.onstdout = function (text) {
                if (text.indexOf('finish') === 0) {
                    $('#simControl').trigger('click');
                }
                else if (text.indexOf('say') === 0) {
                    var data = text.split(':');
                    that.sayText(data);
                }
                else if (text.indexOf('setLanguage') === 0) {
                    var data = text.split(':');
                    that.lang = data[1];
                }
                else if (text.indexOf('setVolume') === 0) {
                    var data = text.split(':');
                    that.volume = parseInt(data[1]) / 100;
                }
                else if (text.indexOf('getVolume') === 0) {
                    var message = {
                        name: 'NAO',
                        message: 'volume:' + that.volume * 100,
                    };
                    that.sendMessage('robot:' + JSON.stringify(message));
                }
                else if (text.indexOf('recognizeSpeech')) {
                    that.recognizeSpeech();
                }
                else {
                    // console.log(text);  // enable this maybe for debugging
                }
            };
        };
        WebotsSimulation.prototype.reset = function () {
            _super.prototype.sendMessage.call(this, 'reset');
        };
        WebotsSimulation.prototype.pause = function () {
            this.view.runOnLoad = false;
            _super.prototype.sendMessage.call(this, 'pause');
        };
        WebotsSimulation.prototype.run = function (sourceCode) {
            this.sourceCode = sourceCode;
            this.view.runOnLoad = true;
            _super.prototype.sendMessage.call(this, 'pause');
            this.uploadController(sourceCode);
            _super.prototype.sendMessage.call(this, 'real-time:-1');
        };
        WebotsSimulation.prototype.initSpeechSynthesis = function () {
            this.SpeechSynthesis = window.speechSynthesis;
            //cancel needed so speak works in chrome because it's created already speaking
            this.SpeechSynthesis.cancel();
            if (!this.SpeechSynthesis) {
                this.context = null;
                console.log('Sorry, but the Speech Synthesis API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox');
            }
        };
        WebotsSimulation.prototype.sayText = function (data) {
            var text = data[1];
            var speed = data[2];
            var pitch = data[3];
            var lang = this.lang || guiStateController.getLanguage();
            // Prevents an empty string from crashing the simulation
            if (text === '')
                text = ' ';
            // IE apparently doesnt support default parameters, this prevents it from crashing the whole simulation
            speed = speed === undefined ? 30 : speed;
            pitch = pitch === undefined ? 50 : pitch;
            // Clamp values
            speed = Math.max(0, Math.min(100, speed));
            pitch = Math.max(0, Math.min(100, pitch));
            // Convert to SpeechSynthesis values
            speed = speed * 0.015 + 0.5; // use range 0.5 - 2; range should be 0.1 - 10, but some voices dont accept values beyond 2
            pitch = pitch * 0.02 + 0.001; // use range 0.0 - 2.0; + 0.001 as some voices dont accept 0
            var utterThis = new SpeechSynthesisUtterance(text);
            // https://bugs.chromium.org/p/chromium/issues/detail?id=509488#c11
            // Workaround to keep utterance object from being garbage collected by the browser
            window.utterances = [];
            window.utterances.push(utterThis);
            if (lang === '') {
                console.log('Language is not supported!');
            }
            else {
                var voices = this.SpeechSynthesis.getVoices();
                for (var i = 0; i < voices.length; i++) {
                    if (voices[i].lang.indexOf(this.lang) !== -1 || voices[i].lang.indexOf(lang.substr(0, 2)) !== -1) {
                        utterThis.voice = voices[i];
                        break;
                    }
                }
                if (utterThis.voice === null) {
                    console.log('Language "' +
                        lang +
                        '" could not be found. Try a different browser or for chromium add the command line flag "--enable-speech-dispatcher".');
                }
            }
            utterThis.pitch = pitch;
            utterThis.rate = speed;
            utterThis.volume = this.volume;
            var that = this;
            var message = {
                name: 'NAO',
                message: 'finish',
            };
            utterThis.onend = function (event) {
                that.sendMessage('robot:' + JSON.stringify(message));
            };
            //does not work for volume = 0 thus workaround with if statement
            if (this.volume != 0) {
                this.SpeechSynthesis.speak(utterThis);
            }
            else {
                this.sendMessage('robot:' + JSON.stringify(message));
            }
        };
        WebotsSimulation.prototype.initSpeechRecognition = function () {
            var SpeechRecognition = SpeechRecognition || window.webkitSpeechRecognition;
            var that = this;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = true;
                this.recognition.onresult = function (event) {
                    for (var i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            that.final_transcript += event.results[i][0].transcript;
                        }
                    }
                };
                this.recognition.onend = function () {
                    var message = {
                        name: 'NAO',
                        message: 'transcript:' + that.final_transcript,
                    };
                    that.sendMessage('robot:' + JSON.stringify(message));
                    this.stop();
                };
            }
        };
        WebotsSimulation.prototype.recognizeSpeech = function () {
            if (this.recognition) {
                this.final_transcript = '';
                this.recognition.lang = this.lang || guiStateController.getLanguage();
                this.recognition.start();
            }
            else {
                alert('Sorry, your browser does not support speech recognition. Please use the latest version of Chrome, Edge, Safari or Opera');
                var message = {
                    name: 'NAO',
                    message: 'transcript:' + '',
                };
                this.sendMessage('robot:' + JSON.stringify(message));
            }
        };
        return WebotsSimulation;
    }(StreamingViewer));
    function waitFor(predicate, interval, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var start;
            return __generator(this, function (_a) {
                start = Date.now();
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        function check() {
                            return setTimeout(function () {
                                if (predicate()) {
                                    resolve();
                                }
                                else if (Date.now() - start > timeout) {
                                    reject();
                                }
                                else {
                                    check();
                                }
                            }, interval);
                        }
                        check();
                    })];
            });
        });
    }
    var WebotsSimulationController = /** @class */ (function () {
        function WebotsSimulationController() {
            this.isPrepared = false;
        }
        WebotsSimulationController.prototype.init = function (sourceCode) {
            return __awaiter(this, void 0, void 0, function () {
                var webots, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            $('#simEditButtons, #canvasDiv, #simRobot, #simValues').hide();
                            $('#webotsDiv, #simButtons').show();
                            if (!!this.webotsSimulation) return [3 /*break*/, 6];
                            this.prepareWebots();
                            return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['webots'], resolve_1, reject_1); })];
                        case 1:
                            webots = (_a.sent()).webots;
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.wasmLoaded()];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _a.sent();
                            console.error('Could not load webots simulation', e_1);
                            return [2 /*return*/];
                        case 5:
                            this.webotsSimulation = new WebotsSimulation(WebotsSimulationController.createWebotsDiv(), webots);
                            _a.label = 6;
                        case 6:
                            this.webotsSimulation.start(guiStateController.getWebotsUrl(), sourceCode);
                            return [2 /*return*/];
                    }
                });
            });
        };
        WebotsSimulationController.prototype.run = function (sourceCode) {
            this.webotsSimulation.run(sourceCode);
        };
        WebotsSimulationController.prototype.resetPose = function () {
            this.webotsSimulation.reset();
        };
        WebotsSimulationController.prototype.stopProgram = function () {
            this.webotsSimulation.pause();
        };
        WebotsSimulationController.prototype.disconnect = function () {
            this.webotsSimulation.disconnect();
        };
        WebotsSimulationController.prototype.wasmLoaded = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, waitFor(function () { return window['Module']['asm']; }, 10, 1000)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WebotsSimulationController.prototype.prepareWebots = function () {
            if (!this.isPrepared) {
                WebotsSimulationController.loadCss();
                WebotsSimulationController.prepareModuleForWebots();
                this.isPrepared = true;
            }
        };
        WebotsSimulationController.createWebotsDiv = function () {
            var webotsDiv = document.querySelector('#webotsDiv');
            if (webotsDiv) {
                return;
            }
            webotsDiv = document.createElement('webots-streaming');
            webotsDiv.id = 'webotsDiv';
            document.getElementById('simDiv').prepend(webotsDiv);
            return webotsDiv;
        };
        WebotsSimulationController.loadCss = function () {
            var link = document.createElement('link');
            link.href = 'https://cyberbotics.com/wwi/R2021c/css/wwi.css';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        };
        WebotsSimulationController.prepareModuleForWebots = function () {
            if (!window.hasOwnProperty('Module')) {
                window['Module'] = [];
            }
            window['Module']['locateFile'] = function (path, prefix) {
                // if it's a data file, use a custom dir
                if (path.endsWith('.data'))
                    return window.location.origin + '/js/libs/webots/' + path;
                // otherwise, use the default, the prefix (JS file's dir) + the path
                return prefix + path;
            };
        };
        return WebotsSimulationController;
    }());
    return new WebotsSimulationController();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vib3RzLnNpbXVsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3dlYm90c1NpbXVsYXRpb24vd2Vib3RzLnNpbXVsYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFHQSxJQUFNLElBQUksR0FBRyxLQUFLLENBQUM7SUFDbkIsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBRXhCO1FBUUkseUJBQVksT0FBb0IsRUFBRSxNQUFNO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxpQ0FBTyxHQUFQLFVBQVEsR0FBRyxFQUFFLFlBQXFCLEVBQUUsYUFBdUIsRUFBRSxrQkFBNEI7WUFBekYsaUJBZ0JDO1lBZkcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDaEU7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtZQUU1QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7WUFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7WUFFbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQU0s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