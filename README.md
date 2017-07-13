node-llvmc
==========

These are bindings to the [LLVM C API][llvm-c] for [Node.js][], written in [TypeScript][] using [node-ffi][].

[llvm-c]: http://llvm.org/doxygen/group__LLVMC.html
[node.js]: https://nodejs.org/en/
[typescript]: https://www.typescriptlang.org
[node-ffi]: https://github.com/node-ffi/node-ffi


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

This repository contains two examples. You can build them by cloning this repository and then running:

    $ cd node-llvmc
    $ yarn  # Install the dependencies.
    $ cd example
    $ tsc  # Compile the examples.

The first example is really simple, but it shows all the pieces you need to generate LLVM IR. Type this to see it in action:

    $ node build/example/basic.js

You'll see textual LLVM IR dumped to standard output, and the script will also write LLVM bitcode to a file `out.bc`. You can type `clang out.bc` to compile the program to native code and then `./a.out` to execute it.

We have also included a more complex example based on LLVM's venerable [Kaleidoscope][] tutorial.
See [the example's README](example/kaleidoscope/README.md) for an introduction.

[Kaleidoscope]: http://llvm.org/docs/tutorial/index.html


Using the Bindings
------------------

There are two ways to use the library: a low-level interface and a set of friendlier wrapper classes.

### Low-Level Bindings

To use the direct bindings to the LLVM C API functions, import the `LLVM` object from the `llvmc` module. You can invoke the [C API functions][capi] as methods on this object:

```typescript
import { LLVM } from 'llvmc';
let mod = LLVM.LLVMModuleCreateWithName("some_module");
// ...
let ir = LLVM.LLVMPrintModuleToString(mod);
console.log(ir);
LLVM.LLVMDisposeModule(mod);
```

This low-level interface does not have useful TypeScript annotations (yet).

### Higher-Level, Object-Oriented Interface

This library also provides ES2015 class wrappers for LLVM objects. These wrappers *do* come with TypeScript types, which enable completion and static checking. You can import these classes, such as `Module`, from the library:

```typescript
import * as llvmc from 'llvmc';
let mod = llvmc.Module.create("some_module");
// ...
console.log(mod.toString());
mod.free();
```

Someday, we will generate documentation for this suite of classes.


Other Projects
--------------

Here are the other LLVM bindings I could find:

* [llvm2](https://github.com/dirk/llvm2): Another FFI-based binding to the C API.
* [node-llvm](https://github.com/kevinmehall/node-llvm): Bindings using a compiled extension.
* [petard](https://github.com/couchand/petard): Another compiled extension, also focused on IR generation.


Credits
-------

This is a project of [Capra][] at Cornell. It was written by [Adrian Sampson][adrian] and [Richie Henwood][richie]. The license is [MIT][].

[MIT]: https://opensource.org/licenses/MIT
[richie]: https://github.com/rhenwood39
[adrian]: http://www.cs.cornell.edu/~asampson/
[capra]: https://capra.cs.cornell.edu
