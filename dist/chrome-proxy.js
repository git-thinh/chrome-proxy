(function(exports) {
	if(typeof(exports.Proxy)==="undefined") {
		var oldDefineProperty = Object.defineProperty;
		["getPrototypeOf","setPrototypeOf","isExtensible","preventExtensions","getOwnPropertyDescriptor","defineProperty","getOwnPropertyNames","apply"].forEach(function(fname) {
			var oldf = Object[fname];
			Object[fname] = function() {
				var object = arguments[0];
				if(object instanceof Proxy) {
					//console.log(arguments)
					if(fname==="getOwnPropertyNames" && object.ownKeys) {
						return object.ownKeys(object.target);
					} else if(object[fname]) {
						 arguments[0] = object.target;
						 return object[fname].apply(object,args);
					}
					arguments[0] = object.target;
					return oldf.apply(Object,arguments);
				}
				return oldf.apply(Object,arguments);
			}
		});
		function Proxy(target,handler) {
			function addHandling(proxy,key,value) {
				var desc = {enumerable:true,configurable:true,writable:true,value:value};
				if(typeof(value)==="function") { // if it is a function, just call the proxied target version
					desc.value = function() {
						if(handler[key]) {
							return handler[key].apply(handler,arguments);
						} else {
							return target[key].apply(target,arguments);
						}
					}
				} else { // if it is a value, then create get and set to use the value on the proxied object, unless the handler has a trap or the value
					delete desc.value;
					delete desc.writable;
					desc.get = function() { 
						if(handler.get) {
							return handler.get(target,key,proxy); 
						} 
						if(Object.getOwnPropertyDescriptor(handler,key)) { // handler property masks target
							return handler[key];
						}
						return target[key];
					}
					desc.set = function(value) { 
						if(handler.set) { 
							return handler.set(target,key,value,proxy);
						}
						if(!Object.getOwnPropertyDescriptor(handler,key)) { // handler property stops value from passing down to target
							return target[key] = value;
						}
					}
				}
				oldDefineProperty.call(Object,proxy,key,desc);
				return true;
			}
			var proxy = this;
			Object.defineProperty(proxy,"target",{enumerable:false,configurable:false,writable:false,value:target});
			//override Object.prototype properties
			Object.defineProperty(proxy, '__lookupGetter__', {value: target.__lookupSetter__.bind(target)});
			Object.defineProperty(proxy, '__lookupSetter__', {value: target.__lookupSetter__.bind(target)});
			Object.defineProperty(proxy, '__defineGetter__', {value: target.__defineGetter__.bind(target)});
			Object.defineProperty(proxy, '__defineSetter__', {value: target.__defineSetter__.bind(target)});
			Object.defineProperty(proxy, 'toString', {value: target.toString.bind(target)});
			Object.defineProperty(proxy, 'valueOf', {value: target.valueOf.bind(target)});
			Object.defineProperty(proxy, '__proto__', {
				get: function() { return Object.getPrototypeOf(proxy); },
				set: function(val){ return Object.setPrototypeOf(proxy,value);	}
			});
			Object.defineProperty(proxy, 'hasOwnProperty', {value: function (property) {
				if (handler.has) {
					return handler.has(target, property);
				} else {
					return target.hasOwnProperty(property);
				}
			}});
			
			// add handling for everything in the target
			var proto = Object.getPrototypeOf(target);
			var keys = Object.getOwnPropertyNames(target).concat(Object.getOwnPropertyNames(proto));
			keys.forEach(function(key) {
				addHandling(proxy,key);
			});
			// add everything in the handler, possible overwriting things from the target
			for(var key in handler) {
				proxy[key] = handler[key];
			}
			// Observe the target for changes and update the handlers accordingly
			targetobserver = function (changeset) {
				changeset.forEach(function(change) {
					if(change.name!=="target") {
						if(change.type==="delete") {
							delete proxy[change.name];
						} else if(change.type==="update") { // update handler if target key value changes from function to non-function or from a non-function to a function
							if((typeof(change.oldValue)==="function" && typeof(target[change.name])!=="function") || (typeof(change.oldValue)!=="function" && typeof(target[change.name])==="function")) {
								addHandling(proxy,change.name,target[change.name]);
							}
						} else if(!proxy[change.name]) {
							addHandling(proxy,change.name,target[change.name]);
						}
					}
				})};
			Object.observe(target,targetobserver,["add","delete","update"]);
			// Observe the proxy for add/delete and set value on target, the target observer will add the handling
			var proxyobserver = function(changeset) {
				changeset.forEach(function(change) {
					if(change.name!=="target") {
						if(change.action==="delete") {
							if(proxy.deleteProperty) {
								proxy.deleteProperty(target,change.name);
							} else {
								delete target[change.name];
							}
						} else {
							target[change.name] = proxy[change.name];
						}
					}
				});
			}
			Object.observe(proxy,proxyobserver,["add","delete"]);
			// Observe the handler for add/delete/update and update the proxy, which may cascade to the target
			var handlerobserver = function(changeset) {
				changeset.forEach(function(change) {
					if(change.name!=="target") {
						addHandling(proxy,change.name);
					}
				});
			};
			Object.observe(proxy,proxyobserver,["add","update"]);
			return proxy;
		}
		exports.Proxy = Proxy;
	}
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);