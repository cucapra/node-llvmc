import * as ffi from 'ffi';
import * as ref from 'ref';

// Some useful types.
let voidp = ref.refType(ref.types.void);  // Pointer to an opaque LLVM value.
let void_ = ref.types.void;

export const LLVM = ffi.Library('libLLVM', {
  // Modules.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreModule.html
  'LLVMModuleCreateWithName': [voidp, ['string']],
  'LLVMCloneModule':          [voidp, [voidp]],
  'LLVMDisposeModule':        [void_, [voidp]],
  'LLVMGetDataLayout':        ['string', [voidp]],
  'LLVMSetDataLayout':        [void_, [voidp, 'string']],
  'LLVMGetTarget':            ['string', [voidp]],
  'LLVMSetTarget':            [void_, [voidp, 'string']],
  'LLVMDumpModule':           [void_, [voidp]],
  'LLVMPrintModuleToString':  ['string', [voidp]],
  'LLVMWriteBitcodeToFile':   ['int', [voidp, 'string']],
});
