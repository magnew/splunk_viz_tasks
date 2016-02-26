var yargs = require('yargs');
vizBuilder = require('./splunk_viz_builder.js');

console.log('monkey');

var argv = yargs.usage('$0 command')
    .command('list_viz', 'lists app visualization packages', function(yargs){
        vizBuilder.listVisualizations();
    })
    .command('build_viz', 'builds app visualizations', function(yargs){
        vizBuilder.buildVisualizations();
    })
    .demand(1, 'must provide a valid command')
    .help('h')
    .alias('h', 'help')
    .argv