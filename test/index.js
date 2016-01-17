var expect;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	Proxy = require('../index.js');
}


describe('Do Nothing Proxy', function() {
  var o = {property:"a"}, p = new Proxy(o,{});
  it('constructor ', function() {
	  expect(p instanceof Proxy).to.be.true;
  });
  it('get & set ', function() {
	  expect(p.property).to.equal("a");
	  p.property = "b";
	  expect(p.property).to.equal("b");
  });
  it('getPrototypeOf ', function() {
	  expect(Object.getPrototypeOf(p)===Object.getPrototypeOf(o)).to.be.true;
  });
  it('getOwnPropertyDescriptor ', function() {
	  var d1 = Object.getOwnPropertyDescriptor(p,"property");
	  var d2 = Object.getOwnPropertyDescriptor(o,"property");
	  expect(Object.keys(d1).every(function(key) { return d1[key]==d2[key]; })).to.be.true;
  });
});