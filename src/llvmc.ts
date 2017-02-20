import * as ffi from 'ffi';
import * as ref from 'ref';

// Some useful types.
let voidp = ref.refType(ref.types.void);  // Pointer to an opaque LLVM value.

export const LLVM = ffi.Library('libLLVM', {
  'LLVMModuleCreateWithName': [voidp, ['string']],
  'LLVMWriteBitcodeToFile':   ['int', [voidp, 'string']],
});
