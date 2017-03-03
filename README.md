node-llvmc
==========

These are bindings to the [LLVM C API][llvm-c] for [Node.js][], written in [TypeScript][] using [node-ffi][].


Using the Bindings
------------------

There are two ways to use the library: a low-level interface and a set of friendlier wrapper classes.

### Low-Level Bindings

To use the direct bindings to the LLVM C API functions, import the `LLVM` object from the `llvmc` module. You can invoke the C API functions as methods on this object.

```typescript
import { LLVM } from './src/llvmc';
let mod = LLVM.LLVMModuleCreateWithName("some_module");
// ...
let ir = LLVM.LLVMPrintModuleToString(mod);
console.log(ir);
LLVM.LLVMDisposeModule(mod);
```

This low-level module does not have TypeScript definitions (yet).

### Higher-Level Wrappers

This library also provides JavaScript object wrappers for LLVM objects. These wrappers *do* come with TypeScript types, which enable completion and static checking.

To use the higher-level interface, import the `wrapped` module.

```typescript
let mod = llvmc.Module.create("some_module");
// ...
console.log(mod.toString());
mod.free();
```


Other Projects
--------------

Here are the other LLVM bindings I could find:

* [llvm2](https://github.com/dirk/llvm2): Another FFI-based binding to the C API.
* [node-llvm](https://github.com/kevinmehall/node-llvm): Bindings using a compiled extension.
* [petard](https://github.com/couchand/petard): Another compiled extension, also focused on IR generation.

[llvm-c]: http://llvm.org/docs/doxygen/html/group__LLVMC.html
[node.js]: https://nodejs.org/en/
[typescript]: https://www.typescriptlang.org
[node-ffi]: https://github.com/node-ffi/node-ffi
