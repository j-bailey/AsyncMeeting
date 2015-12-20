# Git Process

This project uses the Gitflow process, so no development happens in master.  Only work done branched off of master is
hot fixes to production problems.  The develop branch is used for all feature development, while relase branches are used
for making final changes to a release.  More details are in the link below.

https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
  

# Set up

- Install docker, Node and NPM
- Reference Dockerfile to understand what additional items are required to run the software
- run `npm dev-preinstall`
- run `npm install`
- run `npm dev-postinstall`

# Run server for development

Ensure you have your NODE_ENV set to 'development'.  This will put the software in the correct state
run `npm run dev`

# Docker 



There is a build process, which processes client and server files, then puts them in the build folder. The Docker images
is created from the contents of the build folder.  This images defaults to NODE_ENV=production and as much as possible, 
it is set up for production.  The Asyncmeeting Docker image requires two additional imaages, one for Mongodb and one for 
Redis.

## Local Dev

Start with `npm run docker-dev-setup`, this will download the required docker images and run them locally.  Then run 
 `npm run docker-dev-build` to create the Asyncmeeting Docker image.  Then do `npm run docker-dev-run` to run the newly 
  built image locally.  Now you have the code running locally in Docker. 

To access the website host on your local Docker, use this command in unix to get the site IP:
`echo $DOCKER_HOST | cut -f 2 -d ":" | cut -f 3 -d "/"`
Then go to https://IP:3000 to interact with the site.  

To cleanup your Docker environment run `npm run docker-dev-cleanup-all`.  This will stop all the docker containers and 
remove them. This will not remove the images. 

# Testing

This project has three types of tests.
- Unit tests (server and client)
- Integration Tests (server and client)
- end-to-end (e2e) tests

Unit tests have no external dependencies to run including the files system, they run super fast, and only set a small unit of the system.  
Integration tests run locally, have no external dependencies, except for what the project can install add run locally, and tests multiple units together.
e2e tests is a realistic test using systems similar to production, but in some cases can run locally on the developer system.  
More details are available at [Google Testing Blog: Test Size](http://googletesting.blogspot.com/2010/12/test-sizes.html) or 
[Google Testing Blog: Just Say No to More End-to-End Tests](http://googletesting.blogspot.com/2015/04/just-say-no-to-more-end-to-end-tests.html)


## Running Tests
**NOTE:** Grunt tasks starts all external dependencies, so no need to start you own MongoDB server.

- To use the test configuration change the env to test.  This will do things like use the test.json configuration file
  which will point to a test instance of the database instead of the dev or production one.  `export NODE_ENV=test`
- `npm test` will run unit and if possible integration tests to include coverage for unit tests
- `npm run unit-tests:server` to run server unit tests 
- `npm run unit-tests:client` to run client unit tests
- `npm run e2e` to run end-to-end tests

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


# Logging
Client/AngularJS Logging
- Use the $log service.  This service can be injected into any controller, service, etc by adding $log to the 
  list of services.
- To use, instead of using console.log(), use $log.log(""), $log.debug(""), $log.info(""), $log.error(""), etc.
Server/NodeJS Logging
- Use the winston logger.
- In each JS file you need logging just do `var logger = require('winston')`
- Call the logger.  Ex. logger.debug(""), logger.error(""), logger.info(""), logger.log(""), etc.

