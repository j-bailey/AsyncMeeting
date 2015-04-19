
# Set up
- install Mongodb
- install Redis
- run `npm install`

# Run server for development
run `npm run-script dev`

# Run tests
**NOTE:** Grunt tasks starts all external dependencies, so no need to start you own Redis and MongoDB server.

- To use the test configuration change the env to test.  This will do things like use the test.json configuration file
  which will point to a test instance of the database instead of the dev or production one.  `export NODE_ENV=test`
- For all tests `npm test`
- For server only tests `grunt mocha`
  - These tests use supertest which require the express app configured the way it would be if it were actually running.
    So this test uses test/server/support/api.js to wrap the app in a supertest object which is then use to create
    requests.
- e2e tests only `grunt e2e`

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

