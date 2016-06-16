# Splunk Custom Visualizations

This repo contains individual app packages for the supported Splunk custom visualizations. Each visualization is contained within it's own app which, once installed, will make its single visualization available system wide. 

These visualizations are checked in here as developer source and must be built in order to run.

## Building
Once you close this repo, you will have to build apps and visualizations in order to run them on Splunk. Once built you can either copy the resulting directories to `$SPLUNK_HOME/etc/apps`, symlink them there or install the resulting.spl files.

### Prerequisites

This repo contains an NPM based build system and requires NPM, Splunk, and a `$SPLUNK_HOME` environment variable set in order to build. 

### Building an App
In order to get an installable `.spl` file for an app, you can run the build task for that app

```
$ npm run build_app <app_name>
```
The result will be placed in the `built_apps` directory

### Building all apps
You can build all apps into `.spl` files by running the build all task

```
$ npm run build_all_apps
```
The resulting `.spl` files will be placed in the `built_apps` directory

### Building All Visualizations
To build all visualizations in every app run the build task from the repository root:

```
$ npm run build_all_viz
```
This will take a little while the first time as it must pull in all npm dependencies for each app. It should run faster the second time.

### Building a Specific Visualization

You can build a specific visualization by moving to the that app directory and running the local build task from there:

```
$ cd <viz_app_directory>
$ npm install
$ npm run build_viz
```
## Issues
Note that this is a work in progress. If you can't get things to build, please contact **magnew@splunk.com**

