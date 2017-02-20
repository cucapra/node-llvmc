import { LLVM } from './src/llvmc';

let mod = LLVM.LLVMModuleCreateWithName("some_module");
let err = LLVM.LLVMWriteBitcodeToFile(mod, "out.bc");
if (err) {
  console.error("write failed", err);
}
let ir = LLVM.LLVMPrintModuleToString(mod);
console.log(ir);
LLVM.LLVMDisposeModule(mod);
