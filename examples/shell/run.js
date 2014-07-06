/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Runs SWF files
// USAGE: js ./run.js <swf-file> [<duration>]

load("./domstubs.js");

var SHUMWAY_ROOT = "../../src/";

/* Autogenerated parser references: base=../../ */
console.time("Load Parser Dependencies");
load("../../build/ts/base.js");
load("../../build/ts/tools.js");
console.timeEnd("Load Parser Dependencies");

console.time("Load SWF Parser");
load("../../build/ts/swf.js");
console.timeEnd("Load SWF Parser");

/* Autogenerated parser references end */

/* Autogenerated player references: base=../../ */
console.time("Load Player Dependencies");

console.time("Load Shared Dependencies");

// DUP: load("../../build/ts/base.js");
// DUP: load("../../build/ts/tools.js");

console.timeEnd("Load Shared Dependencies");

console.time("Load AVM2 Dependencies");
load("../../src/avm2/xregexp.js");
load("../../build/ts/avm2.js");
load("../../src/avm2/disassembler.js");
load("../../src/avm2/runtime-exports.js");
console.timeEnd("Load AVM2 Dependencies");

console.time("Load Compiled Code Cache");
console.timeEnd("Load Compiled Code Cache");

load("../../build/ts/player/module.js");

// Load Flash TS Dependencies
console.time("Load Flash TS Dependencies");
load("../../build/ts/flash.js");
console.timeEnd("Load Flash TS Dependencies");


// Load AVM1 Dependencies
console.time("Load AVM1 Dependencies");
load("../../build/ts/avm1.js");
console.timeEnd("Load AVM1 Dependencies");

load("../../build/ts/player/options.js");
load("../../build/ts/player/remotingPlayer.js");
load("../../build/ts/player/player.js");
load("../../build/ts/player/avmLoader.js");

console.timeEnd("Load Player Dependencies");

/* Autogenerated player references end */

/* Old style script arguments */
if (typeof scriptArgs === "undefined") {
  scriptArgs = arguments;
}

var swfPath = scriptArgs[0];
if (!swfPath) {
  throw new Error('SWF is not specified');
}

console.log('Running SWF: ' + swfPath);

var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;

load('./playerservices.js');

var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

function FakePlayer() {
  Shumway.Player.Player.call(this);
}
FakePlayer.prototype = Object.create(Shumway.Player.Player.prototype);
FakePlayer.prototype.onSendUpdates = function (updates, assets) {
  var bytes = updates.getBytes();
  // console.log('Updates sent');
};

function runSwfPlayer(data) {
  var sysMode = data.sysMode;
  var appMode = data.appMode;
  var asyncLoading = data.asyncLoading;
  var loaderURL = data.loaderURL;
  var movieParams = data.movieParams;
  var file = data.file;
  Shumway.createAVM2(builtinPath, playerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {
    function runSWF(file) {
      var player = new FakePlayer();
      player.load(file);
    }

    if (asyncLoading) {
      Shumway.FileLoadingService.instance.setBaseUrl(file);
      runSWF(file);
    } else {
      Shumway.FileLoadingService.instance.setBaseUrl(file);
      new BinaryFileReader(file).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(file, buffer);
      });
    }
  });
}

runSwfPlayer({
  sysMode: true ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET,
  appMode: true ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET,
  asyncLoading: true,
  file: swfPath
});

var runDuration = +scriptArgs[1] || 5000;
console.log('Running for ' + runDuration + 'ms...');
runMicroTaskQueue(runDuration);
console.log('Done.');
