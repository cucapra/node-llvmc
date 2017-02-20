import { LLVM } from './src/llvmc';

// Create a module.
let mod = LLVM.LLVMModuleCreateWithName("some_module");

// Add a function to the module.
let paramtypes = new Buffer(0);
let functype = LLVM.LLVMFunctionType(LLVM.LLVMInt32Type(), paramtypes, 0, 0);
let main = LLVM.LLVMAddFunction(mod, "main", functype);

// Add a single basic block to the function.
let entry = LLVM.LLVMAppendBasicBlock(main, "entry");

// Build a tiny program in the block.
let builder = LLVM.LLVMCreateBuilder();
LLVM.LLVMPositionBuilderAtEnd(builder, entry);
LLVM.LLVMDisposeBuilder(builder);

// Dump the IR as bitcode to disk.
let err = LLVM.LLVMWriteBitcodeToFile(mod, "out.bc");
if (err) {
  console.error("write failed", err);
}

// Write the IR as text to the console.
let ir = LLVM.LLVMPrintModuleToString(mod);
console.log(ir);

LLVM.LLVMDisposeModule(mod);
