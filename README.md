
# Build

# Directories

 /controllers - server controllers
 /layouts - page layouts with Angular syntax processed by the client
 /models - server models
 /templates - Angular containers servered up by the server

 /ng - client Angular code
 /css - client css

 /gulp - gulp task files
 /assets - is the build area
 /node_modules - node library files
 /test - tests e2e, Angular unit and Node level testing

# Bugs

## e2e Tests
Protractor tests are running slow, but running the developer server speeds them up.  Run the command before running the e2e tests.
```shell
gulp dev
```

