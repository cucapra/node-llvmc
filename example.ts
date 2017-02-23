import * as llvmc from './src/llvmc';
import { LLVM } from './src/llvmc';

// Create a module.
let mod = llvmc.Module.create("some_module");

// Add a function to the module.
let paramtypes = new Buffer(0);
let functype = LLVM.LLVMFunctionType(LLVM.LLVMInt32Type(), paramtypes, 0,
                                     false);
let main = LLVM.LLVMAddFunction(mod.ref, "main", functype);

// Add a single basic block to the function.
let entry = LLVM.LLVMAppendBasicBlock(main, "entry");

// Build a tiny program in the block.
let builder = llvmc.Builder.create();
builder.positionAtEnd(entry);
let arg1 = builder.constInt32(34);
let arg2 = builder.constInt32(8);
let sum = builder.add(arg1, arg2, "sum");
builder.ret(sum);
builder.free();

// Dump the IR as bitcode to disk.
let err = mod.writeBitcodeToFile("out.bc");
if (err) {
  console.error("write failed", err);
}

// Write the IR as text to the console.
console.log(mod.toString());

mod.free();
