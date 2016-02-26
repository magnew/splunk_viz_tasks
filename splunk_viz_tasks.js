var yargs = require('yargs');
vizBuilder = require('./splunk_viz_builder.js');

var argv = yargs.usage('$0 command')
    .command('list_viz', 'lists app visualization packages', function(yargs){
        var appTasks = vizBuilder.getAppTasks();
        if(appTasks){
            appTasks.listVisualizations();
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    .command('build_viz', 'builds app visualizations', function(yargs){
        var appTasks = vizBuilder.getAppTasks();
        if(appTasks){
            appTasks.buildVisualizations();
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    .demand(1, 'must provide a valid command')
    .help('h')
    .alias('h', 'help')
    .argv