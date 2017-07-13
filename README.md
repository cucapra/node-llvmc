node-llvmc
==========

These are bindings to the [LLVM C API][llvm-c] for [Node.js][], written in [TypeScript][] using [node-ffi][].


Setting Up
----------

You will need an installation of LLVM that includes its shared library, which is called `libLLVM.so` or `libLLVM.dylib`. On macOS, for example, Xcode does not ship with the shared library, but the [Homebrew][] package for LLVM does. If you build LLVM yourself, set `LLVM_BUILD_LLVM_DYLIB=On` to get the shared library.

[Homebrew]: https://brew.sh

Next, the dynamic linker will need to be able to find the shared library. If you installed LLVM with Homebrew, for example, try this:

    $ export LD_LIBRARY_PATH=`brew --prefix llvm`/lib

to put the appropriate "keg-only" library directory on your linker path.
You should now be able to install and `require` the `llvmc` library.


Examples
--------

To test if everything is working, you can run the following command (and should see the following output):

```shell
node build/example.js
; ModuleID = 'some_module'

define i32 @main() {
entry:
  ret i32 42
}
```
For a more interesting example of how node-llmvc can be used, see our [Calculator example].


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
[LLVM Getting Started]: http://llvm.org/docs/GettingStarted.html
[Calculator example]: https://github.com/cucapra/node-llvmc/tree/master/example


Credits
-------

This is a project of [Capra][] at Cornell. It was written by [Adrian Sampson][adrian] and [Richie Henwood][richie]. The license is [MIT][].

[MIT]: https://opensource.org/licenses/MIT
[richie]: https://github.com/rhenwood39
[adrian]: http://www.cs.cornell.edu/~asampson/
[capra]: https://capra.cs.cornell.edu
