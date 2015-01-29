
# Set up
- run `npm install`
- run `bower install`
- run `./node_modules/.bin/webdriver-manager update`
- run `gulp css`
- install Mongodb
- install Redis

# Run server for development
- start redis server
- start mongodb
- run `gulp dev`

# Run tests
- For all tests `npm test`
- e2e tests only `./node_modules/.bin/protractor`
Protractor tests are running slow, but running the developer server speeds them up.  Run the command before running the e2e tests.
```shell
gulp dev 
```


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

# Bugs

