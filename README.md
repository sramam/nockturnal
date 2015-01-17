# nockturnal
A simplyfying recorder for nock, the HTTP request mocker for node.

`nockturnal` is inspired by the nock recorder described by 
[Diana Thayer](https://orchestrate.io/blog/2014/06/13/how-to-test-code-that-uses-http-apis-using-node-js-mocha-and-nock/).

It simplifies the task to recording nock fixtures, optimizing to the case of pre-processing
the recording before writing fixtures and post-processing them before loading them up.

This is particularly useful when one wants to prevent leakage of sensitive information
like API keys, passwords and the like.

If you use other advanced features of nock, we still got you covered!




