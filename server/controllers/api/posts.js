var Post = require('../../../server/models/post');
var express = require('express');
var router = express.Router();
var websockets = require('../../../websockets')
var pubsub = require('../../../pubsub');

var sub = false;

router.post('/', function (req, res, next) {
    var post = new Post({body: req.body.body})
    post.username = req.auth.username
    post.save(function (err, post) {
        if (err) {
            return next(err)
        }
        //websockets.broadcast('new_post', post)
// called after a post in created in MongoDB
// the subscribe listens to a new_post event at any time
// subscribe takes a callback that will use our existing websockets.broadcast
        pubsub.publish('new_post', post);
        // function to send a message to the clients on the current process

        res.json(201, post)
    })
})

router.get('/', function (req, res, next) {
    Post.find().sort('-date').exec(function (err, posts) {
        if (err) {
            return next(err)
        }
        if (!sub) {
            pubsub.subscribe('new_post', function (post) {
                console.log("Posted")
                websockets.broadcast('new_post', post)
            })
            sub = true;
        }

        res.json(posts)
    });
    //    Post.find(function (err, posts) {
    //    if (err) {
    //        return next(err);
    //    }
    //    res.json(posts);
    //})
});

module.exports = router;
