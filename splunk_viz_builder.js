var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var shell = require('shelljs');

var splunkVizBuilder = {

    // App tasks assume app context
    getAppTasks: function() {
        var appRoot = process.cwd();
        // Check for app context by looking for appserver directory
        if (!fs.statSync(path.join(appRoot, 'appserver')).isDirectory()) {
            console.log('Error: no appserver directory found');
            return false;
        }
        return {
            _getAppPaths: function() {
                return {
                    appRoot: appRoot,
                    vizPath: path.join(appRoot, 'appserver', 'static', 'visualizations')
                }
            },
            _getVizDirNames: function() {
                var appPaths = this._getAppPaths();
                var visualizationDirectories = fs.readdirSync(appPaths.vizPath).filter(function(file) {
                    return fs.statSync(path.join(appPaths.vizPath, file)).isDirectory();
                });
                return visualizationDirectories;
            },
            listVisualizations: function() {
                console.log('Visualization packages found:');
                var visualizations = this._getVizDirNames();
                _.each(visualizations, function(viz){
                    console.log('-',viz);
                });
            },
            buildVisualizations: function() {
                var appPaths = this._getAppPaths();
                console.log('Starting at root:', appPaths.appRoot);

                var visualizationDirectories = this._getVizDirNames()

                _.each(visualizationDirectories, function(vizDir){
                    console.log('\n');

                    // Move to visualization directory
                    process.chdir(path.join(appPaths.vizPath, vizDir));
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
    // Source tasks assume they are at the root of a tree containing apps
    getSourceTasks: function() {
        var sourceRoot = process.cwd();
        return {
            _getAppDirNames: function() {
                // Filter for directories containing an appserver
                var appDirectories = fs.readdirSync(sourceRoot).filter(function(file) {
                    if (fs.statSync(file).isDirectory()) {
                        if (fs.existsSync(path.join(file, 'appserver'))) {
                            return true;
                        }
                    }
                });
                return appDirectories
            },
            listAppDirectories: function() {
                console.log('Apps found:');
                var apps = this._getAppDirNames();
                _.each(apps, function(appName) {
                    console.log('-', appName);
                });
            },
            buildAllVisualizations: function() {
                console.log('Building all visualizations');

                var appDirectories = this._getAppDirNames();
                _.each(appDirectories, function(appName){
                    process.chdir(path.join(sourceRoot, appName));
                    
                    console.log('Checking app:', process.cwd());
                    if(!fs.existsSync('./package.json')){
                        console.log('No package.json found in app' + appName + ', app skipped');
                        return;
                    }

                    console.log('Building viz for app: ' + appName);
                    shell.exec('npm install');
                    shell.exec('npm run build_viz');

                    process.chdir(sourceRoot);
                }); 
            }
        }
    }    
};

module.exports = splunkVizBuilder;

