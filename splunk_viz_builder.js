var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var shell = require('shelljs');

var splunkVizBuilder = {

    listVisualizations: function() {
        var visulizations = fs.readdirSync(path.join('appserver', 'static', 'visualizations'));
        _.each(visulizations, function(viz){
            console.log(viz);
        });
    },
    buildVisualizations: function() {
        var appRoot = process.cwd();
        console.log('Starting at root:', appRoot);

        // Abs path to visualizations directory 
        var visulizationsPath = path.join(appRoot, 'appserver', 'static', 'visualizations');

        // Filter for directories
        var visulizationDirectories = fs.readdirSync(visulizationsPath).filter(function(file) {
            return fs.statSync(path.join(visulizationsPath, file)).isDirectory();
        });
        console.log('Visualization directories found:', visulizationDirectories);

        _.each(visulizationDirectories, function(vizDir){
            console.log('\n');

            // Move to visualization directory
            process.chdir(path.join(visulizationsPath, vizDir));
            console.log('Checking directory:', process.cwd());

            if(!fs.existsSync('./package.json')){
                console.log('No package.json found in ' + vizDir + ', visualization skipped');
                return;
            }

            if(!fs.existsSync('./webpack.config.js')){
                console.log('No webpack.config found in ' + vizDir + ', visualization skipped');
                return;
            }

            console.log('Building ' + vizDir);
            shell.exec('npm install');
            shell.exec('npm run build');

            process.chdir(appRoot);
        });
    }
};

module.exports = splunkVizBuilder;

