// scheduler

var kue = require('kue')
var _ = require('lodash');

module.exports = {
    
    config: {},
    
    queues: {},
    
    queue: null,
    isStarted: false,
    sites: [],
    
    configure: function(config) {
        this.config = config;
        _.forEach(config.SITES, this.addSite, this)
    },
    
    addSite: function(siteConfig) {
        this.sites.push(siteConfig);
    },
    
    getUpdateInterval: function() {
        return _(this.sites).pluck('updateInterval').min()
    },
    
    createQueue: function(queues, kue) {
        var scheduler = kue.createQueue()
        this.queue = queues.scheduler = scheduler
    },
    
    setupApp: function(app) {},
    
    start: function() {
        if (this.isStarted) {
            this.stop();
        }
        this.isStarted = true;
        var updateInterval = this.getUpdateInterval();
        this._interval = setInterval(this.update.bind(this), updateInterval);
        this.update();
    },
    
    stop: function() {
        this._interval = clearInterval(this._interval);
        this.isStarted = false;
    },
    
    update: function() {
        var updateInterval = this.getUpdateInterval();
        _.forEach(this.sites, function(site){
            var jobConfig = _.extend({}, site, {
                title: 'scheduled getching of: ' + site.startUri
            })
            var job = this.queue.create('fetch', jobConfig);
            job.ttl(updateInterval);
            job.attempts(site.attempts||1);
            job.backoff(site.backoff||true)
            job.save();
        }, this)
    },
    
    onError: function(error) {
        console.error(error);
        console.trace();
    }
    
};