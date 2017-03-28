node-llvmc
==========

These are bindings to the [LLVM C API][llvm-c] for [Node.js][], written in [TypeScript][] using [node-ffi][].

Getting Started
---------------

### System Requirements 
* LLVM Distribution with libLLVM.so
* Node.js
* npm
* TypeScript

### Set up
When setting up LLVM, make sure your installation comes with libLLVM.so. 

If you are installing LLVM with a package manager, it may or may not come with libLLVM.so. For example, Xcode does not; however, Homebrew provides the shared library by default. 

If you want to build LLVM by yourself, we recommend the [LLVM Getting Started] guide. When running CMake, make sure to set the following option: `LLVM_BUILD_LLVM_DYLIB=On`. This variable is what causes the build to generate libLLVM.so.

Once this is done, you may have to configure your search path to link to the directory containing libLLVM.so. For Mac users, the environment variable is named `DYLD_LIBRARY_PATH`. For Linux users, on the systems that we have tested, the environment variable is named `LD_LIBRARY_PATH`. For reference, here is the command we used to get everything configured on an Ubuntu system:

```shell
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:<Path to directory containing libLLVM.so>
```

At this point, you should be able install the necessary dependencies and build the project by running:

```shell
npm install
npm run build
```

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
