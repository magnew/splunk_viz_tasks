var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var shell = require('shelljs');

var appRoot = process.cwd();

var splunkVizBuilder = {
    getAppTasks: function() {
        // Check for app context by looking for appserver directory
        if (!fs.statSync(path.join(appRoot, 'appserver')).isDirectory()){
            console.log('Error: no appserver directory found');
            return false;
        }
        return {
            getAppPaths: function() {
                return {
                    appRoot: appRoot,
                    vizPath: path.join(appRoot, 'appserver', 'static', 'visualizations')
                }
            },
            getVizDirNames: function(){
                var appPaths = this.getAppPaths();
                var visualizationDirectories = fs.readdirSync(appPaths.vizPath).filter(function(file) {
                    return fs.statSync(path.join(appPaths.vizPath, file)).isDirectory();
                });
                return visualizationDirectories;
            },
            listVisualizations: function() {
                console.log('Visualization packages found:');
                var visualizations = this.getVizDirNames();
                _.each(visualizations, function(viz){
                    console.log('-',viz);
                });
            },
            buildVisualizations: function() {
                console.log('Starting at root:', appRoot);

                var visualizationDirectories = this.getVizDirNames()

                _.each(visualizationDirectories, function(vizDir){
                    console.log('\n');

                    // Move to visualization directory
                    process.chdir(path.join(vizPath, vizDir));
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
        }
    },
    getSourceTasks: function() {
        return {
            listDir: function(){
                console.log('list');
            }
        }
    }    
};

module.exports = splunkVizBuilder;

