var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var shell = require('shelljs');

var splunkVizBuilder = {

    _getVisualizationsPath: function(appRootPath) {
        return path.join(appRootPath, 'appserver', 'static', 'visualizations')
    },
    _getVizDirNames: function(appRootPath) {
        var vizPath = this._getVisualizationsPath(appRootPath);

        var vizDirectories = fs.readdirSync(vizPath).filter(function(file) {
            return fs.statSync(path.join(vizPath, file)).isDirectory();
        });
        return vizDirectories;
    },
    listAppVisualizations: function(appRootPath) {
        console.log('Visualization packages found:');
        var visualizations = this._getVizDirNames(appRootPath);
        _.each(visualizations, function(viz){
            console.log('-',viz);
        });
    },
    buildAppVisualization: function (appRootPath, vizName){
        if (!_.contains(this._getVizDirNames(appRootPath), vizName)){
            console.log('Error: visualization ' + vizName + ' not found in app');
            return;
        }

        console.log('Building visualization ' + vizName);
        var vizDir = path.join(this._getVisualizationsPath(appRootPath), vizName);

        process.chdir(vizDir);
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

        process.chdir(appRootPath);
    },
    buildAllAppVisualizations: function(appRootPath) {
        console.log('Building all vizes under app root:', appRootPath);

        _.each(this._getVizDirNames(appRootPath), function(vizName){
            this.buildAppVisualization(appRootPath, vizName);
        }, this);

        console.log('Done building visualizations in app');
    },
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
    },
    buildApp: function(appName) {
        var appDirectories = this._getAppDirNames();
        if(!_.contains(appDirectories, appName)){
            console.log('Error: no app directory found for: ' + appName);
            return false;
        }
        console.log('Building app: ' + appName);

    },
    buildAllApps: function() {

    },

    // App tasks assume app context
    getAppTasks: function() {
        var appRoot = process.cwd();

        // Check for app context by looking for appserver directory
        if (!fs.statSync(path.join(appRoot, 'appserver')).isDirectory()) {
            console.log('Error: no appserver directory found');
            return false;
        }

        // We add an extra appRoot argument
        var that = this;
        return {
            listAppVisualizations: function() {
                return that.listAppVisualizations(appRoot);
            },
            buildAppVisualization: function(vizName) {
                return that.buildAppVisualization(appRoot, vizName);
            },
            buildAllAppVisualizations: function() {
                return that.buildAllAppVisualizations(appRoot);
            } 
        }
    },

    // Source tasks assume they are at the root of a tree containing apps
    getSourceTasks: function() {
        var sourceRoot = process.cwd();
        return {
            listAppDirectories: this.listAppDirectories,
            buildAllVisualizations: this.buildAllVisualizations,
            buildApp: this.buildApp,
            buildAllApps: this.buildAllApps
        }
    }    
};

module.exports = splunkVizBuilder;

