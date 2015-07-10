// bitcoinwarrior_net

var feedparser = require('node-feedparser');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports = {
    
    config: {},
    
    queues: {},
    
    configure: function(config) {
        this.config = config;
    },
    
    createQueue: function(queues, kue) {
        this.queue = queues.fetch;
        
    },
    
    setupApp: function(app) {},
    
    start: function() {
        var channel = this.config.channel;
        
        this.queue.process(channel, this.process.bind(this))
        
    },
    
    process: function(job, done) {
        var data = job.data;
        var resp = data.resp;
        var body = resp.body
        
        var filename = this.config.filename;
        var dirname = path.dirname(filename);
        mkdirp.sync(dirname);
        
        feedparser(body, function(err, feed){
            if (err != null) return done(err);
            var json = JSON.stringify(feed, null, 2);
            fs.writeFile(filename, json, {
                encoding: 'utf-8'
            }, done);
        });
    },
    
    stop: function() {}
    
};