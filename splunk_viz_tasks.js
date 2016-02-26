var yargs = require('yargs');
vizBuilder = require('./splunk_viz_builder.js');

var argv = yargs.usage('$0 command')
    // Source commands
    .command('list_apps', 'lists visualization apps', function(yargs){
        var sourceTasks = vizBuilder.getSourceTasks();
        if(sourceTasks){
            sourceTasks.listAppDirectories();
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    .command('build_all_viz', 'lists visualization apps', function(yargs){
        var sourceTasks = vizBuilder.getSourceTasks();
        if(sourceTasks){
            sourceTasks.buildAllVisualizations();
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    // App commands
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