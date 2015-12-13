# chrome-proxy
An Object.observe based ES6 Proxy polyfill for Chrome

# Installation

npm install chrome-proxy

[![Codacy Badge](https://api.codacy.com/project/badge/grade/84821902325f4477b1797ca872232114)](https://www.codacy.com/app/syblackwell/chrome-proxy)

# Philosophy

Chrome used to have a proxy and it was abruptly removed over a year ago for unspecified security reasons. Proxies are useful. This is a development placeholder based on Object.observe until they become available again in early 2016. There is currently no plan to turn this into a robust long term implementation, particularly since Object.observe may disappear in 2016.

# Release History (reverse chronological order)

v0.0.5 2015-12-13 Corrected README

v0.0.4 2015-12-12 Codacy improvements, corrected error with setting __proxy__

v0.0.1 2015-11-07 Initial public release. No unit tests yet. Consider this an ALPHA.

# License

MIT License - see LICENSE file
