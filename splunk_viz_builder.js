var fs = require('fs-extra');
var path = require('path');
var _ = require('underscore');
var shell = require('shelljs');
var ncp = require('ncp');

var splunkVizBuilder = {

    // App-level tasks
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
        process.chdir(appRootPath);

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

    // Source-level tasks
    _getAppDirNames: function(sourceRootPath) {
        // Filter for directories containing an appserver
        var appDirectories = fs.readdirSync(sourceRootPath).filter(function(file) {
            if (fs.statSync(file).isDirectory()) {
                if (fs.existsSync(path.join(file, 'appserver'))) {
                    return true;
                }
            }
        });
        return appDirectories
    },
    listAppDirectories: function(sourceRootPath) {
        console.log('Apps found:');
        var apps = this._getAppDirNames(sourceRootPath);
        _.each(apps, function(appName) {
            console.log('-', appName);
        });
    },
    buildAllVisualizations: function(sourceRootPath) {
        console.log('Building all visualizations');

        var appDirectories = this._getAppDirNames(sourceRootPath);
        _.each(appDirectories, function(appName){
            process.chdir(path.join(sourceRootPath, appName));
            
            console.log('Checking app:', process.cwd());
            if(!fs.existsSync('./package.json')){
                console.log('No package.json found in app' + appName + ', app skipped');
                return;
            }

            console.log('Building viz for app: ' + appName);
            shell.exec('npm install');
            shell.exec('npm run build_viz');

            process.chdir(sourceRootPath);
        }); 
    },
    buildApp: function(sourceRootPath, appName) {
        // Remove trailing '/'
        if(appName.substr(-1) === '/') {
            appName = appName.substr(0, appName.length - 1);
        }

        // Check app exists
        var appDirectories = this._getAppDirNames(sourceRootPath);
        if(!_.contains(appDirectories, appName)){
            console.log('Error: no app directory found for: ' + appName);
            return false;
        }
        console.log('Building app: ' + appName);

        var appSourcePath = path.join(sourceRootPath, appName);

        // Build app viz
        this.buildAllAppVisualizations(appSourcePath);
        process.chdir(sourceRootPath);

        // Create built directory if it doesn't exist
        var builtDirPath = path.join(sourceRootPath, 'built_apps');
        if(!fs.existsSync(builtDirPath)) {
            console.log('No build directory found, creating ' + builtDirPath);
            fs.mkdir(builtDirPath);
        }

        // Create a temp directory if it doesn't exist
        var tempDirPath = path.join(sourceRootPath, 'build_temp');
        if(!fs.existsSync(tempDirPath)) {
            console.log('Create temp app directory: ' + tempDirPath);
            fs.mkdir(tempDirPath);
        }

        console.log('Delete previous temp');
        fs.emptyDirSync(tempDirPath);
        
        console.log('Copy app');
        var tempAppPath = path.join(tempDirPath, appName);
        fs.mkdirSync(tempAppPath);
        fs.copySync(appSourcePath, tempAppPath);

        var packageName = appName + '.spl';
        var packagePath = path.join(tempDirPath, packageName)

        process.chdir(tempDirPath);
        console.log('Package: ' + packageName);
        shell.exec(
            "COPYFILE_DISABLE=1 tar cvfz " +
            packageName +
            " --exclude='metadata/local.meta' " +
            " --exclude='viz_test.xml' " +
            " --exclude='.*' " + 
            " --exclude='*/node_modules' " +
            " --exclude='*/local' " + 
            " --exclude='*/npm-debug.log' " + 
            " --exclude='*/visualization.js.map' "
            appName
        );
        process.chdir(sourceRootPath);

        console.log('Copy package to ' + builtDirPath);
        fs.copySync(packagePath, path.join(builtDirPath, packageName));

        fs.removeSync(tempDirPath);
    },

    buildAllApps: function(sourceRootPath) {   
        console.log('Building all apps');

        var appDirectories = this._getAppDirNames(sourceRootPath);
        _.each(appDirectories, function(appName){
            this.buildApp(sourceRootPath, appName);
        }, this);

        process.chdir(sourceRootPath);
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

        var that = this;
        return {
            listAppDirectories: function() {
                return that.listAppDirectories(sourceRoot); 
            },
            buildAllVisualizations: function() {
                return that.buildAllVisualizations(sourceRoot);
            },
            buildApp: function(appName) {
                return that.buildApp(sourceRoot, appName);
            },
            buildAllApps: function() {
                return that.buildAllApps(sourceRoot);
            }
        }
    }    
};

module.exports = splunkVizBuilder;

