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
            console.log('No splunk app source found, bailing');
        }
    })
    .command('build_all_viz', 'lists visualization apps', function(yargs){
        var sourceTasks = vizBuilder.getSourceTasks();
        if(sourceTasks){
            sourceTasks.buildAllVisualizations();
        }
        else {
            console.log('No splunk app source found, bailing');
        }
    })
    .command('build_all_apps', 'builds a splunk app package for each app', function(yargs){
        var sourceTasks = vizBuilder.getSourceTasks();
        if(sourceTasks){
            sourceTasks.buildAllApps();
        }
        else {
            console.log('No splunk app source found, bailing');
        }
    })
    .command('build_app', 'builds a splunk app package', function(yargs){
        var sourceTasks = vizBuilder.getSourceTasks();
        if(sourceTasks) {
            var appName = yargs.argv._[1]
            if(appName) {
                sourceTasks.buildApp(appName);
            }
            else {
                console.log('Error: must specify an app');
            }
        }
        else {
            console.log('No splunk app source found, bailing');
        }
    })
    // App commands
    .command('list_app_viz', 'lists app visualization packages', function(yargs){
        var appTasks = vizBuilder.getAppTasks();
        if(appTasks){
            appTasks.listAppVisualizations();
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    .command('build_app_viz', 'builds app visualizations by name', function(yargs){
        var appTasks = vizBuilder.getAppTasks();
        if(appTasks) {
            var vizName = yargs.argv._[1];
            if(vizName){
                appTasks.buildAppVisualization(vizName);
            }
            else {
                console.log('No visualization specified, building all visualizations in app');
                appTasks.buildAllAppVisualizations()
            }
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    .command('build_all_app_viz', 'builds app visualizations', function(yargs){
        var appTasks = vizBuilder.getAppTasks();
        if(appTasks){
            appTasks.buildAllAppVisualizations();
        }
        else {
            console.log('This does not appear to be an app directory, bailing');
        }
    })
    .demand(1, 'must provide a valid command')
    .help('h')
    .alias('h', 'help')
    .argv