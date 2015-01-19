# nockturnal
A simplifying recorder for [nock](https://github.com/pgte/nock), the HTTP request mocker for node.

`nockturnal` is inspired by the nock recorder described by 
[Diana Thayer](https://orchestrate.io/blog/2014/06/13/how-to-test-code-that-uses-http-apis-using-node-js-mocha-and-nock/).

It simplifies the task to recording nock fixtures, optimizing to the case of pre-processing
the recording before writing fixtures and post-processing them before loading them up.

This is particularly useful when one wants to prevent leakage of sensitive information
like API keys, passwords and the like.

If you use other advanced features of nock, we still got you covered!


# Installing

    npm install nockturnal

# How to use

    // in test/test_file.js
    
    // all occurances of key1 will be replace with place_holder1 in the fixtures stored.
    var place_holders = {
            key1: place_holder1,
            key2: place_holder2
        },
        nockturnal = require("nockturnal")("app_name", {
            folders: {
                fixtures: "test/fixtures" // folder to find/store fixtures in
            },
            place_holders: {
                key1: place_holder1
            }
        });
    
    describe("my_app", function(){
        before(function() {
            nockturnal.before();
        });
    
        // ... your regular tests
    
        after(function(done) {
            nockturnal.after(done);
        });
    });


