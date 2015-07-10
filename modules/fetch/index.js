// fetch

var request = require('request');
var _ = require('lodash');

module.exports = {
    
    config: {},
    
    queues: {},
    
    scheduler: null,
    request: null,
    
    configure: function(config) {
        this.config = config;
        this.request = request.defaults(config.requestDefaults||{})
    },
    
    createQueue: function(queues, kue) {
        this.scheduler = queues.scheduler;
        
        var fetch = kue.createQueue();
        this.queue = queues.fetch = fetch;
    },
    
    setupApp: function(app) {},
    
    start: function() {
        var scheduler = this.scheduler;
        
        scheduler.process('fetch', this.processFetch.bind(this))
        
    },
    
    processFetch: function(job, done) {
        var self = this;
        
        var type = job.type;
        var data = job.data;
        var startUri = data.startUri;
        var channel = data.channel;
        
        this.request(startUri, function(error, resp, body) {
            if (error != null) return done(error);
            self.onResponse(data, resp, body, done);
        });
    },
    
    onResponse: function(data, resp, body, done) {
        var job = this.queue.create(data.channel, _.extend(data, {
            title: 'response from: ' + data.startUri,
            resp: {
                statusCode: resp.statusCode,
                status: resp.status,
                headers: resp.headers,
                body: body
            }
        }))
        var ttl, attempts, backoff;
        if (ttl = this.config.ttl) job.ttl(ttl);
        if (attempts = this.config.attempts) job.attempts(attempts);
        if (backoff = this.config.backoff) job.backoff(backoff);
        job.save();
        
        done()
    },
    
    stop: function() {}
    
};