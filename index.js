var _ = require('lodash');
var config = require('config');
var kue = require('kue');

var modules = config.get('MODULES');
var Modules = [];
var queues = {};

function installModule(Module) {
    Module.setupApp(app)
}

_.forEach(modules, function(moduleConfig){
    var require_path = moduleConfig.REQUIRE_PATH;
    var Module = require(require_path);
    Modules.push(Module)
    Module.configure(moduleConfig);
    Module.queues = queues;
    Module.createQueue(queues, kue);
})

_.forEach(Modules, function(Module){
    Module.setupApp(kue.app)
})

var app = kue.app
var port = config.get('PORT');
var host = config.get('HOST');
app.listen(port, host, function(){
    console.log('App listening at %s:%s', host, port)
})

_.forEach(Modules, function(Module){
    Module.start()
})