import * as llvmc from './src/llvmc';
import { LLVM } from './src/llvmc';

// Create a module.
let mod = llvmc.Module.create("some_module");

// Add a function to the module.
let paramtypes = new Buffer(0);
let functype = LLVM.LLVMFunctionType(LLVM.LLVMInt32Type(), paramtypes, 0,
                                     false);
let main = LLVM.LLVMAddFunction(mod.modref, "main", functype);

// Add a single basic block to the function.
let entry = LLVM.LLVMAppendBasicBlock(main, "entry");

// Build a tiny program in the block.
let builder = LLVM.LLVMCreateBuilder();
LLVM.LLVMPositionBuilderAtEnd(builder, entry);
let arg1 = LLVM.LLVMConstInt(LLVM.LLVMInt32Type(), 34, false);
let arg2 = LLVM.LLVMConstInt(LLVM.LLVMInt32Type(), 8, false);
let sum = LLVM.LLVMBuildAdd(builder, arg1, arg2, "sum");
LLVM.LLVMBuildRet(builder, sum);
LLVM.LLVMDisposeBuilder(builder);

// Dump the IR as bitcode to disk.
let err = LLVM.LLVMWriteBitcodeToFile(mod.modref, "out.bc");
if (err) {
  console.error("write failed", err);
}

// Write the IR as text to the console.
let ir = LLVM.LLVMPrintModuleToString(mod.modref);
console.log(ir);

mod.free();
