// default

module.exports = {
    
    config: {},
    
    queues: {},
    
    configure: function(config) {
        this.config = config;
    },
    
    createQueue: function(queues, kue) {},
    
    setupApp: function(app) {},
    
    start: function() {},
    
    stop: function() {}
    
};