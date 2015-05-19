# Git Process

This project uses the Gitflow process, so no development happens in master.  Only work done branched off of master is
hot fixes to production problems.  The develop branch is used for all feature development, while relase branches are used
for making final changes to a release.  More details are in the link below.

https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
  

# Set up
- install Mongodb
- install Redis
- run `npm install`

# Run server for development
run `npm run dev`

# Testing

## Running Tests
**NOTE:** Grunt tasks starts all external dependencies, so no need to start you own Redis and MongoDB server.

- To use the test configuration change the env to test.  This will do things like use the test.json configuration file
  which will point to a test instance of the database instead of the dev or production one.  `export NODE_ENV=test`
- For all tests `npm test`
- For server only tests `grunt mocha`
  - These tests use supertest which require the express app configured the way it would be if it were actually running.
    So this test uses test/server/support/api.js to wrap the app in a supertest object which is then use to create
    requests.
- e2e tests only `grunt e2e`

## e2e Testing

### Developing e2e Tests

When developing e2e tests, use the base commands for quicker development.  

1. `export NODE_ENV=test`
2. `export PORT=3001`
3. `npm run dev`
6. In another terminal, run `grunt protractor:chrome` or `grunt protractor:firefox` to run tests, after making changes to the e2e test suite.  

**NOTE:** to run scenarios with specific tags add the following option `--cucumberOpts={\"tags\":\"@WIP\"}`.  This example
runs all the scenarios with the WIP tag.  

### Screen Shot Comparison of Screen Elements

e2e have a library available to do screen shot comparison of page elements.  This allows us to ensure the layout of the 
software does not break across various platforms and is not broken in the future.  This tool depends on ImageMagick being 
available, which provides the image comparison capability.  

For these types of tests to run, you first need to capture the images using a specific function in the image library.  
When you write a step requiring a screen shot comparison use the function named "createReferenceImageForElement" in your
step definition and run it on all the browsers available to the test suite.  The process requires the images to be 
captured for a specific type of browser on a specific type of system.  There is such a variance in browsers and systems, 
ImageMagick will pick up the difference, so the function takes this information into account and stores them in a folder
under test.  In addition, you can provide a function and sub-function name as a means to organize the reference images 
 and use that as a form of lookup during comparisons.  Therefore, you need to keep your function and sub-function combination
 unique. 
 
**NOTE:** Tag all screen shot comparison scenarios with the `@element_comparison`, as these are not run by default.
**NOTE:** Best to add element comparison after the UI is settled, not in the beginning.

Once you create all the pictures you replace the create function with the comparison function, "compareReferenceImageWithElementScreenShot".
This takes the Selenium element along with a few other arguments and creates the screen shot of the element and compares 
it with the reference image.  The comparison will return a value, zero means there is no difference between the screen shot
and the reference image.  Any value above zero is a measure the difference between the two images.

# Run server in production mode
- run `export NODE_ENV=production`
- run `npm start`

# Directories

-  /controllers - server controllers
-  /layouts - page layouts with Angular syntax processed by the client
-  /models - server models
-  /templates - Angular containers servered up by the server

-  /ng - client Angular code
-  /css - client css

-  /gulp - gulp task files
-  /assets - is the build area
-  /node_modules - node library files
-  /test - tests e2e, Angular unit and Node level testing

# Logging
Client/AngularJS Logging
- Use the $log service.  This service can be injected into any controller, service, etc by adding $log to the 
  list of services.
- To use, instead of using console.log(), use $log.log(""), $log.debug(""), $log.info(""), $log.error(""), etc.
Server/NodeJS Logging
- Use the winston logger.
- In each JS file you need logging just do `var logger = require('winston')`
- Call the logger.  Ex. logger.debug(""), logger.error(""), logger.info(""), logger.log(""), etc.

# Bugs

